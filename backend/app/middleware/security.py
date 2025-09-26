"""
Security Middleware for FRA Atlas
Enhanced security headers and protections
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
import logging
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"  
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        
        # HTTPS enforcement in production
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        response.headers["Content-Security-Policy"] = csp
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = self.get_client_ip(request)
        now = datetime.now()
        
        # Clean old requests
        cutoff = now - timedelta(seconds=self.window_seconds)
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip] 
            if req_time > cutoff
        ]
        
        # Check rate limit
        if len(self.requests[client_ip]) >= self.max_requests:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {self.max_requests} requests per {self.window_seconds} seconds",
                    "retry_after": self.window_seconds
                },
                headers={"Retry-After": str(self.window_seconds)}
            )
        
        # Add current request
        self.requests[client_ip].append(now)
        
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = max(0, self.max_requests - len(self.requests[client_ip]))
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int((now + timedelta(seconds=self.window_seconds)).timestamp()))
        
        return response
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address with proxy support"""
        # Check for forwarded headers (from load balancers/proxies)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log security-relevant requests"""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        client_ip = self.get_client_ip(request)
        
        # Log sensitive endpoints
        sensitive_paths = ["/api/documents/upload", "/api/auth/", "/admin/"]
        is_sensitive = any(path in str(request.url.path) for path in sensitive_paths)
        
        if is_sensitive:
            logger.info(
                f"Sensitive request: {request.method} {request.url.path}",
                extra={
                    "client_ip": client_ip,
                    "user_agent": request.headers.get("User-Agent", ""),
                    "method": request.method,
                    "path": request.url.path
                }
            )
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Log slow requests or errors
        if response.status_code >= 400 or process_time > 5.0:
            logger.warning(
                f"Request issue: {request.method} {request.url.path} - {response.status_code}",
                extra={
                    "client_ip": client_ip,
                    "status_code": response.status_code,
                    "process_time": process_time,
                    "method": request.method,
                    "path": request.url.path
                }
            )
        
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address with proxy support"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"


class FileUploadSecurityMiddleware(BaseHTTPMiddleware):
    """Additional security for file uploads"""
    
    def __init__(self, app, max_file_size: int = 50 * 1024 * 1024):  # 50MB
        super().__init__(app)
        self.max_file_size = max_file_size
        self.allowed_content_types = {
            'application/pdf',
            'image/jpeg',
            'image/png', 
            'image/tiff',
            'image/tif',
            'application/json',  # for GeoJSON
            'application/x-zip-compressed'  # for shapefiles
        }
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Check file upload endpoints
        if request.url.path.endswith("/upload") or "upload" in request.url.path:
            
            # Check content length
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_file_size:
                logger.warning(f"File too large: {content_length} bytes from {request.client.host}")
                return JSONResponse(
                    status_code=413,
                    content={
                        "error": "File too large",
                        "message": f"Maximum file size is {self.max_file_size // (1024*1024)}MB"
                    }
                )
            
            # Check content type if provided
            content_type = request.headers.get("content-type", "").split(";")[0].lower()
            if content_type and not any(allowed in content_type for allowed in self.allowed_content_types):
                logger.warning(f"Invalid content type: {content_type} from {request.client.host}")
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": "Invalid file type",
                        "message": "File type not allowed for upload"
                    }
                )
        
        return await call_next(request)
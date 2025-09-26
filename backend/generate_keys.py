#!/usr/bin/env python3
"""
Secure Key Generator for FRA Atlas
Generate cryptographically secure keys for production deployment
"""

import secrets
import string
import hashlib
from datetime import datetime


def generate_secret_key(length: int = 64) -> str:
    """Generate a cryptographically secure secret key"""
    return secrets.token_urlsafe(length)


def generate_api_key(prefix: str = "fra", length: int = 32) -> str:
    """Generate a secure API key with prefix"""
    key = secrets.token_hex(length)
    return f"{prefix}_{key}"


def generate_password(length: int = 16) -> str:
    """Generate a secure password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


def main():
    """Generate all required secure keys for production"""
    print("🔐 FRA Atlas - Production Key Generator")
    print("=" * 50)
    print(f"Generated on: {datetime.now().isoformat()}")
    print()
    
    # Secret key for JWT tokens
    secret_key = generate_secret_key(64)
    print("🔑 FastAPI SECRET_KEY (for JWT tokens):")
    print(f"SECRET_KEY={secret_key}")
    print()
    
    # Database password
    db_password = generate_password(20)
    print("🗄️  Database Password:")
    print(f"POSTGRES_PASSWORD={db_password}")
    print()
    
    # Redis password (if used)
    redis_password = generate_password(16)
    print("📦 Redis Password:")
    print(f"REDIS_PASSWORD={redis_password}")
    print()
    
    # RabbitMQ password (if used)  
    rabbitmq_password = generate_password(16)
    print("🐰 RabbitMQ Password:")
    print(f"RABBITMQ_PASSWORD={rabbitmq_password}")
    print()
    
    # API Keys for internal services
    internal_api_key = generate_api_key("fra_internal", 32)
    print("🔌 Internal API Key:")
    print(f"INTERNAL_API_KEY={internal_api_key}")
    print()
    
    print("⚠️  IMPORTANT SECURITY NOTES:")
    print("=" * 50)
    print("1. Store these keys securely in your deployment platform")
    print("2. Never commit these keys to version control")
    print("3. Use different keys for staging and production")
    print("4. Rotate keys regularly (every 90 days recommended)")
    print("5. Monitor for unauthorized access")
    print()
    
    print("🚀 Deployment Platform Instructions:")
    print("=" * 50)
    print("Vercel: Project Settings → Environment Variables")
    print("Railway: Project Settings → Variables")
    print("Render: Environment Variables section")
    print("Heroku: Config Vars in dashboard")
    print()
    
    print("✅ Copy the values above to your deployment platform")
    print("🗑️  This script output should be deleted after use")


if __name__ == "__main__":
    main()
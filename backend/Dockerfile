# FastAPI FRA Atlas - Production Docker Image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies for ML/geospatial processing
RUN apt-get update && apt-get install -y \
    # Basic build tools
    build-essential \
    gcc \
    g++ \
    # Geospatial libraries
    gdal-bin \
    libgdal-dev \
    proj-bin \
    libproj-dev \
    libgeos-dev \
    # Image processing
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    # OCR dependencies
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    # Other utilities
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better caching
COPY requirements-railway.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements-railway.txt

# Create uploads directory
RUN mkdir -p uploads models

# Copy application code
COPY . .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' --shell /bin/bash appuser \
    && chmod +x start-railway.sh \
    && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["./start-railway.sh"]
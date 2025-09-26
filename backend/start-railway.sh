#!/bin/bash

# Railway Start Script for FRA Atlas FastAPI Backend
# This script ensures proper environment variable setup before starting the application

echo "Starting FRA Atlas FastAPI Backend on Railway..."
echo "Python Version: $(python --version)"
echo "Working Directory: $(pwd)"

# Unset any problematic empty environment variables that Railway might set
unset PORT  # We don't use PORT anymore

# Check for empty ALLOWED_HOSTS and unset if empty to let pydantic use defaults
if [[ -z "$ALLOWED_HOSTS" || "$ALLOWED_HOSTS" == "" ]]; then
    unset ALLOWED_HOSTS
    echo "  ALLOWED_HOSTS: unset (will use default: [\"*\"])"
else
    echo "  ALLOWED_HOSTS: ${ALLOWED_HOSTS}"
fi

# Check for empty ALLOWED_ORIGINS and unset if empty
if [[ -z "$ALLOWED_ORIGINS" || "$ALLOWED_ORIGINS" == "" ]]; then
    unset ALLOWED_ORIGINS
    echo "  ALLOWED_ORIGINS: unset (will use default)"
else
    echo "  ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}"
fi

# Check for empty TARGET_STATES and unset if empty
if [[ -z "$TARGET_STATES" || "$TARGET_STATES" == "" ]]; then
    unset TARGET_STATES
    echo "  TARGET_STATES: unset (will use default: [\"*\"])"
else
    echo "  TARGET_STATES: ${TARGET_STATES}"
fi

# Set default environment variables if not provided
export ENVIRONMENT=${ENVIRONMENT:-production}
export DEBUG=${DEBUG:-false}
export LOG_LEVEL=${LOG_LEVEL:-INFO}

# Application settings
export PROJECT_NAME=${PROJECT_NAME:-"FRA Atlas API"}
export PROJECT_VERSION=${PROJECT_VERSION:-"1.0.0"}
export API_V1_STR=${API_V1_STR:-"/api/v1"}

# File upload settings
export UPLOAD_DIR=${UPLOAD_DIR:-"uploads"}
export MAX_FILE_SIZE_MB=${MAX_FILE_SIZE_MB:-"10"}

# Health check settings
export HEALTH_CHECK_PATH=${HEALTH_CHECK_PATH:-"/health"}

# Ensure upload directory exists
mkdir -p ${UPLOAD_DIR}

# Set Python path
export PYTHONPATH=/app:${PYTHONPATH}

echo "Environment Variables Set:"
echo "  ENVIRONMENT: ${ENVIRONMENT}"
echo "  DEBUG: ${DEBUG}"
echo "  LOG_LEVEL: ${LOG_LEVEL}"
echo "  PROJECT_NAME: ${PROJECT_NAME}"
echo "  API_V1_STR: ${API_V1_STR}"
echo "  UPLOAD_DIR: ${UPLOAD_DIR}"

# Start the application with gunicorn
echo "Starting Gunicorn server..."
exec gunicorn app.main:app \
    --bind 0.0.0.0:8000 \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 120 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload \
    --access-logfile - \
    --error-logfile - \
    --log-level ${LOG_LEVEL,,}
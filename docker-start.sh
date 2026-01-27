#!/bin/bash

# Receipt OCR Docker Quick Start Script
# This script helps you get started with Docker quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Receipt OCR - Docker Setup"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from .env.docker.example..."
    cp .env.docker.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${RED}IMPORTANT: Please edit the .env file and update the following:${NC}"
    echo "  - DATABASE_PASSWORD (use a strong password)"
    echo "  - JWT_ACCESS_SECRET (generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
    echo "  - JWT_REFRESH_SECRET (generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""
echo "======================================"
echo "Starting Docker containers..."
echo "======================================"
echo ""

# Check if we should use docker-compose or docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Build and start containers
$DOCKER_COMPOSE up -d --build

echo ""
echo "======================================"
echo "Waiting for services to be healthy..."
echo "======================================"
echo ""

# Wait for services to be healthy (max 2 minutes)
timeout=120
elapsed=0
interval=5

while [ $elapsed -lt $timeout ]; do
    if [ "$($DOCKER_COMPOSE ps -q | xargs docker inspect -f '{{.State.Health.Status}}' 2>/dev/null | grep -c healthy)" -eq 4 ]; then
        echo -e "${GREEN}✓ All services are healthy!${NC}"
        break
    fi
    echo "Waiting for services... ($elapsed/$timeout seconds)"
    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ $elapsed -ge $timeout ]; then
    echo -e "${YELLOW}⚠ Timeout waiting for services. Check status with: $DOCKER_COMPOSE ps${NC}"
    echo -e "${YELLOW}  View logs with: $DOCKER_COMPOSE logs${NC}"
fi

echo ""
echo "======================================"
echo "Running database migrations..."
echo "======================================"
echo ""

# Run migrations
$DOCKER_COMPOSE exec -T api npm run migration:run || echo -e "${YELLOW}⚠ Migration failed or no migrations to run${NC}"

echo ""
echo "======================================"
echo "✓ Setup Complete!"
echo "======================================"
echo ""
echo "Your Receipt OCR application is now running:"
echo ""
echo "  Frontend:  http://localhost"
echo "  API:       http://localhost/api"
echo "  API Docs:  http://localhost/api/docs"
echo ""
echo "Useful commands:"
echo "  View logs:        $DOCKER_COMPOSE logs -f"
echo "  Stop services:    $DOCKER_COMPOSE down"
echo "  Restart:          $DOCKER_COMPOSE restart"
echo "  Service status:   $DOCKER_COMPOSE ps"
echo ""
echo "For more information, see README.docker.md"
echo ""

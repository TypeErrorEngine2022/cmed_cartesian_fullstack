#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Database Migration Tool${NC}"

# Check for required environment variables
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_DATABASE" ]; then
    echo -e "${RED}Error: Database environment variables not set.${NC}"
    echo "Please set the following environment variables:"
    echo "  - DB_HOST"
    echo "  - DB_PORT"
    echo "  - DB_USERNAME" 
    echo "  - DB_PASSWORD"
    echo "  - DB_DATABASE"
    exit 1
fi

# Ensure we're in the backend directory
cd "$(dirname "$0")/backend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
npm run migration:run

echo -e "${GREEN}Database migration completed!${NC}"

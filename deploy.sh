#!/bin/bash

# Color codes for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Vercel...${NC}"

# Verify tools are installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI not found! Please install it with:${NC}"
    echo -e "npm install -g vercel"
    exit 1
fi

# Ensure we're in the root directory
cd "$(dirname "$0")"

# Deploy backend first
echo -e "${GREEN}Building and deploying backend...${NC}"
cd backend
npm install
npm run build

# Run deployment
echo -e "${YELLOW}Running Vercel deployment for backend...${NC}"
echo -e "${YELLOW}Note: When prompted, make sure to set all necessary environment variables.${NC}"
vercel

# Deploy frontend
echo -e "${GREEN}Building and deploying frontend...${NC}"
cd ../frontend
npm install

# Ask for backend URL
echo -e "${YELLOW}Enter the URL of your deployed backend (e.g. https://your-app-backend.vercel.app):${NC}"
read backend_url

# Create or update .env.production
echo "VITE_API_URL=$backend_url" > .env.production
echo "VITE_NICKNAME=Admin" >> .env.production

# Run deployment
echo -e "${YELLOW}Running Vercel deployment for frontend...${NC}"
vercel

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Remember to link your frontend and backend projects to your GitHub repository for automated deployments."
echo -e "You can do this from the Vercel dashboard or by using 'vercel link' in each directory."

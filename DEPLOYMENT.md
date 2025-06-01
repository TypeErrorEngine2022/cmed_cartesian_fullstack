# Deploying to Vercel

This document outlines the steps to deploy both the frontend and backend of your CMED Cartesian Plot application to Vercel.

## Prerequisites

1. A Vercel account (create one at [vercel.com](https://vercel.com) if you don't have one)
2. Vercel CLI installed (`npm install -g vercel`)
3. A PostgreSQL database (you can use Vercel Postgres, Supabase, or any other provider)

## Automated Deployment

We've created a script to simplify deployment. Just run:

```bash
./deploy.sh
```

This script will guide you through the deployment process.

## Manual Deployment Steps

## Deployment Steps

### 1. Database Setup

Set up your PostgreSQL database and make note of the connection details. You'll need to add these as environment variables in Vercel.

### 2. Install Vercel CLI and login

```bash
npm install -g vercel
vercel login
```

### 3. Deploy Backend

```bash
cd backend
npm install
npm run build
vercel
```

Follow the Vercel CLI prompts to deploy the backend. When asked about environment variables, input your database connection details and other environment variables from the `.env.example` file.

### 4. Deploy Frontend

```bash
cd ../frontend
npm install
vercel
```

When prompted, set the `VITE_API_URL` environment variable to your backend URL (the one you just deployed).

### 5. Link Projects (Optional)

If you want to set up a production deployment that automatically deploys from your Git repository:

```bash
cd ..
vercel link
```

This will link your local project to Vercel, allowing you to set up automatic deployments from Git.

### 6. Environment Variables

Make sure to set the following environment variables in your Vercel project dashboard:

#### Backend Environment Variables
- `JWT_SECRET` (generate a secure random string)
- `DB_HOST` (your PostgreSQL host)
- `DB_PORT` (usually 5432)
- `DB_USERNAME` (your database username)
- `DB_PASSWORD` (your database password)
- `DB_DATABASE` (your database name)
- `ADMIN_PASSWORD_HASH` (a bcrypt hash of your admin password)
- `CORS_ORIGIN` (your frontend URL)

#### Frontend Environment Variables
- `VITE_API_URL` (your backend URL)
- `VITE_NICKNAME` (optional, displayed in the UI)

### 7. Verify Deployment

Visit your frontend URL to verify that the application is working correctly. Check that:

- The login page works
- Data can be retrieved from the backend
- All CRUD operations work as expected

## Troubleshooting

- If you encounter CORS issues, verify that the `CORS_ORIGIN` environment variable in the backend is set correctly.
- If authentication fails, check that the `JWT_SECRET` is set correctly.
- If database connections fail, verify all database environment variables.
- For database SSL connection issues, make sure your host provider supports SSL and that you've set up SSL certificates correctly if required.

## Project Structure for Vercel

Your project has been configured for deployment with the following structure:

- Root level vercel.json: Configures the monorepo structure with separate deployments for frontend and backend
- Frontend vercel.json: Configures the routing for the frontend (Single-Page Application)
- Backend vercel.json: Configures the serverless function for the backend API

## Continuous Deployment

For continuous deployment from GitHub:

1. Push your code to a GitHub repository
2. In the Vercel dashboard, click on "Import Project"
3. Select "Import Git Repository" and connect to your GitHub account
4. Select the repository and configure the deployment settings
5. Configure environment variables
6. Deploy

## Important Notes

- The backend has been configured to run migrations automatically in production mode
- SSL is enabled for database connections in production mode
- Frontend uses environment variables to connect to the backend API
- CORS has been configured to allow connections between the frontend and backend

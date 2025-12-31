# Setup Guide

This guide will help you set up the React GraphQL E-Commerce Platform for local development and production deployment.

## Prerequisites

- **Node.js 20+** and npm/yarn
- **Docker** and Docker Compose (for local development)
- **PostgreSQL** (or use Docker)
- **Stripe Account** (for payment processing)
- **Git** (for version control)

## Local Development Setup

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reactjs-graphql-practice
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=sickfits
   
   # Backend
   JWT_SECRET=your-super-secret-jwt-token-change-in-production
   PRISMA_ENDPOINT=https://your-prisma-endpoint.com/your-service/prod
   PRISMA_SECRET=your-prisma-secret-key
   
   # Stripe
   STRIPE_SECRET=sk_test_your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_public_key
   
   # Email (for password reset)
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your-app-specific-password
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npm run prisma:migrate
   docker-compose exec backend npm run prisma:generate
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql
   - Prisma Studio: `docker-compose exec backend npm run prisma:studio`

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `variables.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sickfits?schema=public
   PRISMA_ENDPOINT=https://your-prisma-endpoint.com/your-service/prod
   PRISMA_SECRET=your-prisma-secret-key
   JWT_SECRET=your-super-secret-jwt-token
   FRONTEND_URL=http://localhost:3000
   STRIPE_SECRET=sk_test_your_stripe_secret_key
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your-app-specific-password
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   The GraphQL API will be available at http://localhost:4000/graphql

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_public_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:3000

## Production Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend` directory as the root
   - Configure environment variables:
     - `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: Your production GraphQL API URL
     - `NEXT_PUBLIC_STRIPE_KEY`: Your production Stripe public key

3. **Deploy via CLI**
   ```bash
   cd frontend
   vercel
   ```

### Backend Deployment (Railway/Render)

#### Railway

1. **Create a new project** on [railway.app](https://railway.app)
2. **Add PostgreSQL** service
3. **Add Node.js** service from GitHub
4. **Configure environment variables**:
   - `DATABASE_URL`: From PostgreSQL service
   - `JWT_SECRET`: Generate a secure random string
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `STRIPE_SECRET`: Your production Stripe secret key
   - Other required variables

5. **Deploy**

#### Render

1. **Create a new Web Service** on [render.com](https://render.com)
2. **Connect your GitHub repository**
3. **Configure**:
   - Build Command: `cd backend && npm install && npm run prisma:generate`
   - Start Command: `cd backend && npm start`
   - Environment: Node

4. **Add PostgreSQL database**
5. **Configure environment variables**
6. **Deploy**

### Database Setup

For production, you'll need to:

1. **Create a PostgreSQL database** (Railway, Render, or Supabase)
2. **Update DATABASE_URL** in your backend environment variables
3. **Run migrations**:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

## Environment Variables Reference

### Backend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT token signing | Yes | `your-secret-key-min-32-chars` |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | `https://your-app.vercel.app` |
| `STRIPE_SECRET` | Stripe secret key | Yes | `sk_live_...` |
| `MAIL_HOST` | SMTP server host | No | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP server port | No | `587` |
| `MAIL_USER` | SMTP username | No | `your-email@gmail.com` |
| `MAIL_PASS` | SMTP password | No | `your-password` |
| `PRISMA_ENDPOINT` | Prisma 1.x endpoint (legacy) | No | `https://...` |
| `PRISMA_SECRET` | Prisma 1.x secret (legacy) | No | `...` |

### Frontend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | GraphQL API URL | Yes | `https://api.yourapp.com/graphql` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe public key | Yes | `pk_live_...` |

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Verify network connectivity (Docker network)

### CORS Errors

- Ensure `FRONTEND_URL` matches your frontend domain
- Check backend CORS configuration

### Prisma Issues

- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations
- Use `npm run prisma:studio` to inspect database

### Docker Issues

- Ensure Docker is running
- Check container logs: `docker-compose logs`
- Restart services: `docker-compose restart`

## Next Steps

1. Review the [Refactoring Plan](./REFACTORING_PLAN.md) for modernization roadmap
2. Check the [README](./README.md) for GraphQL examples
3. Explore the GraphQL schema in `backend/src/schema.graphql`
4. Review resolver implementations in `backend/src/resolvers/`

## Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the refactoring plan for architecture details


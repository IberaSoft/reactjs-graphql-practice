# Docker Commands Quick Reference

## Basic Commands

### Start Services
```bash
# Start all services in detached mode
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands in Containers
```bash
# Run command in backend container
docker-compose exec backend npm run prisma:generate
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:studio

# Run command in frontend container
docker-compose exec frontend npm run build

# Access shell in container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Database Commands

### Prisma Commands
```bash
# Generate Prisma Client
docker-compose exec backend npx prisma generate

# Run migrations
docker-compose exec backend npx prisma migrate dev

# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Reset database (⚠️ deletes all data)
docker-compose exec backend npx prisma migrate reset
```

### PostgreSQL Direct Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d sickfits

# Backup database
docker-compose exec postgres pg_dump -U postgres sickfits > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres sickfits < backup.sql
```

## Development Workflow

### Rebuild After Changes
```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build backend

# Rebuild all services
docker-compose build
docker-compose up -d
```

### View Container Status
```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Inspect container
docker-compose inspect backend
```

### Clean Up
```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove everything (⚠️ careful!)
docker-compose down -v --rmi all
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Restart service
docker-compose restart backend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Database Connection Issues
```bash
# Check if database is healthy
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :4000
lsof -i :5432

# Kill process (replace PID)
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Clear Everything and Start Fresh
```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose rm -f
docker rmi $(docker images -q)

# Start fresh
docker-compose up -d --build
```

## Useful Aliases

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# Docker Compose aliases
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose restart'
alias dcb='docker-compose build'
alias dce='docker-compose exec'

# Project-specific aliases
alias sickfits-up='cd /path/to/reactjs-graphql-practice && docker-compose up -d'
alias sickfits-logs='cd /path/to/reactjs-graphql-practice && docker-compose logs -f'
alias sickfits-down='cd /path/to/reactjs-graphql-practice && docker-compose down'
```

## Health Checks

All services include health checks. Check status:

```bash
# Check all services health
docker-compose ps

# Health check should show "healthy" status
```

## Network Access

Services are on the `sickfits-network`:

- Frontend: http://localhost:3000
- Backend/GraphQL: http://localhost:4000/graphql
- PostgreSQL: localhost:5432 (from host), postgres:5432 (from containers)


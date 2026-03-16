# Complete Deployment Guide - Praxis Agent Carbon Platform

## Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Local Deployment](#local-deployment)
4. [Railway Deployment](#railway-deployment)
5. [Troubleshooting](#troubleshooting)
6. [Configuration](#configuration)

---

## Quick Start

### Option A: Local Development (Fastest)
```bash
# Start all services locally
docker-compose -f docker-compose.unified.yml up -d

# Access services
# Praxis Agent Carbon: http://localhost:50080
# Swarm: Available via MCP in Praxis Agent Carbon
# Database: localhost:5436
```

### Option B: Railway Deployment (Recommended for Production)
```bash
# Deploy to Railway (uses docker-compose.railway.yml)
railway up

# Railway will automatically:
# - Detect docker-compose.railway.yml
# - Deploy all services
# - Assign domains
# - Configure load balancers
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                           │
│  Praxis Agent Carbon (WebUI + SSH)                          │
│  Port: 50080 (local) / 80 (Railway)                   │
│                                                           │
│          ↓ MCP Connection (stdio)                               │
│                                                           │
│  Swarm (MCP Server)                                         │
│  Purpose: Agent orchestration & container spawning                 │
│  Privileged: Yes (Docker socket access)                        │
│                                                           │
│          ↓                                                  │
│                                                           │
│  Docker Swarm (Agent Containers)                               │
│  Each agent runs in isolated container                           │
│                                                           │
│                                                           │
│  PostgreSQL (Shared Database)                                  │
│  Image: ghcr.io/insforge/postgres:v15.13.2                 │
│  Port: 5432 / 5436                                          │
│  Schema: InsForge + Praxis Agent Carbon                        │
│                                                           │
│  ↑                                                    ↑    │
│  │                                                    │    │
│  InsForge Backend (Optional)                                 │
│  Status: ⚠️  Build issue - see INSFORGE_BUILD_ISSUE.md      │
│  Workaround: Use InsForge cloud service                          │
│                                                           │
│  PostgREST (API Layer)                                      │
│  Image: postgrest/postgrest:v12.2.12                          │
│  Port: 3000                                                │
│  Purpose: REST API for PostgreSQL                              │
│                                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Local Deployment

### Prerequisites

1. **Docker and Docker Compose**
```bash
# Verify installation
docker --version
docker-compose --version
```

2. **Git Repository**
```bash
cd /media/emt7/backup/CarbonAgent
```

3. **Environment Configuration**
```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

### Required Environment Variables

| Variable | Purpose | Default | Required |
|-----------|---------|---------|-----------|
| `POSTGRES_USER` | Database user | postgres | No |
| `POSTGRES_PASSWORD` | Database password | postgres | No |
| `POSTGRES_DB` | Database name | praxis_agent_carbon | No |
| `JWT_SECRET` | JWT signing secret | dev-secret-please-change-in-production | **Yes** |
| `TRIGGER_WORD` | Swarm trigger word | @Andy | No |
| `DEFAULT_MODEL` | Default LLM model | claude-opus-4-1-20250805 | No |

### Optional Environment Variables

| Variable | Purpose | Notes |
|-----------|---------|--------|
| `AGENTMAIL_API_KEY` | AgentMail.to API | Email processing |
| `ASPECT_API_KEY` | Aspect CRM | Business integration |
| `XERO_API_KEY` | Xero Accounting | Business integration |
| `MONDAY_API_KEY` | Monday.com | Project management |
| `PLANFUL_API_KEY` | Planful | Financial planning |
| `OPENROUTER_API_KEY` | OpenRouter API | LLM provider |
| AWS_* / S3_* | Storage credentials | S3-compatible storage |
| OAuth providers | Social auth | Google, GitHub, Discord, etc. |

### Starting Services

```bash
# Build images (first time only)
docker-compose -f docker-compose.unified.yml build

# Start all services
docker-compose -f docker-compose.unified.yml up -d

# View logs
docker-compose -f docker-compose.unified.yml logs -f

# Check service status
docker-compose -f docker-compose.unified.yml ps
```

### Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.unified.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.unified.yml down -v
```

### Accessing Services

| Service | URL | Credentials |
|----------|-----|-------------|
| Praxis Agent Carbon WebUI | http://localhost:50080 | None |
| PostgreSQL | localhost:5436 | postgres / postgres |
| Swarm | Via MCP in Praxis Agent Carbon | - |
| PostgREST API | http://localhost:5430 | API key required |

---

## Railway Deployment

### Prerequisites

1. **Railway Account**
   - Create account at https://railway.app
   - Free tier available ($5/month credit)
   - Paid tiers start at $20/month

2. **GitHub Repository**
   - Repository must be public or connected to Railway
   - Railway uses GitHub for deployment

3. **Environment Variables**
   - Railway will read from `.env.railway.example`
   - Set variables in Railway dashboard after deployment

### Deployment Process

#### Step 1: Prepare Code

```bash
# Ensure you're in the repository root
cd /media/emt7/backup/CarbonAgent

# Commit changes
git add .
git commit -m "Prepare for Railway deployment"
git push
```

#### Step 2: Connect to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway will detect `docker-compose.railway.yml`

#### Step 3: Configure Environment Variables

In Railway dashboard:

1. Click on each service
2. Go to "Variables" tab
3. Add required variables:

**Required for all services:**
```bash
JWT_SECRET=your-random-secret-string-here
POSTGRES_PASSWORD=secure-password-here
```

**Optional but recommended:**
```bash
OPENROUTER_API_KEY=your-openrouter-api-key
TRIGGER_WORD=@YourTriggerWord
```

#### Step 4: Deploy

Railway will automatically:
- Pull images from registry or build from Dockerfile
- Deploy services to Railway infrastructure
- Assign domains to each service
- Configure load balancers
- Start health checks

#### Step 5: Access Deployed Services

1. Go to Railway dashboard
2. Click on deployed service
3. Copy the domain URL
4. Access via browser

Example URLs:
```
praxis-agent-carbon-production.up.railway.app
praxis-swarm-production.up.railway.app
```

### Railway-Specific Configuration

#### Port Mappings

Railway automatically assigns ports. The `docker-compose.railway.yml` uses:

```yaml
ports:
  - "80:80"  # Maps Railway assigned port to container port 80
```

#### Volumes

Railway provides persistent storage:

```yaml
volumes:
  postgres-data:
    driver: local  # Railway-managed persistent volume
```

#### Health Checks

All services have health checks configured:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 5s
  retries: 5
```

Railway will:
- Monitor health status
- Restart services on failure
- Send alerts on repeated failures

#### Resource Limits

Railway free tier:
- 512MB RAM per service
- 1 CPU shared across services
- 1GB storage
- 500 hours/month runtime

Paid tiers provide more resources.

---

## Troubleshooting

### Common Issues

#### 1. Services won't start

**Symptom:**
```bash
docker-compose ps
# Shows services as "Exited" or "Restarting"
```

**Diagnosis:**
```bash
# Check logs for specific service
docker-compose logs postgres
docker-compose logs praxis-agent-carbon
docker-compose logs praxis-swarm
```

**Common causes:**
- Port conflicts (5436, 50080 already in use)
- Environment variables missing
- Database connection failed
- Docker daemon not running

**Solutions:**
```bash
# Fix port conflicts - modify .env or docker-compose.yml
# Verify environment variables are set
cat .env

# Check Docker daemon
docker info
sudo systemctl restart docker  # Linux
```

#### 2. Database connection errors

**Symptom:**
```
Error: connect ECONNREFUSED postgres:5436
```

**Diagnosis:**
```bash
# Check if PostgreSQL is healthy
docker exec praxis-postgres pg_isready -U postgres

# Check PostgreSQL logs
docker logs praxis-postgres
```

**Solution:**
```bash
# Restart database
docker-compose restart postgres

# Wait for health check
docker-compose ps
# Should show "healthy" after ~10 seconds
```

#### 3. Swarm MCP connection issues

**Symptom:**
- Swarm not appearing in Praxis Agent Carbon MCP server list
- MCP tools not available

**Diagnosis:**
```bash
# Check Swarm logs
docker logs praxis-swarm

# Verify Swarm is running
docker ps | grep swarm
```

**Solution:**
```bash
# Restart Swarm
docker-compose restart praxis-swarm

# Check MCP configuration
# In Praxis Agent Carbon, verify Swarm is registered:
# Settings → MCP Servers → Add Server
```

#### 4. InsForge build fails

**Symptom:**
```
Error: npm error Lifecycle script `build` failed
npm error path /app/shared-schemas
```

**Cause:**
- shared-schemas package.json has prepare script
- Runs TypeScript compilation during npm install
- Fails in Docker build environment

**Solution Options:**

**Option A: Use InsForge Cloud (Recommended)**
```bash
# Deploy core services only (docker-compose.railway.yml)
# Get InsForge cloud credentials
# Configure INSFORGE_MCP_URL and INSFORGE_MCP_TOKEN
```

**Option B: Skip InsForge Backend**
```bash
# Use ghcr.io/insforge/postgres image directly
# Use PostgREST API for database access
# Don't deploy praxis-insforge service
```

**Option C: Fix Dockerfile**
- See `INSFORGE_BUILD_ISSUE.md` for technical details
- Requires Dockerfile modifications and debugging

#### 5. Railway deployment fails

**Symptom:**
- Service stuck in "Building" state
- Build errors in Railway logs

**Diagnosis:**
```bash
# Check Railway service logs
# Click service → View logs
```

**Common causes:**
- GitHub repository not connected
- docker-compose.railway.yml not in repository root
- Docker build errors (similar to local builds)

**Solution:**
```bash
# Verify docker-compose.railway.yml exists in repository root
ls -la docker-compose.railway.yml

# Test build locally first
docker build -t praxis-agent-carbon:latest -f agent-zero/DockerfileLocalMinimal .

# Check Railway build logs for specific error
# Fix error, commit changes, Railway will auto-redeploy
```

### Advanced Troubleshooting

#### Inspect Container State

```bash
# Inspect container configuration
docker inspect praxis-agent-carbon

# Check container resources
docker stats praxis-agent-carbon

# Execute command in container
docker exec -it praxis-agent-carbon bash

# View container filesystem
docker exec praxis-agent-carbon ls -la /
```

#### Network Debugging

```bash
# Test service connectivity
docker exec praxis-agent-carbon ping postgres

# Check port bindings
docker port praxis-postgres

# List Docker networks
docker network ls

# Inspect network connections
docker network inspect praxis-network
```

#### Database Debugging

```bash
# Connect to PostgreSQL
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon

# List tables
\dt

# Check connections
SELECT * FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('praxis_agent_carbon'));
```

---

## Configuration

### Environment Files

#### Local: `.env`
Used by `docker-compose.unified.yml` for local deployment.

#### Railway: `.env.railway.example`
Template for Railway deployment. Variables set in Railway dashboard instead.

#### Docker Compose Files

| File | Purpose | Environment |
|------|---------|-------------|
| `docker-compose.unified.yml` | Full stack local deployment | `.env` |
| `docker-compose.railway.yml` | Core services Railway deployment | Railway dashboard |

### Service-Specific Configuration

#### Praxis Agent Carbon

```yaml
environment:
  - ENV=development
  - BRANCH=local
  - INSFORGE_MCP_URL=cloud-mcp.insforge.dev
  - INSFORGE_MCP_TOKEN=${INSFORGE_MCP_TOKEN}
  - AGENTMAIL_API_KEY=${AGENTMAIL_API_KEY}
  # ... more business integration keys
```

#### Swarm

```yaml
environment:
  - NODE_ENV=production
  - GROUP_FOLDER_PATH=/workspace/groups
  - GLOBAL_FOLDER_PATH=/workspace/global
  - IPC_PATH=/workspace/ipc
  - TRIGGER_WORD=@Andy
  - DEFAULT_MODEL=claude-opus-4-1-20250805
  - DATABASE_URL=postgresql://...
  - POSTGREST_BASE_URL=http://postgrest:3000
```

#### PostgreSQL

```yaml
environment:
  - POSTGRES_USER=${POSTGRES_USER:-postgres}
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
  - POSTGRES_DB=${POSTGRES_DB:-praxis_agent_carbon}
```

---

## Security Considerations

### Secrets Management

**Never commit secrets to git:**
```bash
# .gitignore already excludes:
.env
.env.local
*.pem
*.key
```

**Use Railway's environment variables:**
- More secure than files in repository
- Encrypted at rest
- Per-service isolation

**Rotate secrets regularly:**
```bash
# Generate new JWT secret
openssl rand -hex 32

# Update in Railway dashboard
# Services will auto-restart on secret change
```

### Network Security

**Praxis Agent Carbon:**
- Exposes WebUI on port 50080 (local) or 80 (Railway)
- SSH access on port 22 (if configured)
- MCP connection via stdio (local, no network exposure)

**Swarm:**
- No ports exposed (internal service)
- Communicates via Docker socket
- IPC files in `/workspace/ipc`

**PostgreSQL:**
- Port 5436 exposed internally only
- Use Railway's managed PostgreSQL for production
- Configure firewall rules as needed

### Container Security

**Praxis Agent Carbon:**
- Runs as non-root user in Docker
- Isolated filesystem
- No Docker socket access

**Swarm:**
- Runs as privileged container (required for Docker-in-Docker)
- Access to Docker socket for spawning agents
- Agents run in isolated containers

---

## Performance Tuning

### Resource Allocation

**Local Deployment:**
- Docker Desktop default: 2GB RAM, 2 vCPUs
- Monitor with: `docker stats`
- Increase if needed (Docker Desktop → Settings → Resources)

**Railway Deployment:**
- Free tier: 512MB per service
- Upgrade for more resources if needed
- Monitor usage in Railway dashboard

### Database Optimization

**PostgreSQL Configuration:**
```bash
# In deploy/docker-init/db/postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 64MB
maintenance_work_mem = 128MB
```

**Connection Pooling:**
- PostgREST manages connection pool
- Default: 10 connections per service
- Configure `PGRST_DB_POOL_SIZE` if needed

---

## Backup and Recovery

### Local Deployment

```bash
# Backup PostgreSQL
docker exec praxis-postgres pg_dump -U postgres praxis_agent_carbon > backup.sql

# Restore PostgreSQL
docker exec -i praxis-postgres psql -U postgres praxis_agent_carbon < backup.sql

# Backup volumes
docker run --rm -v praxis-memory:/data -v $(pwd):/backup \
  alpine tar czf /backup/memory-backup.tar.gz /data
```

### Railway Deployment

Railway provides automated backups for PostgreSQL:
- Daily backups included
- Point-in-time recovery available
- Configure in Railway dashboard

---

## Monitoring and Logging

### View Logs

**All services:**
```bash
docker-compose -f docker-compose.unified.yml logs -f
```

**Specific service:**
```bash
docker-compose logs praxis-agent-carbon
docker-compose logs praxis-swarm
docker-compose logs postgres
```

**Follow logs:**
```bash
docker logs -f praxis-agent-carbon
```

### Railway Monitoring

Railway dashboard provides:
- Real-time logs
- CPU/memory usage
- Uptime metrics
- Error rates
- Alert configuration

---

## Upgrades and Maintenance

### Update Images

```bash
# Pull latest images
docker-compose -f docker-compose.unified.yml pull

# Rebuild from source
docker-compose -f docker-compose.unified.yml build

# Restart with new images
docker-compose -f docker-compose.unified.yml up -d
```

### Migrate Database

```bash
# InsForge provides migrations via backend
# Run migrations after updates:
docker exec praxis-insforge npm run migrate:up

# Or via PostgREST:
# Migrations handled automatically on backend startup
```

---

## Getting Help

### Documentation
- `README.md` - Platform overview
- `DEPLOYMENT.md` - Deployment summary
- `CURRENT_STATUS.md` - Current project status
- `INSFORGE_BUILD_ISSUE.md` - InsForge build details

### Component Documentation
- `agent-zero/README.md` - Praxis Agent Carbon
- `nanoclaw/README.md` - Swarm
- `insforge/README.md` - InsForge

### Community Support
- GitHub Issues: https://github.com/your-org/CarbonAgent/issues
- Discord: [Community Server]
- Email: support@praxisagentcarbon.ai

---

## Quick Reference Commands

```bash
# Docker Compose
docker-compose -f docker-compose.unified.yml up -d      # Start services
docker-compose -f docker-compose.unified.yml down        # Stop services
docker-compose -f docker-compose.unified.yml logs -f    # View logs
docker-compose -f docker-compose.unified.yml ps         # Check status
docker-compose -f docker-compose.unified.yml restart [service]  # Restart service

# Docker
docker ps                                                 # List containers
docker logs [container]                                     # View logs
docker exec -it [container] bash                           # Execute command
docker stats                                                # Resource usage
docker system prune -f                                      # Clean up unused resources

# PostgreSQL
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon
```

---

**Last Updated:** March 16, 2026
**Version:** 1.0.0
**Status:** ✅ Core services ready, InsForge backend build issue documented

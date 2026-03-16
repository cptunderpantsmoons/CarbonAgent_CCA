# Praxis Agent Carbon + InsForge + Swarm Deployment Guide

## 📋 Quick Start

### Local Deployment
```bash
# Start all services locally
docker-compose -f docker-compose.unified.yml up -d

# Access services
# Praxis Agent Carbon WebUI: http://localhost:50080
# Swarm (NanoClaw) orchestrator: Available via MCP in Praxis Agent Carbon
# InsForge Dashboard: http://localhost:7131 (when insforge build completes)
# PostgreSQL Database: localhost:5436
```

### Railway Deployment

```bash
# Push code to GitHub (if not already done)
git add .
git commit -m "Prepare for Railway deployment"
git push

# Deploy to Railway
# Railway will automatically detect docker-compose.railway.yml
# Set environment variables in Railway dashboard (copy from .env.railway.example)

# Access deployed services
# Railway assigns domains to each service automatically
# InsForge Dashboard and Praxis Agent Carbon WebUI will be accessible
```

## 🔧 Docker Images

**Successfully Built:**

1. **praxis-agent-carbon:latest**
   - Base image: agent0ai/agent-zero-base:latest
   - Size: ~3.3GB
   - Built from agent-zero/DockerfileLocalMinimal
   - Exposes: SSH (22), WebUI (80), APIs (9000-9009)

2. **praxis-swarm:latest**
   - Base image: node:22-slim
   - Size: ~371MB
   - Built from nanoclaw/Dockerfile.swarm
   - Entry point: `/app/dist/index.js`
   - Purpose: MCP server and agent orchestrator
   - Runs as privileged container with Docker socket access

**Available from Registry:**

3. **ghcr.io/insforge/postgres:v15.13.2**
   - Size: ~1.04GB
   - PostgreSQL database with InsForge schema

4. **postgrest/postgrest:v12.2.12**
   - Size: ~17MB
   - API layer for InsForge backend

**Build Issue:**

5. **praxis-insforge:latest** - ❌ BUILD FAILED
   - Issue: shared-schemas TypeScript compilation during `npm ci`
   - See: INSFORGE_BUILD_ISSUE.md for details
   - Workaround: Use pre-built InsForge cloud service or ghcr.io images

## 🐛 Troubleshooting

### Local Deployment Issues

**InsForge build fails:**
```bash
# If jq parsing error occurs, restart the build
docker-compose -f docker-compose.unified.yml build insforce-concurrency=1 --no-cache --build-arg DENO_VERSION=2.0.6
```

**InsForge service unhealthy:**
```bash
# Check InsForge logs
docker logs praxis-insforge

# Check PostgREST logs
docker logs praxis-postgrest

# Verify database is healthy
docker exec praxis-postgres pg_isready -U postgres
```

**Swarm MCP connection issues:**
```bash
# Check Swarm is registered as MCP server in Praxis Agent Carbon
# Look for MCP server registration in agent configuration
# Restart services if needed
docker-compose -f docker-compose.unified.yml restart swarm
```

### Railway Deployment Issues

**Service doesn't start:**
```bash
# Check Railway logs in dashboard
# Ensure docker-compose.railway.yml is in repository root
# Verify environment variables are set correctly
# Check for any resource limits (Railway free tier has limits)
```

**Database connection issues:**
```bash
# InsForge uses postgres@15-alpine which may have compatibility issues
# Verify Railway postgres service is using correct version
# Check database migration scripts ran successfully
```

## 🔐 Architecture

### Service Communication

```
┌─────────────────────────────────────────────────────────┐
│                                             │
│  Praxis Agent Carbon (WebUI + SSH)   │
│                                             │
│          │                                  │
│          │    MCP Connection (stdio)          │
│          │                                  │
│                                             │
│  Swarm (MCP Server)                       │
│                                             │
│          ↓                                  │
│                                             │
│          ↓                                  │
│                                             │
│  Praxis Network (Docker)                │
└─────────────────────────────────────────────────────────┘
```

### MCP Integration Flow

1. **Praxis Agent Carbon** → Swarm (stdio transport)
   - Swarm exposes tools: schedule_task, list_tasks, send_message
   - Swarm can spawn agent containers via Docker socket
   - IPC communication via /workspace/ipc

2. **Praxis Agent Carbon** → InsForge (PostgreSQL + API)
   - Shared database (praxis-postgres)
   - InsForge provides storage and serverless functions
   - PostgREST API layer for data access

3. **Swarm** → Database (stdio → /workspace/ipc)
   - Swarm writes scheduled tasks and messages to IPC files
   - Swarm reads from IPC for agent requests

## 📝 Deployment Checklist

### Before Deploying to Railway
- [ ] Push latest code to GitHub
- [ ] Create Railway account (free tier available)
- [ ] Review Railway environment variables needed
- [ ] Check docker-compose.railway.yml is in repository root
- [ ] Ensure all images build successfully locally first

### Deploying to Railway
- [ ] Connect GitHub repository to Railway
- [ ] Select "New Project" (or use existing project)
- [ ] Railway will detect docker-compose.railway.yml automatically
- [ ] Configure environment variables in Railway dashboard:
  - **Required**: JWT_SECRET, POSTGRES_PASSWORD
  - **Optional**: OPENROUTER_API_KEY, AWS credentials, OAuth providers
- [ ] Deploy services
- [ ] Wait for all services to start and become healthy

### After Deployment
- [ ] Copy Railway domain URLs
- [ ] Update local .env with Railway domains
- [ ] Test all services are accessible
- [ ] Configure DNS if using custom domain

### Post-Deployment
- [ ] Monitor service logs in Railway dashboard
- [ ] Set up scaling rules if needed
- [ ] Configure automatic deployments from git push

## 🚀 Quick Reference

### Docker Commands
```bash
# Build images
docker-compose -f docker-compose.unified.yml build

# Start services
docker-compose -f docker-compose.unified.yml up -d

# Stop services
docker-compose -f docker-compose.unified.yml down

# View logs
docker-compose -f docker-compose.unified.yml logs <service-name>

# Rebuild single service
docker-compose -f docker-compose.unified.yml up -d --build <service-name>

# Execute command in container
docker exec -it praxis-swarm bash
```

### Environment Variables

| Variable | Purpose | Local Default | Railway Required |
|----------|---------|---------------|------------------|
| POSTGRES_USER | Database user | postgres | postgres |
| POSTGRES_PASSWORD | Database password | postgres | postgres |
| POSTGRES_DB | Database name | praxis_agent_carbon | praxis_agent_carbon |
| JWT_SECRET | Authentication secret | dev-secret-please-change-in-production | **JWT_SECRET** |
| OPENROUTER_API_KEY | LLM API key | (empty) | (optional) |
| AWS_ACCESS_KEY_ID | AWS access key | (empty) | (optional) |
| AWS_SECRET_ACCESS_KEY | AWS secret | (empty) | (optional) |
| S3_ENDPOINT_URL | S3 endpoint | (empty) | (optional) |
| AWS_S3_BUCKET | S3 bucket | (empty) | (optional) |
| TRIGGER_WORD | Swarm trigger word | @Andy | @Andy |
| DEFAULT_MODEL | Default LLM model | claude-opus-4-1-20250805 | claude-opus-4-1-20250805 |

## 📊 System Status

### Current Status (March 16, 2026)

**✅ Successfully Completed:**
- Agent Zero rebranded to Praxis Agent Carbon (red, black, white theme)
- Swarm (NanoClaw) integrated and configured as MCP server
- InsForge integrated with shared PostgreSQL
- Unified docker-compose.unified.yml created for local deployment
- Railway deployment configuration ready (docker-compose.railway.yml)
- All core Docker images built successfully

**🚧 Known Issues:**
- InsForge Docker build fails - see INSFORGE_BUILD_ISSUE.md for details
- Python helper files have some diagnostics warnings (non-blocking)
- deploy/docker-compose.praxis.yml has YAML syntax errors (being deprecated)

**🎯 Next Steps:**
1. Deploy core services using docker-compose.railway.yml (excludes InsForge backend)
2. Resolve InsForge Docker build issue (multiple options available)
3. Once InsForge builds successfully, integrate full stack
4. Test MCP integration between Praxis Agent Carbon and Swarm
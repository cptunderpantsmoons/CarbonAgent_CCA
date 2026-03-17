# AGENTS.md - Praxis Agent Carbon Platform Development Guide

This guide helps AI agents (and developers) work effectively in the Praxis Agent Carbon Platform codebase.

## Platform Overview

Praxis Agent Carbon Platform is an integrated system with three main components:

1. **Praxis Agent Carbon** - Command & Control Center (agent-zero/)
2. **Swarm** - Agent Orchestrator (nanoclaw/)
3. **InsForge** - Backend Infrastructure (insforge/)

All components share a PostgreSQL database and communicate via MCP (Model Context Protocol) and Docker.

---

## Quick Start Commands

### Local Development

```bash
# Start all services (recommended)
docker-compose -f docker-compose.unified.yml up -d

# View logs
docker-compose -f docker-compose.unified.yml logs -f

# Stop all services
docker-compose -f docker-compose.unified.yml down

# Rebuild specific service
docker-compose -f docker-compose.unified.yml up -d --build praxis-agent-carbon

# Check service status
docker-compose -f docker-compose.unified.yml ps
```

### Railway Deployment

```bash
# Deploy to Railway (uses docker-compose.railway.yml)
railway up

# View logs in Railway dashboard instead
```

---

## Component-Specific Commands

### Praxis Agent Carbon (agent-zero/)

**Technology:** Python 3.12, Flask, Socket.IO, LiteLLM

```bash
# Run tests
cd agent-zero && python -m pytest tests/ -v

# Run specific test
cd agent-zero && python -m pytest tests/test_websocket_manager.py -v

# Run with coverage
cd agent-zero && python -m pytest tests/ --cov=. --cov-report=html

# Check Python dependencies
cd agent-zero && pip list

# Format code (if black is installed)
cd agent-zero && black python/

# Type checking (if mypy is installed)
cd agent-zero && mypy python/
```

**Key Files:**
- `agent.py` - Main agent framework
- `run_ui.py` - Web UI server
- `python/` - Core tools and utilities
- `prompts/` - System prompts and templates
- `tests/` - pytest tests

### Swarm (nanoclaw/)

**Technology:** TypeScript, Node.js 20+, Better-SQLite3

```bash
# Development
cd nanoclaw && npm run dev          # Hot reload with tsx
cd nanoclaw && npm run build        # Compile TypeScript
cd nanoclaw && npm run start        # Run compiled version

# Testing
cd nanoclaw && npm run test         # Run vitest tests
cd nanoclaw && npm run test:watch   # Watch mode
cd nanoclaw && npm run test:ui      # Vitest UI

# Type checking
cd nanoclaw && npm run typecheck    # TypeScript type check

# Format code
cd nanoclaw && npm run format       # Prettier format
cd nanoclaw && npm run format:check # Check formatting

# Build agent container
cd nanoclaw && ./container/build.sh
```

**Key Files:**
- `src/index.ts` - Orchestrator: message loop, agent invocation
- `src/channels/registry.ts` - Channel registry
- `src/container-runner.ts` - Spawns agent containers
- `src/task-scheduler.ts` - Scheduled task execution
- `src/db.ts` - SQLite operations
- `groups/*/CLAUDE.md` - Per-group memory

### InsForge (insforge/)

**Technology:** TypeScript, Node.js, Express, PostgreSQL, Monorepo (npm workspaces)

```bash
# Development (all services)
cd insforge && npm run dev          # Start backend, frontend, auth
cd insforge && npm run dev:backend  # Backend only
cd insforge && npm run dev:frontend # Frontend only
cd insforge && npm run dev:auth     # Auth service only

# Building
cd insforge && npm run build        # Build all workspaces
cd insforge && npm run build:backend
cd insforge && npm run build:frontend
cd insforge && npm run build:auth

# Testing
cd insforge && npm run test         # Run all tests
cd insforge && npm run test:backend
cd insforge && npm run test:frontend
cd insforge && npm run test:e2e     # End-to-end tests

# Type checking
cd insforge && npm run typecheck    # Check all workspaces

# Database migrations
cd insforge && npm run migrate:up           # Run migrations
cd insforge && npm run migrate:down         # Rollback migration
cd insforge && npm run migrate:create       # Create new migration
cd insforge && npm run migrate:redo         # Redo last migration

# Linting/Formatting
cd insforge && npm run lint          # ESLint check
cd insforge && npm run lint:fix      # Auto-fix lint issues
cd insforge && npm run format        # Prettier format
cd insforge && npm run format:check  # Check formatting
```

**Key Files:**
- `backend/src/` - Backend API server
- `frontend/src/` - Frontend React app
- `auth/src/` - Authentication service
- `shared-schemas/` - Shared TypeScript schemas
- `functions/` - Deno serverless functions
- `backend/tests/` - Vitest tests

---

## Platform Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HUMAN OPERATORS                              │
│  WebUI (localhost:50080) | SSH | API Clients                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              Praxis Agent Carbon (Command & Control)            │
│  - Monitoring dashboard                                         │
│  - Exception handling                                           │
│  - Task orchestration                                           │
│  - Human interface (WebUI, SSH, CLI)                            │
└─────────────────────────────────────────────────────────────────┘
                    ↓ MCP (stdio transport)
┌─────────────────────────────────────────────────────────────────┐
│                    Swarm (MCP Server)                           │
│  - Agent container spawning                                     │
│  - Message routing                                              │
│  - Scheduled task execution                                     │
│  - IPC communication                                            │
└─────────────────────────────────────────────────────────────────┘
                    ↓ Docker socket
┌─────────────────────────────────────────────────────────────────┐
│              Docker Agent Containers                            │
│  - Isolated execution environments                              │
│  - Filesystem isolation                                         │
│  - Per-group context                                            │
└─────────────────────────────────────────────────────────────────┘

                    ↓ Shared Database Layer
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL (ghcr.io/insforge/postgres:v15.13.2)                │
│  Port: 5436 (local) | Port: 5432 (internal)                    │
│  - User data & sessions                                         │
│  - Agent configurations                                         │
│  - Memories & conversations                                     │
│  - Swarm groups & tasks                                         │
└─────────────────────────────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────────────────────────────┐
│  PostgREST (API Layer)                                         │
│  Port: 5430 (local) | Port: 3000 (internal)                    │
│  - REST API for PostgreSQL                                      │
│  - JWT authentication                                           │
│  - Schema: public                                               │
└─────────────────────────────────────────────────────────────────┘
                    ↑ (Optional - has build issues)
┌─────────────────────────────────────────────────────────────────┐
│  InsForge Backend (⚠️ Docker build issue)                       │
│  Port: 7130 (API) | Port: 7131 (UI)                            │
│  - User authentication                                          │
│  - Serverless functions (Deno)                                  │
│  - File storage (S3)                                            │
│  - OAuth providers                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Component Communication Patterns

**1. Praxis Agent Carbon → Swarm (MCP)**
- Transport: stdio (local), HTTP (remote)
- Protocol: MCP (Model Context Protocol)
- Tools exposed: schedule_task, list_tasks, send_message, spawn_agent

**2. Swarm → Agent Containers (Docker)**
- Mechanism: Docker-in-Docker (privileged container)
- Socket: /var/run/docker.sock
- Isolation: Filesystem mounts per container

**3. All Components → PostgreSQL (Direct)**
- Connection: tcp://postgres:5432
- ORM: None (raw SQL with pg/better-sqlite3)
- Migrations: node-pg-migrate (InsForge), manual (others)

**4. External Services → PostgREST (HTTP)**
- Protocol: REST/JSON
- Auth: JWT tokens
- Schema: public

---

## Key Configuration Files

### Docker Compose Files

| File | Purpose | Environment |
|------|---------|-------------|
| `docker-compose.unified.yml` | Full stack local deployment | `.env` |
| `docker-compose.railway.yml` | Core services for Railway | Railway dashboard |
| `docker-compose.local.yml` | Local development only | `.env` |
| `docker-compose.agent-zero.yml` | Agent Zero standalone | `.env` |

**Use `docker-compose.unified.yml` for local development.**

### Environment Variables

**Required Variables:**
```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=praxis_agent_carbon

# Security
JWT_SECRET=dev-secret-please-change-in-production
ENCRYPTION_KEY=your-encryption-key-here

# Swarm
TRIGGER_WORD=@Andy
DEFAULT_MODEL=claude-opus-4-1-20250805
```

**Optional Variables:**
```bash
# LLM Providers
OPENROUTER_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Storage (S3-compatible)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
S3_ENDPOINT_URL=https://s3.example.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-secret

# Business Integrations
AGENTMAIL_API_KEY=your-key
ASPECT_API_KEY=your-key
XERO_API_KEY=your-key
MONDAY_API_KEY=your-key
PLANFUL_API_KEY=your-key
```

### MCP Configuration

**Swarm MCP Server** (`nanoclaw/.mcp.json`):
```json
{
  "name": "swarm",
  "transport": "stdio",
  "command": "node",
  "args": ["/app/dist/index.js"],
  "env": {
    "GROUP_FOLDER_PATH": "/workspace/groups",
    "IPC_PATH": "/workspace/ipc"
  }
}
```

**Praxis Agent Carbon MCP Client** (configured in WebUI):
- Navigate to Settings → MCP Servers
- Add server with path to Swarm binary

---

## Important Development Notes

### InsForge Docker Build Issue

**Problem:** InsForge backend Docker build fails due to shared-schemas TypeScript compilation during `npm ci`.

**Workaround Options:**

1. **Use InsForge Cloud Service** (Recommended)
   - Deploy core services only (PostgreSQL, Agent Carbon, Swarm)
   - Configure InsForge cloud credentials in environment
   - Connect via API instead of local backend

2. **Use ghcr.io Images**
   - PostgreSQL: `ghcr.io/insforge/postgres:v15.13.2`
   - Skip InsForge backend service entirely
   - Use PostgREST API for database access

3. **Fix Dockerfile** (Advanced)
   - See `INSFORGE_BUILD_ISSUE.md` for technical details
   - Requires Dockerfile modifications and debugging

**Current Status:** Use `docker-compose.railway.yml` which excludes InsForge backend.

### Service Dependencies

**Startup Order:**
1. PostgreSQL (must be healthy first)
2. PostgREST (depends on PostgreSQL)
3. Swarm (depends on PostgreSQL)
4. Praxis Agent Carbon (no hard dependencies)
5. InsForge (optional, depends on PostgreSQL + PostgREST)

**Health Checks:**
- PostgreSQL: `pg_isready -U postgres`
- PostgREST: HTTP GET /
- Swarm: Check if process is running
- Praxis Agent Carbon: Check if WebUI is accessible

### Port Mappings

| Service | Internal Port | External Port (Local) | External Port (Railway) |
|---------|---------------|----------------------|------------------------|
| Praxis Agent Carbon WebUI | 80 | 50080 | 80 (auto-assigned) |
| Praxis Agent Carbon SSH | 22 | 22 | Not exposed |
| Swarm | 3000 | 3000 | Not exposed |
| PostgreSQL | 5432 | 5436 | Not exposed |
| PostgREST | 3000 | 5430 | Not exposed |
| InsForge API | 7130 | 7130 | 7131 (UI only) |
| InsForge UI | 7131 | 7131 | 7131 |

**Network:** All services communicate via `praxis-network` Docker bridge network.

---

## Testing and Debugging

### Running Tests

**Praxis Agent Carbon (Python):**
```bash
cd agent-zero
python -m pytest tests/ -v
python -m pytest tests/test_websocket_manager.py::TestClassName::test_method -v
```

**Swarm (TypeScript):**
```bash
cd nanoclaw
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:ui           # Interactive UI
```

**InsForge (TypeScript):**
```bash
cd insforge
npm run test              # Run all tests
npm run test:backend      # Backend tests only
npm run test:e2e          # End-to-end tests
```

### Viewing Logs

**All Services:**
```bash
docker-compose -f docker-compose.unified.yml logs -f
```

**Specific Service:**
```bash
docker logs praxis-agent-carbon -f
docker logs praxis-swarm -f
docker logs praxis-postgres -f
```

**Log Locations:**
- Praxis Agent Carbon: `agent-zero/logs/`
- Swarm: `nanoclaw/logs/`
- InsForge: `insforge-backend/logs/` (in container)

### Common Issues

**1. Services won't start**
```bash
# Check logs
docker-compose -f docker-compose.unified.yml logs

# Verify database is healthy
docker exec praxis-postgres pg_isready -U postgres

# Check port conflicts
netstat -tulpn | grep -E '(50080|5436|5430|7131)'
```

**2. Database connection errors**
```bash
# Test connection from inside container
docker exec -it praxis-agent-carbon bash
ping postgres
psql -h postgres -U postgres -d praxis_agent_carbon
```

**3. Swarm MCP connection issues**
```bash
# Check Swarm is running
docker ps | grep swarm

# Check Swarm logs
docker logs praxis-swarm

# Verify MCP configuration in Praxis Agent Carbon
# Settings → MCP Servers → Check Swarm entry
```

**4. Agent containers not spawning**
```bash
# Check Swarm has Docker socket access
docker exec praxis-swarm ls -la /var/run/docker.sock

# Check Swarm logs for errors
docker logs praxis-swarm | grep -i error

# Verify Docker daemon is running
docker info
```

### Debugging Tips

**Enable Debug Logging:**
```bash
# Praxis Agent Carbon
export DEBUG=1
docker-compose -f docker-compose.unified.yml up -d --force-recreate praxis-agent-carbon

# Swarm
export NODE_ENV=development
docker logs praxis-swarm --tail 100 -f
```

**Inspect Container State:**
```bash
docker inspect praxis-agent-carbon
docker exec -it praxis-agent-carbon bash
docker stats praxis-agent-carbon
```

**Database Debugging:**
```bash
# Connect to PostgreSQL
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon

# List tables
\dt

# Check connections
SELECT * FROM pg_stat_activity;

# View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Development Workflow

### Making Changes

1. **Edit code** in the appropriate component directory
2. **Test locally** using component-specific commands
3. **Rebuild Docker image** if needed:
   ```bash
   docker-compose -f docker-compose.unified.yml build <service>
   ```
4. **Restart service**:
   ```bash
   docker-compose -f docker-compose.unified.yml up -d <service>
   ```
5. **Verify changes** in logs and WebUI

### Component Modification Guidelines

**Praxis Agent Carbon:**
- Python files: Edit in `agent-zero/python/`
- Prompts: Edit in `agent-zero/prompts/`
- Tools: Add new tools in `agent-zero/python/tools/`
- WebUI: Edit in `agent-zero/webui/`

**Swarm:**
- TypeScript files: Edit in `nanoclaw/src/`
- Channels: Add in `nanoclaw/src/channels/`
- Skills: Add in `nanoclaw/.claude/skills/`
- Build: Run `npm run build` after changes

**InsForge:**
- Backend: Edit in `insforge/backend/src/`
- Frontend: Edit in `insforge/frontend/src/`
- Auth: Edit in `insforge/auth/src/`
- Build: Run `npm run build` in workspace root

### Adding New Features

**1. New Agent Tool (Praxis Agent Carbon):**
- Create file in `agent-zero/python/tools/your_tool.py`
- Import in `agent.py` or relevant handler
- Test with `python -m pytest tests/`

**2. New Channel (Swarm):**
- Create skill in `nanoclaw/.claude/skills/add-your-channel/`
- Implement channel interface
- Add self-registration in `nanoclaw/src/channels/registry.ts`
- Test with `npm run test`

**3. New API Endpoint (InsForge):**
- Add route in `insforge/backend/src/routes/`
- Add handler in `insforge/backend/src/handlers/`
- Update OpenAPI spec if needed
- Test with `npm run test:backend`

---

## Deployment

### Local Deployment

```bash
# Start all services
docker-compose -f docker-compose.unified.yml up -d

# Access services
# Praxis Agent Carbon: http://localhost:50080
# Swarm: Available via MCP in Praxis Agent Carbon
# PostgreSQL: localhost:5436
```

### Railway Deployment

```bash
# Deploy to Railway
railway up

# Set environment variables in Railway dashboard
# Required: JWT_SECRET, POSTGRES_PASSWORD
# Optional: OPENROUTER_API_KEY, AWS credentials, etc.

# Access deployed services
# Railway assigns domains automatically
# Example: praxis-agent-carbon-production.up.railway.app
```

**Important:** Railway uses `docker-compose.railway.yml` which excludes InsForge backend due to build issues.

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

### Database Optimization

**PostgreSQL Configuration** (in `deploy/docker-init/db/postgresql.conf`):
```ini
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

## Security Considerations

### Secrets Management

**Never commit secrets to git:**
```bash
# .gitignore excludes:
.env
.env.local
*.pem
*.key
```

**Use environment variables:**
- Local: `.env` file (gitignored)
- Railway: Railway dashboard (encrypted at rest)

**Rotate secrets regularly:**
```bash
# Generate new JWT secret
openssl rand -hex 32

# Update in .env or Railway dashboard
# Services will auto-restart on secret change
```

### Container Security

**Praxis Agent Carbon:**
- Runs as non-root user
- Isolated filesystem
- No Docker socket access

**Swarm:**
- Runs as privileged container (required for Docker-in-Docker)
- Access to Docker socket for spawning agents
- Agents run in isolated containers

**PostgreSQL:**
- Port 5436 exposed internally only
- Use Railway's managed PostgreSQL for production
- Configure firewall rules as needed

---

## Quick Reference

### Essential Commands

```bash
# Start everything
docker-compose -f docker-compose.unified.yml up -d

# Stop everything
docker-compose -f docker-compose.unified.yml down

# View logs
docker-compose -f docker-compose.unified.yml logs -f

# Rebuild service
docker-compose -f docker-compose.unified.yml build <service>

# Run tests
cd agent-zero && python -m pytest tests/
cd nanoclaw && npm run test
cd insforge && npm run test

# Database migrations
cd insforge && npm run migrate:up

# Check service status
docker-compose -f docker-compose.unified.yml ps
```

### Key File Locations

| Component | Main Files | Config | Tests |
|-----------|-----------|--------|-------|
| Praxis Agent Carbon | `agent.py`, `run_ui.py` | `.env`, `prompts/` | `tests/` |
| Swarm | `src/index.ts` | `.mcp.json` | `src/*.test.ts` |
| InsForge | `backend/src/server.ts` | `.env.example` | `backend/tests/` |

### Important URLs

| Service | Local URL | Railway URL |
|---------|-----------|-------------|
| Praxis Agent Carbon | http://localhost:50080 | *.up.railway.app |
| Swarm | Via MCP | Via MCP |
| InsForge UI | http://localhost:7131 | *.up.railway.app |
| PostgREST API | http://localhost:5430 | Internal |

---

## Getting Help

### Documentation
- `README.md` - Platform overview
- `ARCHITECTURE.md` - Detailed architecture diagrams
- `DEPLOYMENT.md` - Deployment summary
- `CURRENT_STATUS.md` - Current project status

### Component Documentation
- `agent-zero/README.md` - Praxis Agent Carbon
- `nanoclaw/README.md` - Swarm
- `insforge/README.md` - InsForge

### Troubleshooting
- `INSFORGE_BUILD_ISSUE.md` - InsForge build details
- `TROUBLESHOOTING.md` - Common issues and solutions
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Detailed deployment guide

---

## Architecture Principles

1. **Separation of Concerns:** Each component has a distinct responsibility
2. **Loose Coupling:** Components communicate via well-defined interfaces (MCP, REST API)
3. **Isolation:** Agents run in isolated containers for security
4. **Scalability:** Each component can be scaled independently
5. **Transparency:** All communication is logged and observable

---

**Last Updated:** March 16, 2026
**Platform Version:** 1.0.0
**Status:** Core services ready for production

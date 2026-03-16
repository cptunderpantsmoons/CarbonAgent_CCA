# Praxis Agent Carbon Platform

<div align="center">
  <h1>🤖 Praxis Agent Carbon Platform</h1>
  <p>Autonomous email processing and carbon credit trading platform with intelligent agent orchestration</p>
</div>

---

## 🎯 Platform Overview

Praxis Agent Carbon is an integrated platform for intelligent email automation and carbon credit trading operations:

### 🏗️ **InsForge** - Backend Infrastructure
- **Database**: PostgreSQL with InsForge schema (ghcr.io/insforge/postgres)
- **API Layer**: PostgREST for REST API access
- **Authentication**: JWT-based auth with OAuth provider support
- **Storage**: S3-compatible file storage
- **Serverless Functions**: Deno runtime for edge functions
- **Note**: Local InsForge backend has build issues - use cloud service or ghcr.io images (see [INSFORGE_BUILD_ISSUE.md](./INSFORGE_BUILD_ISSUE.md))

### 🤖 **Praxis Agent Carbon** - Command & Control Center
- **System Oversight**: Real-time monitoring and dashboard (http://localhost:50080)
- **Exception Handling**: Human-in-the-loop decision making
- **Task Orchestration**: Manual intervention and strategic decisions
- **Human Interface**: WebUI, SSH, and CLI interfaces
- **MCP Integration**: Connects to Swarm for agent orchestration

### 📧 **Swarm** - Agent Orchestrator
- **Container Management**: Spawns and manages agent containers
- **MCP Server**: Exposes tools for scheduling and messaging
- **IPC Communication**: Shared workspace for agent communication
- **Docker-in-Docker**: Runs privileged to spawn agent containers
- **Multi-Channel Support**: Manages multiple communication channels

### 📧 **Praxis Platform** - Autonomous Email Agent
- **Email Processing**: Real-time email processing via AgentMail.to
- **Carbon Trading**: Automated trade execution and compliance
- **Business Integration**: Aspect, Xero, Monday.com, Planful connectors
- **Memory & Learning**: Pattern recognition and adaptive responses

```
┌─────────────────────────────────────────────────────────────────┐
│                     HUMAN OPERATORS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ WebUI        │  │ SSH/CLI     │  │ API Client   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────────────┐
│         ▼                  ▼                  ▼                  │
│       Praxis Agent Carbon (Command & Control)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Monitoring   │  │ Exception    │  │ Task         │          │
│  │ Dashboard    │  │ Handling     │  │ Orchestration│          │
│  │             │  │ Framework   │  │   Manager    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
└─────────┼──────────────────┼────────────────────────────────────┘
          │         MCP (stdio)   │
          └──────────┼────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Swarm (MCP Server)                       │
│  ┌──────────────┐  ┌──────────────┐             │
│  │ Orchestrator │  │ Agent Spawner│             │
│  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼──────────────────────────────┘
          │                  │
          ↓                  ↓
┌─────────┼──────────────────┼──────────────────────────────┐
│         ▼                  ▼                              │
│      Docker-in-Docker Agents                         │
│                                                       │
└───────────────────────────────────────────────────────────────┘

Backend Layer (Shared Database + API):
  PostgreSQL (ghcr.io/insforge/postgres)
         ↓
    PostgREST API Layer
         ↓
    InsForge Backend (⚠️ Build issue - use cloud or skip)
```

**Note:** InsForge backend has Docker build issues. See [INSFORGE_BUILD_ISSUE.md](./INSFORGE_BUILD_ISSUE.md) for details and workarounds.

## 🔄 How Components Interact

### 1. **User Interaction Flow**
```
User → Web UI/Chat App → WebSocket Manager → Agent Zero/Swarm
```

### 2. **Agent Execution Flow**
```
Agent Request → Swarm Orchestrator → Container Spawn → Agent Execution → Result Return
```

### 3. **Data Persistence Flow**
```
Agent Actions → InsForge API → PostgreSQL/Storage → Persistent Storage
```

### 4. **Function Execution Flow**
```
Agent Request → Deno Runtime → Edge Function → External API → Result Return
```

---

## 🚀 Quick Start

### Option A: Local Development

**Prerequisites:**
- Docker and Docker Compose
- Node.js 20+ (for local development)

**Installation:**

1. **Clone repository**
```bash
git clone <repository-url>
cd CarbonAgent
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Start all services**
```bash
docker-compose -f docker-compose.unified.yml up -d
```

4. **Access services**
- Praxis Agent Carbon Dashboard: http://localhost:50080
- Swarm (via MCP): Available in Praxis Agent Carbon
- PostgreSQL: localhost:5436

### Option B: Railway Deployment (Production)

**Prerequisites:**
- Railway account (free tier available)
- GitHub repository connected to Railway

**Installation:**

1. **Deploy to Railway**
```bash
railway up
# Railway will automatically detect docker-compose.railway.yml
# Set environment variables in Railway dashboard
```

2. **Access services**
- Railway assigns domains automatically
- Copy URLs from Railway dashboard
- Example: `praxis-agent-carbon-production.up.railway.app`

**Note:** InsForge backend has build issues - see [INSFORGE_BUILD_ISSUE.md](./INSFORGE_BUILD_ISSUE.md). Use core services deployment (docker-compose.railway.yml) or InsForge cloud service.

## 💡 Getting Started

### 1. Check System Status
```bash
# From Agent Zero CLI
/.status
```

### 2. View Email Queue
```bash
# From Agent Zero CLI
/.view-queue
```

### 3. Handle Exceptions
```bash
# From Agent Zero CLI
/.handle-exceptions
```

### 4. Trigger Manual Task
```bash
# From Agent Zero CLI
/.execute-task reconcile-inventory
```

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CarbonAgent
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose -f docker-compose.unified.yml up -d
```

4. **Access services**
- InsForge Dashboard: http://localhost:7130
- Praxis Agent Carbon UI: http://localhost:50080
- Swarm Orchestrator: http://localhost:3000

---

## 📚 Component Documentation

| Component | Documentation | Purpose |
|-----------|--------------|---------|
| **InsForge** | [insforge/README.md](./insforge/README.md) | Backend infrastructure and APIs |
| **Praxis Agent Carbon** | [agent-zero/README.md](./agent-zero/README.md) | Hierarchical agent framework (formerly Agent Zero) |
| **Swarm** | [nanoclaw/README.md](./nanoclaw/README.md) | Agent orchestration and containers (formerly NanoClaw) |

---

## 🏷️ Brand & Naming Convention

### Official Names
- **Platform**: Praxis Agent Carbon Platform
- **Backend**: InsForge
- **Agent Framework**: Praxis Agent Carbon (formerly Agent Zero)
- **Orchestrator**: Swarm (formerly NanoClaw)

### Component Naming
- Database service: `praxis-postgres`
- API service: `praxis-postgrest`
- Backend service: `praxis-insforge`
- Agent service: `praxis-agent-carbon`
- Orchestrator service: `praxis-swarm`

---

## 🔧 System Responsibilities

### InsForge (Backend Layer)
- ✅ User authentication and session management
- ✅ Data persistence (PostgreSQL)
- ✅ File storage (S3-compatible)
- ✅ Serverless function execution
- ✅ OAuth provider integration
- ✅ API gateway and rate limiting

### Praxis Agent Carbon (Agent Framework)
- ✅ Hierarchical agent coordination
- ✅ Long-term memory management
- ✅ Skills system and extensibility
- ✅ Project workspace isolation
- ✅ Tool execution and code interpretation
- ✅ WebSocket communication

### Swarm (Orchestrator)
- ✅ Container lifecycle management
- ✅ Multi-channel message routing
- ✅ Scheduled task execution
- ✅ Per-group context isolation
- ✅ IPC communication between agents
- ✅ Agent sandboxing

---

## 🔐 Security Model

### Defense in Depth
1. **Network Isolation**: Services run in isolated Docker networks
2. **Container Isolation**: Agents run in isolated containers
3. **Authentication**: JWT-based auth with OAuth providers
4. **Authorization**: Role-based access control
5. **Secrets Management**: Encrypted secret storage

### Data Protection
- All secrets encrypted at rest
- HTTPS/TLS for external communication
- Database encryption with configurable keys
- File system isolation for agent containers

---

## 🛠️ Development

### Project Structure
```
CarbonAgent/
├── agent-zero/          # Agent framework
├── insforge/            # Backend infrastructure
├── nanoclaw/            # Orchestrator (Swarm)
├── deploy/              # Deployment configurations
├── swarm-workspace/     # Swarm working directories
├── docker-compose.unified.yml
├── docker-compose.railway.yml
└── .env.example
```

### Development Workflow

1. **Make changes to individual components**
2. **Test locally**: `docker-compose -f docker-compose.unified.yml up`
3. **Run tests**: See individual component READMEs
4. **Build images**: `docker-compose build`

---

## 🚢 Deployment

### Local Development

```bash
# Start all services locally
docker-compose -f docker-compose.unified.yml up -d

# View logs
docker-compose -f docker-compose.unified.yml logs -f

# Stop services
docker-compose -f docker-compose.unified.yml down
```

### Railway Deployment

```bash
# Deploy core services (PostgreSQL, Praxis Agent Carbon, Swarm, PostgREST)
railway up

# Railway will automatically:
# - Detect docker-compose.railway.yml
# - Deploy services
# - Assign domains
# - Configure load balancers
```

**Deployment Options:**

| Option | File | Services | InsForge Backend |
|--------|-------|-----------|------------------|
| Full Stack (Local) | docker-compose.unified.yml | All | ❌ Build issue |
| Core Services (Railway) | docker-compose.railway.yml | PostgreSQL, Agent Carbon, Swarm, PostgREST | N/A (use cloud or skip) |

**Note:** InsForge backend Docker build fails - see [INSFORGE_BUILD_ISSUE.md](./INSFORGE_BUILD_ISSUE.md) for details and workarounds.

### Production Considerations

- Set strong JWT secrets and encryption keys
- Configure OAuth providers
- Set up S3 or compatible storage
- Configure rate limiting
- Use Railway's managed PostgreSQL for production
- Monitor service health in Railway dashboard

**Documentation:**
- [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Current project status
- [INSFORGE_BUILD_ISSUE.md](./INSFORGE_BUILD_ISSUE.md) - InsForge build details

---

## 📖 Common Workflows

### 1. Creating a New Agent Skill
```bash
cd agent-zero/skills/create-skill
# Follow SKILL.md template
```

### 2. Adding a Communication Channel
```bash
cd nanoclaw/.claude/skills
# Choose from: add-whatsapp, add-telegram, add-discord, etc.
```

### 3. Setting Up Database Functions
```bash
cd insforge/functions
# Add your Deno serverless functions
```

### 4. Configuring OAuth Providers
1. Go to InsForge Dashboard: http://localhost:7130
2. Navigate to Settings → OAuth
3. Configure provider credentials
4. Update .env with client IDs and secrets

---

## 🐛 Troubleshooting

### Common Issues

**1. Services won't start**
```bash
# Check logs
docker-compose -f docker-compose.unified.yml logs

# Verify database is healthy
docker exec praxis-postgres pg_isready -U postgres
```

**2. Agent containers not spawning**
```bash
# Check Swarm logs
docker logs praxis-swarm

# Verify Docker socket is mounted
docker exec praxis-swarm ls -la /var/run/docker.sock
```

**3. Database connection errors**
```bash
# Verify database credentials
docker exec praxis-postgres psql -U postgres -c "SELECT 1"

# Check PostgREST connection
curl http://localhost:5430/
```

**4. Memory issues**
```bash
# Check container resource usage
docker stats

# Increase Docker memory limits in Docker Desktop settings
```

For detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🤝 Contributing

We welcome contributions! Please see:
- [InsForge Contributing](./insforge/CONTRIBUTING.md)
- [Praxis Agent Carbon Contributing](./agent-zero/docs/guides/contribution.md)
- [Swarm Contributing](./nanoclaw/CONTRIBUTING.md)

---

## 📄 License

- InsForge: Apache License 2.0
- Praxis Agent Carbon: See agent-zero/LICENSE
- Swarm (NanoClaw): MIT License

---

## 🔗 Links

- **Documentation**: [Full Documentation](./docs/)
- **Deployment Guide**: [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md) - Comprehensive deployment instructions
- **Current Status**: [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Latest project status and known issues
- **InsForge Build Issue**: [INSFORGE_BUILD_ISSUE.md](./INSFORGE_BUILD_ISSUE.md) - Docker build troubleshooting
- **Issues**: [GitHub Issues](https://github.com/your-org/CarbonAgent/issues)
- **Discord**: [Community Server](https://discord.gg/your-server)
- **Website**: [praxisagentcarbon.ai](https://praxisagentcarbon.ai)

---

## 📋 Deployment Quick Reference

| Deployment Type | File | InsForge Backend | Ready for Production |
|----------------|-------|------------------|---------------------|
| Local Development | docker-compose.unified.yml | ⚠️ Build issue | ⚠️ Requires local Docker |
| Core Services (Railway) | docker-compose.railway.yml | Uses cloud/ghcr.io image | ✅ Yes |
| Full Stack (Local) | docker-compose.unified.yml | ⚠️ Build issue | ⚠️ Requires local Docker |

**Recommended:** Use docker-compose.railway.yml for production deployment.

---

<div align="center">
  <p>Built with ❤️ by the Praxis Agent Carbon community</p>
  <p>⭐ Star us on GitHub — it helps!</p>
</div>

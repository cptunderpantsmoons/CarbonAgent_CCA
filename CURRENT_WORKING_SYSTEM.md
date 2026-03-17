# Current Working System - User Guide

## Status: ✅ Working (Classic UI)

The system is **RUNNING** with the classic Agent Zero UI. Not the OS Desktop, but fully functional.

## Access URL

**Main Interface**: http://localhost:50080

## What's Working Right Now

### ✅ Core Services
- **Praxis Agent Carbon**: Running on port 50080
- **PostgreSQL Database**: Running on port 5434 (healthy)
- **PostgREST API**: Running on port 5437

### ✅ Features Available
- Chat interface with AI agent
- Code execution (Python, JavaScript, Bash)
- File operations
- Web search (requires API key configuration)
- Memory system
- Projects management
- Skills system
- Scheduler
- Settings panel

### ⚠️ NOT Available
- OS Desktop interface (new UI being built)
- Swarm orchestrator (has issues)
- InsForge backend (build issues)

## How to Use (Classic UI)

### 1. Open the Interface
```
http://localhost:50080
```

### 2. First Time Setup
- Click on "Settings" or "Configuration"
- Add your LLM provider API key:
  - OpenRouter: https://openrouter.ai/keys
  - Anthropic: https://console.anthropic.com/
  - Or other compatible providers
- Save and restart agent

### 3. Start Using
Type commands in the chat interface:

```
Hello! Can you help me?
Write a Python script to process a CSV file
Create a file called test.txt with content "Hello World"
Search for "AI news 2026" and summarize
```

## Container Management

### View Status
```bash
docker ps
```

### View Logs
```bash
docker logs praxis-agent-carbon -f
```

### Restart Service
```bash
docker restart praxis-agent-carbon
```

### Stop All Services
```bash
docker-compose -f docker-compose.unified.yml down
```

### Start All Services
```bash
docker-compose -f docker-compose.unified.yml up -d
```

## Database Access

### Connect to PostgreSQL
```bash
docker exec -it praxis-postgres-local psql -U postgres -d praxis_agent_carbon
```

### Via Adminer (Web UI)
```
http://localhost:8888
```
- System: PostgreSQL
- Server: praxis-postgres-local
- User: postgres
- Password: postgres
- Database: praxis_agent_carbon

## API Access

### PostgREST API
```bash
curl http://localhost:5437/
```

### Test API Endpoints
```bash
# OpenAPI spec
curl http://localhost:5437/

# List tables (if any exist)
curl http://localhost:5437/tables
```

## Common Tasks

### Check Agent Status
```bash
docker logs praxis-agent-carbon --tail 50
```

### Test Agent Functionality
In the web UI at http://localhost:50080:
```
What is 2 + 2?
Execute: print("Hello from Python!")
List files in current directory
```

### Configure LLM Provider
1. Open http://localhost:50080
2. Go to Settings
3. Find LLM configuration section
4. Add API key for your provider
5. Save and restart

## File Locations

### Agent Files (in container)
- `/root/` - Working directory
- `/root/.a0_memory` - Agent memories
- `/root/.a0_projects` - Project workspaces
- `/root/.a0_usr` - User data

### Source Files (on host)
- `/media/emt7/backup/CarbonAgent/agent-zero/` - All source code
- `/media/emt7/backup/CarbonAgent/agent-zero/webui/` - UI files
- `/media/emt7/backup/CarbonAgent/agent-zero/python/` - Python tools

## Troubleshooting

### UI Not Loading
```bash
docker restart praxis-agent-carbon
# Wait 30 seconds
# Refresh browser
```

### Agent Not Responding
```bash
# Check logs
docker logs praxis-agent-carbon --tail 100

# Restart service
docker restart praxis-agent-carbon
```

### Database Connection Issues
```bash
# Check database health
docker exec praxis-postgres-local pg_isready -U postgres

# Restart database
docker restart praxis-postgres-local
```

## What's NOT Working

### ❌ OS Desktop Interface
The new OS Desktop UI you've seen screenshots of is not deployed yet. It's being built and will be available when the build completes (~20 minutes from now).

### ❌ Swarm Orchestrator
The Swarm service has container runtime configuration issues and is not running.

### ❌ InsForge Backend
The InsForge backend service has Docker build issues. Workaround: Use PostgreSQL + PostgREST directly.

## Next Steps When OS Desktop Build Completes

When the build finishes (estimated 02:07 AM):
1. New image will be ready: `praxis-agent-carbon:with-source`
2. Will include NEW OS Desktop UI
3. I'll deploy it automatically
4. You'll see the new interface at http://localhost:50080

## Current Recommendations

✅ **Use the Classic UI** - It's fully functional
✅ **Test agent capabilities** - All features work
✅ **Configure API keys** - Get it ready for real use
⏸️ **Wait for OS Desktop build** - Or I can deploy it when it's ready

---

**Status**: Working System Ready
**UI**: Classic (not OS Desktop)
**Features**: Fully Functional
**Next**: OS Desktop UI will be ready in ~20 minutes

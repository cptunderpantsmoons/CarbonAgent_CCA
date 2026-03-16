# Praxis Agent Carbon Platform - Troubleshooting Guide

This guide helps you diagnose and fix common issues with the Praxis Agent Carbon Platform.

---

## 🚨 Quick Diagnostics

### Health Check Script
```bash
# Run the built-in verification script
python3 verify-railway-config.py
```

### Check Service Status
```bash
# Check all containers
docker-compose -f docker-compose.unified.yml ps

# Check container logs
docker-compose -f docker-compose.unified.yml logs

# Check resource usage
docker stats
```

---

## 🔧 Common Issues and Solutions

### 1. Database Connection Issues

#### Symptoms
- Services fail to start with "connection refused" errors
- PostgREST can't connect to PostgreSQL
- Agent creation fails with database errors

#### Diagnosis
```bash
# Check if PostgreSQL is running
docker exec praxis-postgres pg_isready -U postgres

# Check PostgreSQL logs
docker logs praxis-postgres

# Test connection from PostgREST container
docker exec praxis-postgrest sh -c "nc -zv postgres 5432"
```

#### Solutions

**a) PostgreSQL not healthy**
```bash
# Restart PostgreSQL
docker-compose -f docker-compose.unified.yml restart postgres

# Wait for it to become healthy
docker-compose -f docker-compose.unified.yml ps postgres
```

**b) Wrong credentials**
```bash
# Check .env file
cat .env | grep POSTGRES

# Ensure these match between containers:
# POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
```

**c) Database not initialized**
```bash
# Check if init scripts ran
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "\dt"

# If no tables exist, force re-init:
docker-compose -f docker-compose.unified.yml down -v
docker-compose -f docker-compose.unified.yml up -d
```

---

### 2. Agent Containers Not Spawning

#### Symptoms
- Swarm logs show "Failed to spawn agent"
- No agent containers visible in `docker ps`
- Tasks fail with "agent not responding"

#### Diagnosis
```bash
# Check Swarm logs
docker logs praxis-swarm

# Verify Docker socket is mounted
docker exec praxis-swarm ls -la /var/run/docker.sock

# Check if Swarm can run Docker commands
docker exec praxis-swarm docker ps
```

#### Solutions

**a) Docker socket not mounted**
```bash
# Stop Swarm
docker-compose -f docker-compose.unified.yml stop swarm

# Remove container
docker rm praxis-swarm

# Start again (Docker socket should be mounted)
docker-compose -f docker-compose.unified.yml up -d swarm
```

**b) Insufficient resources**
```bash
# Check system resources
docker system df

# Clean up unused containers
docker container prune -f

# Clean up unused images
docker image prune -a -f
```

**c) Permission issues**
```bash
# Check Swarm user permissions
docker exec praxis-swarm id

# Swarm runs as root by default for Docker socket access
# If you changed this, you may need to adjust Docker socket permissions
```

---

### 3. Memory Issues

#### Symptoms
- Containers getting killed (OOM killer)
- System becomes slow
- Docker error "exceeded memory limit"

#### Diagnosis
```bash
# Check container memory usage
docker stats --no-stream

# Check system memory
free -h

# Look for OOM kills in logs
dmesg | grep -i "out of memory"
```

#### Solutions

**a) Increase Docker memory limits**
```bash
# Docker Desktop: Settings > Resources > Memory
# Increase to at least 8GB for development

# Linux: Edit /etc/docker/daemon.json
{
  "default-runtime": "runc",
  "default-ulimits": {
    "mem": {
      "Name": "mem",
      "Hard": -1,
      "Soft": -1
    }
  }
}
```

**b) Optimize containers**
```bash
# Set memory limits in docker-compose
# Add to each service:
services:
  agent-zero:
    mem_limit: 2g
    memswap_limit: 2g
```

**c) Reduce agent concurrency**
```bash
# In Swarm settings, reduce concurrent agents
# Edit nanoclaw/.env or swarm settings
MAX_CONCURRENT_AGENTS=2
```

---

### 4. Authentication Issues

#### Symptoms
- Login fails with "invalid credentials"
- JWT token errors
- OAuth redirect failures

#### Diagnosis
```bash
# Check JWT secret is set
docker exec praxis-insforge env | grep JWT_SECRET

# Check admin user exists
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "SELECT * FROM users WHERE email = 'admin@example.com';"

# Check InsForge logs
docker logs praxis-insforge
```

#### Solutions

**a) Reset admin password**
```bash
# Connect to database
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon

# Reset password
UPDATE users 
SET password_hash = crypt('your-new-password', gen_salt('bf'))
WHERE email = 'admin@example.com';
```

**b) Fix JWT secret**
```bash
# Ensure JWT_SECRET is set in .env
JWT_SECRET=your-secret-key-must-be-32-characters-or-longer

# Restart services
docker-compose -f docker-compose.unified.yml restart insforge postgrest
```

**c) OAuth configuration**
```bash
# Check OAuth credentials are set in .env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Verify redirect URIs in OAuth provider console
# Should match: http://localhost:7130/api/auth/google/callback
```

---

### 5. WebSocket Connection Issues

#### Symptoms
- Real-time updates not working
- "WebSocket connection failed" in browser
- Agent messages not appearing in real-time

#### Diagnosis
```bash
# Check if WebSocket port is accessible
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:7130/ws

# Check browser console for WebSocket errors
# Check InsForge logs for WebSocket errors
docker logs praxis-insforge | grep -i websocket
```

#### Solutions

**a) Firewall blocking WebSocket**
```bash
# Ensure WebSocket ports are open
# For local development, this should work automatically
# For remote deployment, open ports 7130-7132
```

**b) Reverse proxy configuration**
```bash
# If using nginx, ensure WebSocket upgrade is allowed
location /ws {
    proxy_pass http://praxis-insforge:7130;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**c) CORS issues**
```bash
# Check CORS settings in InsForge backend
# Ensure your origin is allowed
```

---

### 6. File Upload/Storage Issues

#### Symptoms
- File uploads fail
- S3 connection errors
- "Storage not configured" messages

#### Diagnosis
```bash
# Check storage configuration
docker exec praxis-insforge env | grep -i storage

# Test S3 connection (if using AWS S3)
docker exec praxis-insforge aws s3 ls

# Check storage directory permissions (if using local storage)
docker exec praxis-insforge ls -la /insforge-storage
```

#### Solutions

**a) Configure S3 storage**
```bash
# Add to .env:
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Restart InsForge
docker-compose -f docker-compose.unified.yml restart insforge
```

**b) Use local storage**
```bash
# Ensure STORAGE_DIR is set
STORAGE_DIR=/insforge-storage

# Directory should be writable
docker exec praxis-insforge chmod 777 /insforge-storage
```

**c) Fix file size limits**
```bash
# Increase upload limit in .env
MAX_FILE_SIZE=104857600  # 100MB in bytes

# Adjust nginx/client max body size if using reverse proxy
```

---

### 7. Performance Issues

#### Symptoms
- Slow agent responses
- Database queries taking too long
- High CPU/memory usage

#### Diagnosis
```bash
# Check slow queries
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check database size
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "SELECT pg_size_pretty(pg_database_size('praxis_agent_carbon'));"

# Check table sizes
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

#### Solutions

**a) Database indexing**
```bash
# Add missing indexes
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);"

# Analyze tables
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "ANALYZE;"
```

**b) Connection pooling**
```bash
# Use PgBouncer for better connection management
# Add to docker-compose:
pgbouncer:
  image: pgbouncer/pgbouncer
  environment:
    - DATABASES_HOST=postgres
    - DATABASES_PORT=5432
    - DATABASES_USER=postgres
    - DATABASES_PASSWORD=postgres
    - DATABASES_DBNAME=praxis_agent_carbon
```

**c) Caching**
```bash
# Enable Redis caching for frequently accessed data
# Add Redis to docker-compose
```

---

### 8. Docker Compose Issues

#### Symptoms
- docker-compose up fails
- Services don't start in correct order
- Network issues between containers

#### Diagnosis
```bash
# Check docker-compose version
docker-compose version

# Validate compose file
docker-compose -f docker-compose.unified.yml config

# Check networks
docker network ls
docker network inspect praxis-network
```

#### Solutions

**a) Fix startup order**
```bash
# Ensure depends_on and healthchecks are properly configured
# Services should wait for dependencies to be healthy

# Check health status
docker-compose -f docker-compose.unified.yml ps
```

**b) Network conflicts**
```bash
# Remove old networks
docker network prune -f

# Recreate project
docker-compose -f docker-compose.unified.yml down
docker-compose -f docker-compose.unified.yml up -d
```

**c) Port conflicts**
```bash
# Check what's using the ports
netstat -tulpn | grep -E '(5432|7130|7131|7132|50080|3000)'

# Change ports in docker-compose if needed
```

---

### 9. Agent Zero Specific Issues

#### Symptoms
- Agent responses are slow
- Memory not being saved/recalled
- Skills not loading

#### Diagnosis
```bash
# Check Agent Zero logs
docker logs praxis-agent-carbon

# Check memory database
docker exec praxis-agent-carbon ls -la /git/agent-zero/memory/

# Check skills directory
docker exec praxis-agent-carbon ls -la /git/agent-zero/usr/skills/
```

#### Solutions

**a) Memory not working**
```bash
# Check if VectorDB is initialized
docker exec praxis-agent-carbon python -c "from python.helpers.vector_db import VectorDB; print(VectorDB())"

# Reinitialize if needed
docker exec praxis-agent-carbon python /git/agent-zero/initialize.py
```

**b) Skills not loading**
```bash
# Check skills format
docker exec praxis-agent-carbon cat /git/agent-zero/usr/skills/*/SKILL.md

# Ensure SKILL.md files follow the correct format
```

**c) Model configuration**
```bash
# Check model providers config
docker exec praxis-agent-carbon cat /git/agent-zero/conf/model_providers.yaml

# Ensure API keys are set
docker exec praxis-agent-carbon cat /git/agent-zero/usr/secrets.env
```

---

### 10. Swarm (NanoClaw) Specific Issues

#### Symptoms
- Channels not connecting
- Scheduled tasks not running
- Groups not being created

#### Diagnosis
```bash
# Check Swarm logs
docker logs praxis-swarm

# Check groups directory
ls -la swarm-workspace/groups/

# Check database for groups
docker exec praxis-postgres psql -U postgres -d praxis_agent_carbon -c "SELECT * FROM swarm_groups;"
```

#### Solutions

**a) Channel credentials missing**
```bash
# Set channel credentials in Swarm .env
# Example for WhatsApp:
WHATSAPP_AUTH_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

**b) Scheduler not working**
```bash
# Check scheduler configuration
docker exec praxis-swarm cat /workspace/ipc/schedule.json

# Manually trigger a task
docker exec praxis-swarm node /app/dist/task-scheduler.js
```

**c) IPC issues**
```bash
# Check IPC directory permissions
ls -la swarm-workspace/ipc/

# Ensure directory is writable
chmod 777 swarm-workspace/ipc/
```

---

## 🔍 Debug Mode

### Enable verbose logging
```bash
# For InsForge
docker-compose -f docker-compose.unified.yml exec insforge sh -c "DEBUG=* npm run dev"

# For Agent Zero
docker-compose -f docker-compose.unified.yml exec praxis-agent-carbon sh -c "export DEBUG=1; python agent.py"

# For Swarm
docker-compose -f docker-compose.unified.yml exec swarm sh -c "NODE_ENV=development node dist/index.js"
```

### Connect to running containers
```bash
# InsForge
docker exec -it praxis-insforge sh

# Agent Zero
docker exec -it praxis-agent-carbon bash

# Swarm
docker exec -it praxis-swarm sh

# PostgreSQL
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon
```

---

## 📊 Monitoring and Logs

### View logs
```bash
# All logs
docker-compose -f docker-compose.unified.yml logs -f

# Specific service
docker-compose -f docker-compose.unified.yml logs -f insforge

# Last 100 lines
docker-compose -f docker-compose.unified.yml logs --tail=100
```

### Export logs for debugging
```bash
# Save logs to file
docker-compose -f docker-compose.unified.yml logs > debug-logs.txt

# Export container logs
docker logs praxis-postgres > postgres.log
docker logs praxis-insforge > insforge.log
docker logs praxis-agent-carbon > agent-zero.log
docker logs praxis-swarm > swarm.log
```

---

## 🆘 Getting Help

If you can't resolve your issue:

1. **Check existing documentation**
   - [InsForge Docs](./insforge/docs/)
   - [Agent Zero Docs](./agent-zero/docs/)
   - [Swarm Docs](./nanoclaw/docs/)

2. **Search GitHub Issues**
   - Check if someone else had the same issue
   - Look for closed issues with solutions

3. **Join the community**
   - Discord: [Community Server](https://discord.gg/your-server)
   - GitHub Discussions

4. **Create a bug report**
   - Include diagnostic information
   - Add logs (redact sensitive data)
   - Describe steps to reproduce
   - Include your environment details

---

## 📋 Diagnostic Information Template

When reporting issues, include:

```bash
# System information
docker --version
docker-compose version
docker info

# Platform version
cat .env | grep -E '(VERSION|BRANCH)'

# Container status
docker-compose -f docker-compose.unified.yml ps

# Recent logs
docker-compose -f docker-compose.unified.yml logs --tail=50

# Resource usage
docker stats --no-stream
```

---

<div align="center">
  <p>Still stuck? <a href="https://github.com/your-org/CarbonAgent/issues">Open an issue</a></p>
</div>

# Local Testing Guide - Praxis Agent Carbon Platform

**Date**: March 16, 2026
**Status**: ✅ Ready for Testing
**Services Running**: 3/4 Core Services

## Current System Status

### ✅ Services Running

| Service | Status | URL | Notes |
|---------|--------|-----|-------|
| **Praxis Agent Carbon** | ✅ Running | http://localhost:50080 | Main agent interface |
| **PostgreSQL** | ✅ Healthy | localhost:5434 | Database service |
| **PostgREST** | ✅ Running | http://localhost:5437 | API layer (unhealthy status OK) |

### ⚠️ Services Having Issues

| Service | Status | Issue | Workaround |
|---------|--------|-------|-----------|
| **Swarm** | ❌ Failed | Container runtime error | Use Praxis Agent Carbon standalone |

**Note**: Swarm (nanoclaw) requires Docker-in-Docker which has configuration issues. For initial testing, use Praxis Agent Carbon standalone which provides full agent functionality.

## Quick Start Testing

### 1. Access Praxis Agent Carbon WebUI

**Open in Browser:**
```
http://localhost:50080
```

**What to Expect:**
- Modern OS-style desktop interface
- Terminal/chat interface in main window
- Agent character walking around
- System monitoring in System Monitor window

**First Time Setup:**
1. Click on **Settings** (⚙️ icon)
2. Configure your LLM provider (OpenRouter, Anthropic, etc.)
3. Set your API key
4. Click **Save Config**
5. Click **Restart Agent**

### 2. Test Basic Agent Functionality

**Open Terminal** (💬 icon) and try:

```
Hello! Can you help me?
```

**Expected Response:**
- Agent should greet you
- Offer assistance
- Show real-time streaming response

### 3. Test Code Execution

```
Write a Python script that prints "Hello, World!"
```

**Expected Response:**
- Agent should create Python code
- Execute it using code-execution skill
- Show output: `Hello, World!`

### 4. Test File Operations

```
Create a text file called test.txt with content "Testing file creation"
```

**Expected Response:**
- Agent should create the file
- Confirm file was created
- Show file location

### 5. Test System Monitoring

**Open System Monitor** (📈 icon)

**What to Check:**
- CPU usage should be visible
- Memory usage should be displayed
- Service status should show healthy

### 6. Test Email Service Control

**Open Email Service** (📧 icon)

**What to Check:**
- Statistics display (processed, pending, trades)
- Service control buttons work
- Activity monitoring shows updates

## Component Testing

### Test Praxis Agent Carbon (Main Agent)

**Test 1: Code Execution**
```
Execute this Python code:
import pandas as pd
df = pd.DataFrame({'A': [1, 2, 3]})
print(df)
```

**Test 2: Web Search**
```
Search for "latest AI news 2026" and summarize
```

**Test 3: File Operations**
```
List all files in the current directory
```

**Test 4: Math & Logic**
```
What is 123 * 456 + 789?
```

### Test PostgreSQL Database

**Connect to Database:**
```bash
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon
```

**Run Queries:**
```sql
-- List all tables
\dt

-- Check database size
SELECT pg_size_pretty(pg_database_size('praxis_agent_carbon'));

-- View recent activity
SELECT * FROM pg_stat_activity WHERE datname = 'praxis_agent_carbon';
```

### Test PostgREST API

**Test API Endpoint:**
```bash
curl http://localhost:5437/

# Expected: OpenAPI specification JSON
```

**Test Tables (if any exist):**
```bash
curl http://localhost:5437/users
```

## Integration Testing

### Test 1: Agent → Database Integration

**In Praxis Agent Carbon terminal:**
```
Save a memory with the text "PostgreSQL database is running on port 5434"
```

**Verify in Database:**
```bash
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon
SELECT * FROM memories ORDER BY created_at DESC LIMIT 1;
```

### Test 2: Agent → File System Integration

**In Praxis Agent Carbon terminal:**
```
Create a file called integration_test.txt with content "Integration test successful"
```

**Verify File Exists:**
```bash
docker exec praxis-agent-carbon ls -la /root/integration_test.txt
```

### Test 3: Agent → API Integration

**In Praxis Agent Carbon terminal:**
```
Make a GET request to http://localhost:5437/ and show me the response
```

**Expected:**
- Agent should use curl or similar
- Display JSON response
- Show status code

## Performance Testing

### Test Agent Response Time

**Run this query multiple times:**
```
What is 2 + 2?
```

**Measure:**
- Time to first token
- Time to complete response
- Should be < 5 seconds for simple queries

### Test Code Execution Performance

**Run:**
```
Execute: for i in range(1000000): pass
```

**Expected:**
- Should complete in < 10 seconds
- Show execution time
- No memory errors

### Test Memory Usage

**Check container stats:**
```bash
docker stats praxis-agent-carbon --no-stream
```

**What to Look For:**
- Memory usage should be reasonable (< 2GB)
- CPU usage should be low when idle
- No memory leaks over time

## Troubleshooting

### Issue: Agent Won't Respond

**Check:**
1. Is Praxis Agent Carbon running? `docker ps | grep praxis-agent-carbon`
2. Is WebUI accessible? http://localhost:50080
3. Are API keys configured? Check Settings
4. Check agent logs: `docker logs praxis-agent-carbon --tail 50`

**Solution:**
```bash
docker restart praxis-agent-carbon
```

### Issue: Database Connection Errors

**Check:**
```bash
docker exec praxis-postgres pg_isready -U postgres
```

**Solution:**
```bash
docker restart praxis-postgres
```

### Issue: PostgREST Unhealthy

**Note**: Unhealthy status is OK - PostgREST is running fine
**Verify:**
```bash
curl http://localhost:5437/
```

**If not responding:**
```bash
docker restart praxis-postgrest-local
```

### Issue: Port Conflicts

**Check What's Using Ports:**
```bash
netstat -tulpn | grep -E '(50080|5434|5437)'
```

**Solution:**
- Stop conflicting services
- Or change port mappings in docker-compose.unified.yml

## Advanced Testing

### Test 1: Multiple Concurrent Sessions

1. Open http://localhost:50080 in multiple browser tabs
2. Send different queries in each tab
3. Verify all sessions work independently

### Test 2: Large File Operations

```
Create a 10MB file with random data and calculate its MD5 hash
```

**Expected:**
- Agent should handle large files
- Complete operation without errors
- Show correct MD5 hash

### Test 3: Long-Running Tasks

```
Execute: import time; time.sleep(30); print("Done")
```

**Expected:**
- Agent should handle timeout gracefully
- Show progress updates
- Complete after 30 seconds

### Test 4: Error Handling

```
Execute: 1/0
```

**Expected:**
- Agent should show error clearly
- Not crash or hang
- Suggest fix

## Testing Checklist

### Basic Functionality
- [ ] WebUI loads at http://localhost:50080
- [ ] Agent responds to greetings
- [ ] Code execution works (Python)
- [ ] File operations work
- [ ] Web search works (if configured)
- [ ] Settings can be changed
- [ ] Agent restarts successfully

### Database Operations
- [ ] PostgreSQL is healthy
- [ ] Can connect to database
- [ ] Can query tables
- [ ] Can insert data
- [ ] Agent can save/load memories

### API Integration
- [ ] PostgREST responds to requests
- [ ] API returns proper JSON
- [ ] Agent can make HTTP requests
- [ ] CORS headers are correct

### Performance
- [ ] Response time < 5 seconds for simple queries
- [ ] Memory usage < 2GB
- [ ] No memory leaks over time
- [ ] Multiple concurrent sessions work

### Error Handling
- [ ] Invalid code shows clear errors
- [ ] Network failures are handled gracefully
- [ ] Database errors are reported clearly
- [ ] Agent doesn't crash on errors

## Next Steps

### After Basic Testing Works

1. **Configure LLM Provider**
   - Get API key from OpenRouter, Anthropic, or other provider
   - Add to Settings
   - Test with complex queries

2. **Test Advanced Features**
   - Scheduler (create recurring tasks)
   - Projects (create isolated workspaces)
   - Skills (install custom skills)
   - Backup/Restore (test data persistence)

3. **Integration Testing**
   - Test with external APIs
   - Test with real workflows
   - Test with large datasets
   - Test with concurrent users

4. **Performance Optimization**
   - Monitor resource usage
   - Optimize database queries
   - Cache frequently used data
   - Scale resources if needed

## Getting Help

### Documentation
- `README.md` - Platform overview
- `AGENTS.md` - Development guide
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `TROUBLESHOOTING.md` - Common issues and solutions

### Component Docs
- `agent-zero/README.md` - Praxis Agent Carbon
- `nanoclaw/README.md` - Swarm
- `insforge/README.md` - InsForge

### Logs and Debugging

**View Logs:**
```bash
# Praxis Agent Carbon
docker logs praxis-agent-carbon -f

# PostgreSQL
docker logs praxis-postgres -f

# PostgREST
docker logs praxis-postgrest-local -f

# Swarm (if running)
docker logs praxis-swarm -f
```

**Check Service Status:**
```bash
docker-compose -f docker-compose.unified.yml ps
```

**Restart Services:**
```bash
docker restart praxis-agent-carbon
docker restart praxis-postgres
docker restart praxis-postgrest-local
```

## Summary

✅ **Praxis Agent Carbon is ready for testing**
✅ **Core services are running**
✅ **Database is accessible**
✅ **API layer is functional**

⚠️ **Swarm has container runtime issues** (workaround: use Praxis Agent Carbon standalone)

🎯 **Recommended**: Start with Praxis Agent Carbon testing, then add Swarm once container runtime issues are resolved.

---

**Last Updated**: March 16, 2026
**Testing Status**: Ready for Local Testing
**Services Running**: 3/4 Core Services

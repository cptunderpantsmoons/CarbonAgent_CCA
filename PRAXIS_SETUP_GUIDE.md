# Praxis Platform Setup Guide

Complete guide to setting up the Praxis Agent Carbon Platform for autonomous email processing and carbon credit trading.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [InsForge Cloud Setup](#insforge-cloud-setup)
3. [AgentMail.to Configuration](#agentmailto-configuration)
4. [Business System Integration](#business-system-integration)
5. [Local Development Setup](#local-development-setup)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Docker**: 20.10+ (for container orchestration)
- **Docker Compose**: 2.0+
- **Node.js**: 20+ (for local development)
- **Git**: For cloning repository

### Required Accounts
- **InsForge Cloud**: Free account at https://insforge.dev
- **AgentMail.to**: Email service account
- **Aspect Platform**: Carbon trading API access
- **Optional**: Xero, Monday.com, Planful for full integration

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended
- **Disk**: 20GB free space
- **Network**: Stable internet connection

---

## InsForge Cloud Setup

### Step 1: Create InsForge Account

1. Visit https://insforge.dev
2. Click "Sign Up" and create free account
3. Verify email address
4. Log into dashboard

### Step 2: Configure Project

1. Create new project: "Praxis Carbon"
2. Note your Project ID
3. Generate MCP server token
4. Configure database settings:
   - PostgreSQL: Automatic (managed)
   - Authentication: JWT with default settings
   - Storage: S3-compatible (included)

### Step 3: Get MCP Credentials

1. Navigate to Settings → MCP Server
2. Copy MCP Server URL: `cloud-mcp.insforge.dev`
3. Generate and copy API Token
4. Note Project ID

**Environment Variables:**
```bash
INSFORGE_MCP_URL=cloud-mcp.insforge.dev
INSFORGE_MCP_TOKEN=your_token_here
INSFORGE_PROJECT_ID=your_project_id
```

### Step 4: Test MCP Connection

```bash
# From project root
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://cloud-mcp.insforge.dev/health

# Should return: {"status":"ok"}
```

---

## AgentMail.to Configuration

### Step 1: Create AgentMail.to Account

1. Visit https://agentmail.to
2. Sign up for account
3. Choose domain: `agentmail.to` (default) or custom
4. Create inbox: `cca@agentmail.to`

### Step 2: Configure API Access

1. Navigate to Settings → API Keys
2. Generate new API key
3. Note key (starts with `am_live_`)

**Environment Variables:**
```bash
AGENTMAIL_API_KEY=am_live_your_key_here
AGENTMAIL_TO=cca@agentmail.to
```

### Step 3: Configure Webhook (Optional)

For real-time email processing:

1. Navigate to Webhooks in AgentMail.to dashboard
2. Create new webhook:
   - URL: `https://your-domain.com/webhooks/email`
   - Events: `message.received`, `message.sent`
   - Secret: Generate and save

### Step 4: Test Email Reception

Send test email to `cca@agentmail.to` and verify it appears in dashboard.

---

## Business System Integration

### Aspect Platform (Carbon Trading)

1. Contact Aspect for API access
2. Generate API key
3. Configure endpoints

**Environment Variables:**
```bash
ASPECT_API_KEY=your_aspect_key
ASPECT_API_URL=https://api.aspect.carbon/v1
```

### Xero (Accounting)

1. Create Xero developer account
2. Create app and generate API key
3. Configure OAuth credentials

**Environment Variables:**
```bash
XERO_API_KEY=your_xero_key
XERO_API_URL=https://api.xero.com/api.xro/2.0
```

### Monday.com (Workflow Automation)

1. Create Monday.com account
2. Create "Exceptions" board
3. Generate API key
4. Note board ID

**Environment Variables:**
```bash
MONDAY_API_KEY=your_monday_key
MONDAY_API_URL=https://api.monday.com/v2
MONDAY_EXCEPTIONS_BOARD_ID=your_board_id
```

### Planful (Financial Planning)

**Environment Variables:**
```bash
PLANFUL_API_KEY=your_planful_key
PLANFUL_API_URL=your_planful_url
```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd CarbonAgent
```

### Step 2: Install Dependencies

```bash
# Install Agent Zero dependencies
cd agent-zero
npm install
cd ..

# Install Praxis Platform dependencies
cd praxis-platform
npm install
cd ..
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your credentials
nano .env
```

**Required Variables:**
```bash
# InsForge Cloud
INSFORGE_MCP_URL=cloud-mcp.insforge.dev
INSFORGE_MCP_TOKEN=your_token_here

# AgentMail.to
AGENTMAIL_API_KEY=am_live_your_key_here
AGENTMAIL_TO=cca@agentmail.to

# Aspect Platform
ASPECT_API_KEY=your_aspect_key

# Agent Zero Communication
AGENT_ZERO_URL=http://agent-zero:80
```

### Step 4: Build Docker Images

```bash
# Build all services
docker-compose -f deploy/docker-compose.praxis.yml build

# Build individual services
docker-compose -f deploy/docker-compose.praxis.yml build agent-zero
docker-compose -f deploy/docker-compose.praxis.yml build praxis-orchestrator
```

### Step 5: Start Services

```bash
# Start all services
docker-compose -f deploy/docker-compose.praxis.yml up -d

# Check service status
docker-compose -f deploy/docker-compose.praxis.yml ps

# View logs
docker-compose -f deploy/docker-compose.praxis.yml logs -f
```

### Step 6: Verify Services

```bash
# Check Agent Zero
curl http://localhost:50080/health

# Check Praxis Orchestrator
curl http://localhost:3000/health

# Check container status
docker ps
```

---

## Verification & Testing

### Test InsForge MCP Connection

```bash
# From Agent Zero container
docker exec -it praxis-agent-zero bash

# Test MCP connection
curl -H "Authorization: Bearer $INSFORGE_MCP_TOKEN" \
     $INSFORGE_MCP_URL/health
```

### Test AgentMail.to Integration

1. Send test email to `cca@agentmail.to`
2. Check Praxis logs for processing:
```bash
docker-compose -f deploy/docker-compose.praxis.yml logs praxis-orchestrator
```

### Test Agent Zero Communication

```bash
# From Agent Zero CLI
/.status

# Should show:
# - Praxis Agent: Running
# - Email Queue: X pending
# - Systems: All operational
```

### Run Integration Tests

```bash
# From project root
cd praxis-platform
npm test
```

---

## Troubleshooting

### InsForge MCP Connection Issues

**Problem**: Cannot connect to InsForge MCP

**Solutions**:
1. Verify token is correct and active
2. Check network connectivity
3. Ensure firewall allows outbound HTTPS
4. Test with curl: `curl -v https://cloud-mcp.insforge.dev/health`

### AgentMail.to Webhook Not Receiving

**Problem**: Emails not being processed in real-time

**Solutions**:
1. Verify webhook URL is accessible from internet
2. Check AgentMail.to dashboard for webhook status
3. Ensure webhook secret matches
4. Test webhook with webhook.site

### Container Startup Failures

**Problem**: Containers fail to start or crash

**Solutions**:
1. Check Docker is running: `docker ps`
2. Verify environment variables in .env file
3. Check container logs: `docker logs <container-name>`
4. Ensure sufficient system resources

### Agent Zero Cannot Reach Praxis

**Problem**: Agent Zero shows Praxis as "down"

**Solutions**:
1. Verify both containers are on same Docker network
2. Check AGENT_ZERO_URL environment variable
3. Test connectivity: `docker exec praxis-agent-zero curl http://praxis-orchestrator:3000/health`
4. Restart services: `docker-compose restart`

### Memory/CPU Issues

**Problem**: Containers run slowly or crash

**Solutions**:
1. Check resource usage: `docker stats`
2. Increase Docker memory limits in Docker Desktop
3. Adjust container resource limits in docker-compose.yml
4. Reduce number of concurrent agent containers

---

## Production Deployment

### Railway Deployment

1. Push code to GitHub repository
2. Connect repository to Railway
3. Configure environment variables in Railway dashboard
4. Deploy services

**Environment Variables for Railway:**
```bash
# Same as local development, but with production URLs
INSFORGE_MCP_URL=cloud-mcp.insforge.dev
AGENTMAIL_API_KEY=production_key
# ... etc
```

### Monitoring

- **Agent Zero Dashboard**: Monitor system status
- **Logs**: View via `docker logs` or Railway logs
- **Metrics**: InsForge dashboard for database/storage metrics
- **Alerts**: Configure Monday.com notifications for exceptions

---

## Next Steps

1. **Configure Carbon Trading Skills**: Customize trading logic for your needs
2. **Set Up Scheduled Tasks**: Configure reconciliation and reporting schedules
3. **Integrate Additional Systems**: Add more business systems as needed
4. **Customize Agent Behavior**: Modify skills and memory patterns
5. **Scale for Production**: Optimize resource allocation and performance

---

## Support

For issues and questions:
- **Documentation**: Check README.md and other docs
- **Troubleshooting**: See TROUBLESHOOTING.md
- **Issues**: Open GitHub issue
- **Community**: Join Discord server

---

**Last Updated**: 2026-03-15
**Version**: 1.0.0

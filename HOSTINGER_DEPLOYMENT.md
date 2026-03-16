# Hostinger Docker Deployment Guide

## Overview

This guide covers deploying the **Praxis Agent Carbon Platform** to Hostinger using Docker Compose. Hostinger provides VPS hosting with full Docker support, making it ideal for running our multi-container application.

## Prerequisites

### Hostinger Requirements
- **VPS Plan**: KVM 2 or higher (recommended: KVM 3+ for production)
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS
- **RAM**: Minimum 4GB (8GB+ recommended)
- **Storage**: Minimum 40GB SSD
- **Root Access**: SSH access with sudo privileges

### Domain Setup (Optional but Recommended)
- Domain pointing to your VPS IP address
- DNS records configured (A record for root domain and subdomains)

## Step 1: VPS Initial Setup

### 1.1 Connect to Your VPS
```bash
ssh root@your-vps-ip-address
```

### 1.2 Update System Packages
```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose Plugin
apt install docker-compose-plugin -y

# Verify Installation
docker --version
docker compose version

# Add your user to docker group (optional, for non-root access)
usermod -aG docker $USER
```

### 1.4 Configure Firewall (UFW)
```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS (if running web server)
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Praxis Agent Carbon WebUI (default: 50080)
ufw allow 50080/tcp

# Allow InsForge Dashboard (default: 7131)
ufw allow 7131/tcp

# Check status
ufw status
```

## Step 2: Clone Repository

### 2.1 Install Git (if not already installed)
```bash
apt install git -y
```

### 2.2 Clone Your GitHub Repository
```bash
# Navigate to home directory
cd /home

# Clone the repository
git clone https://github.com/YOUR_USERNAME/CarbonAgent.git

# Navigate to project directory
cd CarbonAgent
```

## Step 3: Configure Environment Variables

### 3.1 Create Production Environment File
```bash
# Copy the example file
cp .env.railway.example .env.hostinger

# Edit the file
nano .env.hostinger
```

### 3.2 Required Configuration Changes

Edit `.env.hostinger` with your production values:

```bash
# ===================================================
# CRITICAL: Change these for production!
# ===================================================

# Authentication - GENERATE A STRONG SECRET!
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-random

# Database Credentials - CHANGE FROM DEFAULTS!
POSTGRES_USER=praxis_admin
POSTGRES_PASSWORD=your-strong-database-password-here
POSTGRES_DB=praxis_agent_carbon

# Admin Account - CHANGE IMMEDIATELY!
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password

# API Key - GENERATE NEW KEY (must start with ik_)
ACCESS_API_KEY=ik_your-production-api-key-32-chars-minimum

# ===================================================
# Optional: Configure for your domain
# ===================================================

# Server Configuration
PORT=7130

# InsForge API Configuration
API_BASE_URL=https://your-domain.com:7130
VITE_API_BASE_URL=https://your-domain.com:7130

# Encryption (can use same as JWT_SECRET if not provided)
ENCRYPTION_KEY=your-encryption-key-minimum-32-characters

# ===================================================
# Storage Configuration (Local or S3-compatible)
# ===================================================

# For local storage (default)
LOGS_DIR=/insforge-logs
STORAGE_DIR=/insforge-storage

# For S3/Wasabi storage (recommended for production)
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket-name
# S3_ENDPOINT_URL=https://s3.wasabisys.com  # For Wasabi

# ===================================================
# LLM Model API Keys
# ===================================================

# OpenRouter (for Claude, GPT-4, etc.)
OPENROUTER_API_KEY=your-openrouter-api-key

# ===================================================
# OAuth Configuration (Optional)
# Configure these if you want social login
# ===================================================

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# ===================================================
# Swarm Configuration
# ===================================================

TRIGGER_WORD=@Andy
DEFAULT_MODEL=claude-opus-4-1-20250805
```

### 3.3 Generate Secure Secrets

Use these commands to generate secure random strings:

```bash
# Generate JWT_SECRET (64 characters)
openssl rand -hex 32

# Generate Database Password (32 characters)
openssl rand -base64 24

# Generate API Key (must start with ik_)
echo "ik_$(openssl rand -hex 16)"
```

## Step 4: Deploy with Docker Compose

### 4.1 Build Docker Images
```bash
# Build all services
docker compose -f docker-compose.unified.yml build

# This may take 10-20 minutes on first build
```

### 4.2 Start Services
```bash
# Start in detached mode
docker compose -f docker-compose.unified.yml up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 4.3 Verify Services Are Running
```bash
# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Expected services:
# - praxis-postgres (database)
# - praxis-postgrest (API layer)
# - praxis-insforge (main application)
# - praxis-deno (serverless functions)
# - praxis-vector (log collection)
# - praxis-agent-carbon (WebUI)
# - praxis-swarm (agent orchestrator)
```

## Step 5: Access Your Application

### 5.1 Web Access

Once deployed, access your services:

- **Praxis Agent Carbon WebUI**: `http://your-vps-ip:50080`
- **InsForge Dashboard**: `http://your-vps-ip:7131`

### 5.2 SSH Access to Agent Container

The Praxis Agent Carbon container exposes SSH on port 22 (mapped to host port 22):

```bash
# SSH into the agent container
ssh -p 22 root@your-vps-ip
# Default password: check agent-zero documentation or set via environment
```

### 5.3 Database Access

PostgreSQL is accessible on port 5434 (mapped from container 5432):

```bash
# Connect to database
docker exec -it praxis-postgres psql -U postgres -d praxis_agent_carbon
```

## Step 6: SSL/TLS Configuration (Recommended)

### 6.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate
```bash
# For single domain
certbot certonly --standalone -d your-domain.com

# For multiple subdomains
certbot certonly --standalone -d your-domain.com -d www.your-domain.com -d agent.your-domain.com
```

### 6.3 Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/praxis-agent`:

```nginx
# Praxis Agent Carbon WebUI
server {
    listen 443 ssl;
    server_name agent.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:50080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# InsForge Dashboard
server {
    listen 443 ssl;
    server_name dashboard.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:7131;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/praxis-agent /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 7: Monitoring and Maintenance

### 7.1 View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f praxis-insforge

# Last 100 lines
docker compose logs --tail=100 praxis-agent-carbon
```

### 7.2 Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart praxis-insforge
```

### 7.3 Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.unified.yml up -d --build
```

### 7.4 Backup Database
```bash
# Create backup
docker exec praxis-postgres pg_dump -U postgres praxis_agent_carbon > backup-$(date +%Y%m%d).sql

# Restore from backup
docker exec -i praxis-postgres psql -U postgres praxis_agent_carbon < backup-20260316.sql
```

## Troubleshooting

### Services Won't Start
```bash
# Check Docker logs
docker compose logs

# Check disk space
df -h

# Check memory
free -h

# Restart Docker service
systemctl restart docker
```

### Database Connection Issues
```bash
# Check database health
docker exec praxis-postgres pg_isready -U postgres

# View database logs
docker logs praxis-postgres

# Restart database
docker compose restart postgres
```

### Port Already in Use
```bash
# Check what's using a port
netstat -tulpn | grep :50080

# Stop conflicting service or change port in docker-compose
```

### Out of Disk Space
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove old images
docker image prune -a

# Check volume sizes
docker system df -v
```

## Security Best Practices

1. **Change All Default Passwords**: Before deploying, change all default credentials
2. **Use Strong Secrets**: Generate random strings for JWT_SECRET and API keys
3. **Enable Firewall**: Only open necessary ports
4. **Regular Updates**: Keep system and Docker images updated
5. **SSL/TLS**: Always use HTTPS in production
6. **Backup Regularly**: Schedule automated database backups
7. **Monitor Logs**: Set up log monitoring for security events
8. **Limit SSH Access**: Use SSH keys instead of passwords
9. **Non-Root User**: Run containers as non-root when possible
10. **Resource Limits**: Set memory and CPU limits in Docker Compose

## Resource Requirements

### Minimum (Development/Testing)
- 2 vCPU cores
- 4GB RAM
- 40GB SSD

### Recommended (Production)
- 4+ vCPU cores
- 8GB+ RAM
- 80GB+ SSD
- Dedicated IP address

## Cost Estimate (Hostinger VPS)

| Plan | vCPU | RAM | Storage | Price/Month |
|------|------|-----|---------|-------------|
| KVM 2 | 2 | 4GB | 50GB | ~$10 |
| KVM 3 | 3 | 6GB | 80GB | ~$15 |
| KVM 4 | 4 | 8GB | 160GB | ~$20 |

## Support and Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Hostinger VPS Guide**: https://www.hostinger.com/tutorials/vps
- **Project Documentation**: See README.md and DEPLOYMENT.md in this repository

---

**Deployment Complete!** 🎉

Your Praxis Agent Carbon Platform is now running on Hostinger VPS with full Docker support.

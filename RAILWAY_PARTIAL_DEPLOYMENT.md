# Railway Deployment - Core Services Only

This configuration deploys only the core services that have been successfully built:
- **PostgreSQL**: Using ghcr.io/insforge/postgres image
- **Praxis Agent Carbon**: Successfully built
- **Praxis Swarm**: Successfully built

**NOT INCLUDED**: InsForge backend (build failure - see INSFORGE_BUILD_ISSUE.md)

## Quick Start

```bash
# Deploy to Railway
railway up

# Or using docker-compose directly
docker-compose -f docker-compose.railway.yml up -d
```

## Services Status

| Service | Status | Image | Port |
|----------|--------|--------|-------|
| PostgreSQL | ✅ Ready | ghcr.io/insforge/postgres:v15.13.2 | 5432 |
| Praxis Agent Carbon | ✅ Ready | praxis-agent-carbon:latest | 80 |
| Praxis Swarm | ✅ Ready | praxis-swarm:latest | - (internal) |

## Next Steps

1. Deploy this partial configuration to test core functionality
2. Resolve InsForge build issue (see INSFORGE_BUILD_ISSUE.md)
3. Once InsForge builds successfully, integrate full stack

## Railway-Specific Notes

- Railway automatically handles port mapping - the host port is assigned dynamically
- Environment variables are loaded from Railway's environment (no .env file needed)
- Volumes are handled by Railway's persistent storage
- Health checks are configured for automatic restarts

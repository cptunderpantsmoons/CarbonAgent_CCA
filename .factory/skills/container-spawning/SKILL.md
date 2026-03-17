---
name: container-spawning
version: 1.0.0
description: |
  Spawn and manage Docker containers for agent execution with proper isolation,
  resource limits, and lifecycle management. Use this when Swarm needs to create
  isolated agent environments or when agents need to run in containers.

  Complexities: Docker-in-Docker setup, volume mounting, resource limits,
  container lifecycle, IPC communication.
---

# Container Spawning

Spawn Docker containers for isolated agent execution with proper resource management and IPC setup.

## When to use this skill

Use this when you need to:
- Create isolated environments for agent execution
- Spawn multiple agent containers in parallel
- Set up containers with specific volume mounts
- Manage container lifecycle (create, start, stop, remove)
- Configure resource limits (CPU, memory) for containers
- Establish IPC communication between containers

## How it works

The container spawning system uses Docker-in-Docker with these components:

1. **Docker Socket Access**: Swarm container mounts /var/run/docker.sock
2. **Volume Management**: Mounts workspaces, IPC directories, and configuration
3. **Resource Limits**: CPU shares, memory limits, and device restrictions
4. **Container Orchestration**: Track running containers, health checks, cleanup
5. **IPC Setup**: Configure shared volumes for inter-container communication

## Key files

- `nanoclaw/src/container-runner.ts` - Main container spawning logic
- `nanoclaw/src/container-runtime.ts` - Docker runtime abstraction
- `docker-compose.unified.yml` - Swarm service configuration (privileged mode)
- `swarm-workspace/` - Mounted workspace directories

## Usage patterns

### Basic agent container

```typescript
// Spawn a basic agent container
const container = await spawnAgentContainer({
  imageName: 'agent0ai/agent-zero:latest',
  containerName: 'agent-session-123',
  volumes: [
    '/workspace/groups/my-group:/workspace:rw',
    '/workspace/ipc:/ipc:rw'
  ],
  environment: {
    SESSION_ID: 'session_123',
    MODEL: 'claude-opus-4-1-20250805'
  }
});

// Wait for container to finish
const result = await container.wait();
```

### Container with resource limits

```typescript
// Spawn container with CPU and memory limits
const container = await spawnAgentContainer({
  imageName: 'agent0ai/agent-zero:latest',
  containerName: 'agent-session-123',
  cpuShares: 512,  // 0.5 CPU
  memory: '512m',  // 512MB RAM
  memorySwap: '1g', // 1GB total (RAM + swap)
});

// Monitor resource usage
const stats = await container.stats();
```

### Container with custom workspace

```typescript
// Mount specific workspace directory
const container = await spawnAgentContainer({
  imageName: 'agent0ai/agent-zero:latest',
  containerName: 'agent-session-123',
  volumes: [
    '/workspace/groups/my-group:/workspace:rw',
    '/workspace/global/credentials:/root/.credentials:ro',  // read-only
    '/workspace/ipc:/ipc:rw'
  ],
  workingDir: '/workspace'
});
```

## Prerequisites

- Docker daemon running and accessible
- Swarm container running with privileged mode
- Docker socket mounted: /var/run/docker.sock
- Sufficient disk space for container images
- Network connectivity for pulling images

## Container lifecycle

1. **Preparation**: Pull image if not present, create volumes
2. **Creation**: Create container with configuration
3. **Starting**: Start container, wait for it to be ready
4. **Execution**: Container runs its main process
5. **Monitoring**: Track health, resource usage, logs
6. **Cleanup**: Stop container, remove volumes, clean up resources

## Configuration options

```typescript
interface ContainerConfig {
  imageName: string;           // Docker image to use
  containerName?: string;      // Auto-generated if not provided
  volumes?: VolumeMount[];     // Volume mounts
  environment?: Record<string, string>;  // Environment variables
  cpuShares?: number;          // CPU shares (relative weight)
  memory?: string;             // Memory limit (e.g., '512m')
  memorySwap?: string;         // Total memory limit (RAM + swap)
  devices?: string[];          // Devices to pass through
  networkMode?: string;        // Network mode (bridge, host, none)
  workingDir?: string;         // Working directory inside container
  command?: string[];          // Override default command
  autoRemove?: boolean;        // Auto-remove on exit
}

interface VolumeMount {
  source: string;              // Host path or volume name
  target: string;              // Container path
  readOnly?: boolean;          // Read-only mount
}
```

## Output format

```typescript
{
  containerId: 'abc123def456',
  containerName: 'agent-session-123',
  status: 'running',
  createdAt: '2026-03-16T10:00:00Z',
  exitCode: null,              // null while running
  logs: 'Container started...\n',
  resourceUsage: {
    cpuPercent: 25.5,
    memoryUsage: '256MB',
    memoryPercent: 50.0
  }
}
```

## Error handling

Common errors and solutions:

- **ImageNotFoundError**: Image doesn't exist, pull first: `docker pull <image>`
- **ContainerAlreadyExists**: Container with same name exists, remove or use different name
- **VolumeNotFoundError**: Volume doesn't exist, create first: `docker volume create <name>`
- **ResourceLimitError**: Limits too low/high, adjust CPU/memory limits
- **PermissionDenied**: Insufficient permissions, check Docker socket access
- **NetworkError**: Network issue, check Docker network configuration

## Best practices

1. **Always set resource limits**: Prevent containers from consuming all resources
2. **Use autoRemove**: Automatically remove containers when they exit
3. **Mount volumes read-only when possible**: Prevent accidental modifications
4. **Set meaningful names**: Makes debugging and monitoring easier
5. **Monitor container logs**: Stream logs to detect issues early
6. **Clean up old containers**: Remove stopped containers to free disk space
7. **Use health checks**: Configure health checks for long-running containers

## Security considerations

- Containers run as root by default (can be changed)
- File system access is restricted to mounted volumes
- Network access depends on network mode
- Privileged containers have full host access (required for Docker-in-Docker)
- Always validate user input before passing to container configuration
- Don't mount sensitive files (SSH keys, passwords) into containers

## Troubleshooting

**Container won't start:**
```bash
# Check container logs
docker logs agent-session-123

# Inspect container configuration
docker inspect agent-session-123

# Check Docker daemon is running
docker info
```

**Container can't access Docker socket:**
```bash
# Verify Swarm container has socket mounted
docker exec praxis-swarm ls -la /var/run/docker.sock

# Check Swarm container is privileged
docker inspect praxis-swarm | grep Privileged
```

**Volume mount issues:**
```bash
# Verify host path exists
ls -la /workspace/groups/my-group

# Check volume mount in container
docker exec agent-session-123 ls -la /workspace
```

**Resource limit issues:**
```bash
# Check host has enough resources
docker stats --no-stream

# Verify limits are set
docker inspect agent-session-123 | grep -A 10 Memory
```

## Verify it worked

After spawning a container:
1. Check that container is running: `docker ps | grep agent-session-123`
2. Verify volume mounts are correct: `docker inspect agent-session-123`
3. Confirm resource limits are applied: `docker stats agent-session-123`
4. Check logs for startup messages: `docker logs agent-session-123`
5. Ensure container stops and is removed after task completion

## What not to do

- Don't spawn containers without resource limits
- Don't mount sensitive host directories into containers
- Don't run containers as privileged unless absolutely necessary
- Don't ignore container exit codes - they indicate success/failure
- Don't leave stopped containers around - clean them up
- Don't mount Docker socket in containers that don't need it
- Don't set resource limits higher than available host resources

## Integration with Swarm

Swarm uses container spawning for:
- Agent execution: Spawn agent containers for each task
- Group isolation: Separate containers for each group context
- Scheduled tasks: Spawn containers for cron jobs
- Parallel execution: Multiple containers for concurrent tasks

## Monitoring

Monitor spawned containers:

```typescript
// List all running agent containers
const containers = await listAgentContainers();

// Get stats for specific container
const stats = await getContainerStats('agent-session-123');

// Stream logs from container
const logs = await streamContainerLogs('agent-session-123');

// Check container health
const health = await checkContainerHealth('agent-session-123');
```

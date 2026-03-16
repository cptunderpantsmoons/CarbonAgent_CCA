/**
 * Container Runner - Agent container lifecycle management
 */

import { Docker } from 'node-docker-api';
import { logger } from './utils/logger.js';

export interface ContainerConfig {
  runtime: string;
  image: string;
  memoryLimit: string;
  cpuLimit: string;
}

export interface AgentSpawnOptions {
  type: 'email-processing' | 'trading' | 'reconciliation' | 'reporting';
  emailData?: any;
  memoryPath: string;
  skill?: string;
}

export class ContainerRunner {
  private config: ContainerConfig;
  private docker: Docker;
  private runningContainers = new Map<string, any>();

  constructor(config: ContainerConfig) {
    this.config = config;
    this.docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });
  }

  async spawnAgent(options: AgentSpawnOptions): Promise<any> {
    const containerName = `praxis-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info(`Spawning agent container: ${containerName}`);

    try {
      // Create container
      const container = await this.docker.container.create({
        Image: this.config.image,
        name: containerName,
        Env: [
          `AGENT_TYPE=${options.type}`,
          `MEMORY_PATH=${options.memoryPath}`,
          `SKILL=${options.skill || 'default'}`,
        ],
        HostConfig: {
          Binds: [
            `${options.memoryPath}:/data/memory:rw`,
            `${process.env.CREDENTIALS_PATH || '/data/credentials'}:/data/credentials:ro`,
            `${process.env.STORAGE_PATH || '/data/storage'}:/data/storage:rw`,
          ],
          Memory: this.parseMemoryLimit(this.config.memoryLimit),
          NanoCpus: this.parseCpuLimit(this.config.cpuLimit),
        },
        Labels: {
          'praxis.agent.type': options.type,
          'praxis.agent.spawned': new Date().toISOString(),
        },
      });

      // Start container
      await container.start();

      // Track running container
      this.runningContainers.set(containerName, container);

      logger.info(`Agent container ${containerName} started successfully`);

      // Setup cleanup callback
      this.setupContainerCleanup(containerName, container);

      return container;

    } catch (error) {
      logger.error('Failed to spawn agent container:', error);
      throw error;
    }
  }

  private setupContainerCleanup(containerName: string, container: any): void {
    // Wait for container to finish
    container.wait((error: Error, data: any) => {
      this.runningContainers.delete(containerName);

      if (error) {
        logger.error(`Container ${containerName} exited with error:`, error);
      } else {
        logger.info(`Container ${containerName} completed successfully`);
      }

      // Cleanup container
      container.delete({ force: true }).catch(err => {
        logger.error(`Failed to cleanup container ${containerName}:`, err);
      });
    });
  }

  async stopContainer(containerName: string): Promise<void> {
    const container = this.runningContainers.get(containerName);
    if (!container) {
      logger.warn(`Container ${containerName} not found`);
      return;
    }

    logger.info(`Stopping container ${containerName}`);
    await container.stop({ t: 10 }); // 10 second grace period
    this.runningContainers.delete(containerName);
  }

  async stopAllContainers(): Promise<void> {
    logger.info('Stopping all running containers...');

    const promises = Array.from(this.runningContainers.keys()).map(name =>
      this.stopContainer(name).catch(error => {
        logger.error(`Failed to stop container ${name}:`, error);
      })
    );

    await Promise.all(promises);
    logger.info('All containers stopped');
  }

  getRunningContainerCount(): number {
    return this.runningContainers.size;
  }

  private parseMemoryLimit(limit: string): number {
    // Convert memory limit to bytes (e.g., "512m" -> 512 * 1024 * 1024)
    const match = limit.match(/^(\d+)([mg])?$/i);
    if (!match) return 512 * 1024 * 1024; // Default 512MB

    const value = parseInt(match[1], 10);
    const unit = match[2]?.toLowerCase();

    switch (unit) {
      case 'g':
        return value * 1024 * 1024 * 1024;
      case 'm':
        return value * 1024 * 1024;
      default:
        return value;
    }
  }

  private parseCpuLimit(limit: string): number {
    // Convert CPU limit to nano CPUs (e.g., "1" -> 1_000_000_000)
    const value = parseFloat(limit);
    return value * 1_000_000_000;
  }
}

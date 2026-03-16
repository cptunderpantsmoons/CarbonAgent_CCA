#!/usr/bin/env node
/**
 * Praxis Platform - Main Entry Point
 * Autonomous email processing agent for carbon credit trading
 */

import dotenv from 'dotenv';
import { PraxisOrchestrator } from './orchestrator.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'AGENT_ZERO_URL',
  'INSFORGE_MCP_TOKEN',
  'AGENTMAIL_API_KEY',
  'ASPECT_API_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', missingVars);
  logger.error('Please check your .env file');
  process.exit(1);
}

// Configuration
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  agentZeroUrl: process.env.AGENT_ZERO_URL!,
  insforgeMcp: {
    url: process.env.INSFORGE_MCP_URL || 'cloud-mcp.insforge.dev',
    token: process.env.INSFORGE_MCP_TOKEN!,
  },
  agentmail: {
    apiKey: process.env.AGENTMAIL_API_KEY!,
    inbox: process.env.AGENTMAIL_TO || 'cca@agentmail.to',
    websocketUrl: process.env.AGENTMAIL_WEBSOCKET_URL || 'wss://ws.agentmail.to/v0',
    apiUrl: process.env.AGENTMAIL_API_URL || 'https://api.agentmail.to/v0',
  },
  aspect: {
    apiKey: process.env.ASPECT_API_KEY!,
    apiUrl: process.env.ASPECT_API_URL || 'https://api.aspect.carbon/v1',
  },
  container: {
    runtime: process.env.CONTAINER_RUNTIME || 'docker',
    image: process.env.CONTAINER_IMAGE || 'praxis-agent:latest',
    memoryLimit: process.env.MEMORY_LIMIT || '512m',
    cpuLimit: process.env.CPU_LIMIT || '1',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};

async function main() {
  logger.info('Starting Praxis Platform...');

  try {
    // Initialize orchestrator
    const orchestrator = new PraxisOrchestrator(config);

    // Start services
    await orchestrator.initialize();
    await orchestrator.start();

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await orchestrator.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await orchestrator.shutdown();
      process.exit(0);
    });

    // Keep process running
    logger.info(`Praxis Platform running on port ${config.port}`);
    logger.info('Connected to Agent Zero at', config.agentZeroUrl);
    logger.info('Processing emails for', config.agentmail.inbox);

  } catch (error) {
    logger.error('Failed to start Praxis Platform:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  logger.error('Unhandled error in main():', error);
  process.exit(1);
});

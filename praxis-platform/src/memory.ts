/**
 * Memory Graph - Agent memory management system
 */

import { promises as fs } from 'fs';
import { logger } from './utils/logger.js';

export class MemoryGraph {
  private memoryPath: string;
  private globalMemoryPath: string;
  private emailCount = 0;
  private tradeCount = 0;

  constructor() {
    this.memoryPath = process.env.MEMORY_PATH || '/data/memory';
    this.globalMemoryPath = process.env.GLOBAL_MEMORY_PATH || '/data/global';
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Memory Graph...');

    // Ensure memory directories exist
    await fs.mkdir(this.memoryPath, { recursive: true });
    await fs.mkdir(this.globalMemoryPath, { recursive: true });

    // Initialize global memory if it doesn't exist
    const globalMemoryFile = `${this.globalMemoryPath}/CLAUDE.md`;
    try {
      await fs.access(globalMemoryFile);
    } catch {
      await this.createGlobalMemory(globalMemoryFile);
    }

    logger.info('Memory Graph initialized');
  }

  private async createGlobalMemory(path: string): Promise<void> {
    const content = `# Global Memory - Praxis Platform

# Created: ${new Date().toISOString()}

## System Patterns
- Email processing workflows are stored here
- Common trading patterns and best practices
- Learning from all email threads

## Metrics
- Total emails processed: 0
- Total trades executed: 0
- Common exceptions: []

## Last Updated: ${new Date().toISOString()}
`;

    await fs.writeFile(path, content, 'utf-8');
    logger.info('Created global memory file');
  }

  getThreadMemoryPath(threadId: string): string {
    return `${this.memoryPath}/${threadId}/CLAUDE.md`;
  }

  async getThreadMemory(threadId: string): Promise<string> {
    const path = this.getThreadMemoryPath(threadId);

    try {
      return await fs.readFile(path, 'utf-8');
    } catch (error) {
      // Create new thread memory if it doesn't exist
      await this.createThreadMemory(path, threadId);
      return await fs.readFile(path, 'utf-8');
    }
  }

  private async createThreadMemory(path: string, threadId: string): Promise<void> {
    await fs.mkdir(path.split('/').slice(0, -1).join('/'), { recursive: true });

    const content = `# Thread Memory: ${threadId}

# Created: ${new Date().toISOString()}

## Conversation Context
- Thread ID: ${threadId}
- Status: active

## Relationship History
- First contact: ${new Date().toISOString()}
- Total interactions: 0

## Trading Patterns
- No patterns detected yet

## Compliance Notes
- No compliance issues recorded

## Last Updated: ${new Date().toISOString()}
`;

    await fs.writeFile(path, content, 'utf-8');
    logger.debug(`Created thread memory for ${threadId}`);
  }

  async updateThreadMemory(threadId: string, updates: Record<string, string>): Promise<void> {
    const path = this.getThreadMemoryPath(threadId);
    let content = await this.getThreadMemory(threadId);

    // Update content
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}:.*$`, 'gm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}: ${value}`);
      } else {
        content += `\n${key}: ${value}`;
      }
    }

    // Update timestamp
    content = content.replace(
      /## Last Updated:.*/,
      `## Last Updated: ${new Date().toISOString()}`
    );

    await fs.writeFile(path, content, 'utf-8');
  }

  async recordSentEmail(event: any): Promise<void> {
    this.emailCount++;
    await this.updateGlobalMemory({ 'Total emails processed': this.emailCount.toString() });
  }

  async recordTrade(tradeData: any): Promise<void> {
    this.tradeCount++;
    await this.updateGlobalMemory({ 'Total trades executed': this.tradeCount.toString() });
  }

  async recordDelivery(event: any): Promise<void> {
    // Update delivery status in thread memory
    const threadId = event.threadId;
    await this.updateThreadMemory(threadId, {
      'Last delivery': new Date(event.timestamp).toISOString(),
    });
  }

  private async updateGlobalMemory(updates: Record<string, string>): Promise<void> {
    const path = `${this.globalMemoryPath}/CLAUDE.md`;
    let content = await fs.readFile(path, 'utf-8');

    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}:.*$`, 'gm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}: ${value}`);
      } else {
        const lines = content.split('\n');
        const metricsIndex = lines.findIndex(l => l.startsWith('## Metrics'));
        if (metricsIndex !== -1) {
          lines.splice(metricsIndex + 1, 0, `- ${key}: ${value}`);
          content = lines.join('\n');
        }
      }
    }

    content = content.replace(
      /## Last Updated:.*/,
      `## Last Updated: ${new Date().toISOString()}`
    );

    await fs.writeFile(path, content, 'utf-8');
  }

  getEmailCount(): number {
    return this.emailCount;
  }

  getTradeCount(): number {
    return this.tradeCount;
  }
}

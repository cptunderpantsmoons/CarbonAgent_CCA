/**
 * Agent Zero Reporter - Communication with Agent Zero command & control
 */

import fetch from 'node-fetch';
import { logger } from './utils/logger.js';

interface HeartbeatMetrics {
  emails_processed: number;
  trades_executed: number;
  exceptions: number;
  queue_depth: number;
}

interface HeartbeatMessage {
  type: 'heartbeat';
  timestamp: string;
  status: 'operational' | 'degraded' | 'down';
  metrics: HeartbeatMetrics;
}

interface ExceptionMessage {
  type: 'exception';
  severity: 'low' | 'medium' | 'high' | 'critical';
  exception_id: string;
  context: Record<string, any>;
  requires_human_intervention: boolean;
}

export class AgentZeroReporter {
  private agentZeroUrl: string;
  private apiKey: string;
  private exceptionCount = 0;

  constructor(agentZeroUrl: string) {
    this.agentZeroUrl = agentZeroUrl;
    this.apiKey = process.env.AGENT_ZERO_API_KEY || '';
  }

  async sendHeartbeat(message: HeartbeatMessage): Promise<void> {
    try {
      const response = await fetch(`${this.agentZeroUrl}/api/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.debug('Heartbeat sent successfully');
    } catch (error) {
      logger.error('Failed to send heartbeat:', error);
      // Don't throw - heartbeat failures should be logged but not crash the system
    }
  }

  async reportException(exception: ExceptionMessage): Promise<void> {
    try {
      this.exceptionCount++;

      const response = await fetch(`${this.agentZeroUrl}/api/exceptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(exception),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.warn('Exception reported to Agent Zero:', exception.exception_id);
    } catch (error) {
      logger.error('Failed to report exception:', error);
      throw error;
    }
  }

  async reportShutdown(): Promise<void> {
    try {
      await fetch(`${this.agentZeroUrl}/api/shutdown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          service: 'praxis-orchestrator',
        }),
      });

      logger.info('Shutdown notification sent to Agent Zero');
    } catch (error) {
      logger.error('Failed to send shutdown notification:', error);
    }
  }

  async getExceptionCount(): Promise<number> {
    return this.exceptionCount;
  }

  async registerCommandHandler(handler: (command: any) => Promise<void>): Promise<void> {
    // Setup WebSocket or webhook to receive commands from Agent Zero
    logger.info('Command handler registered with Agent Zero');
  }
}

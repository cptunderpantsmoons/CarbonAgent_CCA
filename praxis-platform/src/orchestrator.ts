/**
 * Praxis Orchestrator - Main message loop and task management
 */

import WebSocket from 'ws';
import { logger } from './utils/logger.js';
import { AgentZeroReporter } from './reporting.js';
import { ContainerRunner } from './container-runner.js';
import { TaskScheduler } from './scheduler.js';
import { MemoryGraph } from './memory.js';
import { PraxisConfig } from './utils/config.js';

export class PraxisOrchestrator {
  private config: PraxisConfig;
  private reporter: AgentZeroReporter;
  private containerRunner: ContainerRunner;
  private scheduler: TaskScheduler;
  private memoryGraph: MemoryGraph;
  private wsConnection: WebSocket | null = null;
  private isRunning = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: PraxisConfig) {
    this.config = config;
    this.reporter = new AgentZeroReporter(config.agentZeroUrl);
    this.containerRunner = new ContainerRunner(config.container);
    this.scheduler = new TaskScheduler();
    this.memoryGraph = new MemoryGraph();
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Praxis Orchestrator...');

    // Initialize memory graph
    await this.memoryGraph.initialize();

    // Setup task scheduler
    await this.scheduler.initialize();

    // Register scheduled tasks
    this.registerScheduledTasks();

    logger.info('Praxis Orchestrator initialized successfully');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Orchestrator is already running');
      return;
    }

    logger.info('Starting Praxis Orchestrator...');

    try {
      // Connect to AgentMail.to WebSocket
      await this.connectWebSocket();

      // Start task scheduler
      await this.scheduler.start();

      // Send initial heartbeat to Agent Zero
      await this.sendHeartbeat();

      // Setup heartbeat interval
      this.heartbeatInterval = setInterval(
        () => this.sendHeartbeat(),
        30000 // Every 30 seconds
      );

      this.isRunning = true;
      logger.info('Praxis Orchestrator started successfully');

    } catch (error) {
      logger.error('Failed to start Praxis Orchestrator:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Orchestrator is not running');
      return;
    }

    logger.info('Shutting down Praxis Orchestrator...');

    // Stop accepting new tasks
    this.isRunning = false;

    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Stop scheduler
    await this.scheduler.stop();

    // Close WebSocket connection
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }

    // Send shutdown notification to Agent Zero
    await this.reporter.reportShutdown();

    logger.info('Praxis Orchestrator shut down successfully');
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info(`Connecting to AgentMail.to WebSocket: ${this.config.agentmail.websocketUrl}`);

      this.wsConnection = new WebSocket(this.config.agentmail.websocketUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.agentmail.apiKey}`,
        },
      });

      this.wsConnection.on('open', () => {
        logger.info('WebSocket connection established');
        resolve();
      });

      this.wsConnection.on('message', async (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleEmailEvent(message);
        } catch (error) {
          logger.error('Error processing WebSocket message:', error);
        }
      });

      this.wsConnection.on('error', (error) => {
        logger.error('WebSocket error:', error);
        reject(error);
      });

      this.wsConnection.on('close', () => {
        logger.warn('WebSocket connection closed');
        if (this.isRunning) {
          // Attempt to reconnect
          setTimeout(() => {
            logger.info('Attempting to reconnect WebSocket...');
            this.connectWebSocket().catch(err => {
              logger.error('Reconnection failed:', err);
            });
          }, 5000);
        }
      });
    });
  }

  private async handleEmailEvent(event: any): Promise<void> {
    logger.info('Received email event:', event.event);

    try {
      switch (event.event) {
        case 'message.received':
          await this.processIncomingEmail(event);
          break;
        case 'message.sent':
          await this.processSentEmail(event);
          break;
        case 'message.delivered':
          await this.processDeliveryConfirmation(event);
          break;
        default:
          logger.debug('Unhandled event type:', event.event);
      }
    } catch (error) {
      logger.error('Error handling email event:', error);
      await this.reporter.reportException({
        type: 'email_processing_error',
        severity: 'high',
        context: { event, error: error.message },
        requiresHumanIntervention: false,
      });
    }
  }

  private async processIncomingEmail(event: any): Promise<void> {
    logger.info('Processing incoming email:', event.messageId);

    try {
      // Spawn agent container to process email
      const agent = await this.containerRunner.spawnAgent({
        type: 'email-processing',
        emailData: event,
        memoryPath: this.memoryGraph.getThreadMemoryPath(event.threadId),
      });

      // Agent will process email and report back
      logger.info('Agent spawned for email processing');

      // Update metrics
      await this.memoryGraph.recordSentEmail(event);
    } catch (error) {
      logger.error('Failed to process incoming email:', error);
      throw error;
    }
  }

  private async processSentEmail(event: any): Promise<void> {
    logger.info('Processing sent email:', event.messageId);
    // Update metrics and memory
    await this.memoryGraph.recordSentEmail(event);
  }

  private async processDeliveryConfirmation(event: any): Promise<void> {
    logger.info('Processing delivery confirmation:', event.messageId);
    // Update delivery status in memory
    await this.memoryGraph.recordDelivery(event);
  }

  private async sendHeartbeat(): Promise<void> {
    const metrics = {
      emails_processed: this.memoryGraph.getEmailCount(),
      trades_executed: this.memoryGraph.getTradeCount(),
      exceptions: await this.reporter.getExceptionCount(),
      queue_depth: this.scheduler.getQueueDepth(),
    };

    await this.reporter.sendHeartbeat({
      timestamp: new Date().toISOString(),
      status: 'operational',
      metrics,
    });

    logger.debug('Heartbeat sent to Agent Zero');
  }

  private registerScheduledTasks(): void {
    // Daily inventory reconciliation
    this.scheduler.registerTask({
      name: 'daily-reconciliation',
      schedule: process.env.RECONCILE_SCHEDULE || '0 8 * * *',
      handler: async () => {
        logger.info('Running daily inventory reconciliation');
        // Spawn agent to run reconciliation
      },
    });

    // Weekly reporting
    this.scheduler.registerTask({
      name: 'weekly-report',
      schedule: process.env.REPORT_SCHEDULE_WEEKLY || '0 9 * * 1',
      handler: async () => {
        logger.info('Generating weekly report');
        // Spawn agent to generate report
      },
    });

    // Compliance checks
    this.scheduler.registerTask({
      name: 'compliance-check',
      schedule: process.env.COMPLIANCE_CHECK_SCHEDULE || '0 */6 * * *',
      handler: async () => {
        logger.info('Running compliance check');
        // Spawn agent to check compliance
      },
    });

    logger.info('Registered scheduled tasks');
  }
}

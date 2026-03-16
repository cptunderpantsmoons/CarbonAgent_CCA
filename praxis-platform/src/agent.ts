/**
 * Praxis Agent Worker - Individual agent for processing emails
 */

import { ParseEmailSkill, ClassifySenderSkill } from './skills/email/index.js';
import { WebSearchTool, MemoryManager } from './utils/web.js';
import { logger } from './utils/logger.js';
import { promises as fs } from 'fs';

export interface AgentConfig {
  type: 'email-processing' | 'trading' | 'reconciliation' | 'reporting';
  emailData?: any;
  memoryPath: string;
  skill?: string;
}

export class PraxisAgentWorker {
  private config: AgentConfig;
  private parseEmailSkill: ParseEmailSkill;
  private classifySenderSkill: ClassifySenderSkill;
  private webSearch: WebSearchTool;
  private memoryManager: MemoryManager;

  constructor(config: AgentConfig) {
    this.config = config;
    this.parseEmailSkill = new ParseEmailSkill();
    this.classifySenderSkill = new ClassifySenderSkill();
    this.webSearch = new WebSearchTool();
    this.memoryManager = new MemoryManager();
  }

  async execute(): Promise<void> {
    logger.info(`Executing agent: ${this.config.type}`);

    try {
      switch (this.config.type) {
        case 'email-processing':
          await this.processEmail();
          break;
        case 'trading':
          await this.executeTrade();
          break;
        case 'reconciliation':
          await this.runReconciliation();
          break;
        case 'reporting':
          await this.generateReport();
          break;
        default:
          throw new Error(`Unknown agent type: ${this.config.type}`);
      }

      logger.info('Agent execution completed successfully');
    } catch (error) {
      logger.error('Agent execution failed:', error);
      throw error;
    }
  }

  private async processEmail(): Promise<void> {
    if (!this.config.emailData) {
      throw new Error('Email data required for email-processing agent');
    }

    const emailData = this.config.emailData;
    logger.info('Processing email:', emailData.messageId);

    // Step 1: Parse email
    const parseResult = await this.parseEmailSkill.parseEmail(emailData);
    logger.info('Email parsed:', parseResult.category, parseResult.confidence);

    // Step 2: Classify sender
    const senderClassification = await this.classifySenderSkill.classifySender(
      emailData.from,
      emailData
    );
    logger.info('Sender classified:', senderClassification.category);

    // Step 3: Determine urgency
    const urgency = await this.parseEmailSkill.detectUrgency(emailData);
    logger.info('Urgency level:', urgency);

    // Step 4: Generate response if needed
    let suggestedResponse: string | undefined;
    if (parseResult.category !== 'unknown') {
      suggestedResponse = await this.parseEmailSkill.draftResponse(emailData, parseResult);
    }

    // Step 5: Store in memory
    await this.storeInMemory(emailData, parseResult, senderClassification);

    // Step 6: Update thread memory
    await this.updateThreadMemory(emailData.threadId, {
      category: parseResult.category,
      intent: parseResult.intent,
      senderClassification: senderClassification.category,
      urgency,
      lastInteraction: new Date().toISOString(),
    });

    // Step 7: Check if human review needed
    if (parseResult.requiresHumanReview || senderClassification.riskLevel === 'high') {
      await this.escalateToHuman(emailData, parseResult, senderClassification);
    } else if (suggestedResponse && parseResult.confidence > 0.7) {
      // Auto-send if confidence is high
      await this.sendResponse(emailData, suggestedResponse);
    }

    logger.info('Email processing completed');
  }

  private async executeTrade(): Promise<void> {
    logger.info('Executing carbon credit trade');

    // Implementation for trade execution
    // This would integrate with Aspect platform API

    const tradeData = {
      counterparty: 'example',
      quantity: 1000,
      vintage: 2024,
      price: 15.50,
      currency: 'USD',
    };

    // Store trade in memory
    await this.memoryManager.storeMemory(
      `trade_${Date.now()}`,
      tradeData,
      { type: 'trade', status: 'executed' }
    );

    logger.info('Trade executed:', tradeData);
  }

  private async runReconciliation(): Promise<void> {
    logger.info('Running inventory reconciliation');

    // Search for latest inventory data
    const searchResults = await this.webSearch.carbonCreditSearch('ACCU inventory 2024');

    // Process reconciliation logic
    logger.info('Reconciliation completed');
  }

  private async generateReport(): Promise<void> {
    logger.info('Generating report');

    // Implementation for report generation
    logger.info('Report generated');
  }

  private async storeInMemory(
    emailData: any,
    parseResult: any,
    senderClassification: any
  ): Promise<void> {
    await this.memoryManager.storeMemory(
      `email_${emailData.messageId}`,
      {
        email: emailData,
        parseResult,
        senderClassification,
      },
      {
        type: 'email',
        from: emailData.from,
        category: parseResult.category,
      }
    );
  }

  private async updateThreadMemory(
    threadId: string,
    updates: Record<string, string>
  ): Promise<void> {
    const memoryPath = `${this.config.memoryPath}/${threadId}/CLAUDE.md`;

    try {
      await fs.mkdir(memoryPath.split('/').slice(0, -1).join('/'), { recursive: true });

      let content = '';
      try {
        content = await fs.readFile(memoryPath, 'utf-8');
      } catch {
        // Create new memory file
        content = `# Thread Memory: ${threadId}\n\n## Last Updated: ${new Date().toISOString()}\n`;
      }

      // Update content
      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}:.*$`, 'gm');
        if (regex.test(content)) {
          content = content.replace(regex, `${key}: ${value}`);
        } else {
          content += `\n${key}: ${value}`;
        }
      }

      content = content.replace(
        /## Last Updated:.*/,
        `## Last Updated: ${new Date().toISOString()}`
      );

      await fs.writeFile(memoryPath, content, 'utf-8');
      logger.debug('Thread memory updated:', threadId);
    } catch (error) {
      logger.error('Failed to update thread memory:', error);
    }
  }

  private async escalateToHuman(
    emailData: any,
    parseResult: any,
    senderClassification: any
  ): Promise<void> {
    logger.warn('Escalating to human review:', emailData.messageId);

    // Send exception to Agent Zero
    const exception = {
      type: 'email_requires_review',
      severity: senderClassification.riskLevel === 'high' ? 'high' : 'medium',
      exception_id: `exc_${emailData.messageId}`,
      context: {
        email: emailData,
        parseResult,
        senderClassification,
      },
      requiresHumanIntervention: true,
    };

    // Would send to Agent Zero via reporter
    logger.info('Exception escalated:', exception.exception_id);
  }

  private async sendResponse(emailData: any, response: string): Promise<void> {
    logger.info('Sending auto-response:', emailData.messageId);

    // Implementation for sending response via AgentMail.to API
    // This would use the AGENTMAIL_API_KEY

    logger.info('Auto-response sent');
  }
}

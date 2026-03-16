/**
 * Sender Classification Skill - Counterparty categorization and relationship tracking
 */

import { LLMProvider } from '../../utils/llm.js';
import { logger } from '../../utils/logger.js';

export interface SenderClassification {
  category: 'trading_partner' | 'regulator' | 'supplier' | 'customer' | 'internal' | 'unknown';
  trustLevel: 'high' | 'medium' | 'low';
  preferredCommunication: 'formal' | 'casual' | 'technical';
  typicalResponseTime: string;
  riskLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

export class ClassifySenderSkill {
  private llm: LLMProvider;
  private memory = new Map<string, SenderClassification>();

  constructor() {
    this.llm = new LLMProvider();
  }

  async classifySender(email: string, emailData: any): Promise<SenderClassification> {
    logger.info('Classifying sender:', email);

    // Check memory first
    if (this.memory.has(email)) {
      logger.debug('Sender found in memory');
      return this.memory.get(email)!;
    }

    const systemPrompt = `You are an expert relationship manager for carbon credit trading. Classify the email sender based on:
1. Domain and email address patterns
2. Communication style
3. Past interaction patterns
4. Industry knowledge

Categories:
- trading_partner: Known carbon trading counterparties
- regulator: Government agencies, auditors (KPMG, PwC)
- supplier: Project developers, verifiers
- customer: Buyers of carbon credits
- internal: Colleagues, same domain
- unknown: New contacts

Trust levels:
- high: Established relationship, verified counterparty
- medium: Some interaction history
- low: New or unverified contact

Risk levels:
- low: Established, compliant
- medium: New relationship, some due diligence
- high: Unverified or high-risk jurisdiction

Return JSON with classification details.`;

    const userMessage = `Classify this sender:

Email: ${email}
Subject: ${emailData.subject}
Body: ${emailData.text?.substring(0, 500)}...

Based on domain, communication style, and content.`;

    try {
      const response = await this.llm.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]);

      const classification = JSON.parse(response.content);
      logger.info('Sender classified:', classification.category, classification.trustLevel);

      // Store in memory
      this.memory.set(email, classification);

      return classification;
    } catch (error) {
      logger.error('Sender classification failed:', error);

      // Fallback based on domain
      return this.fallbackClassify(email);
    }
  }

  private fallbackClassify(email: string): SenderClassification {
    const domain = email.split('@')[1]?.toLowerCase() || '';

    // Known trading partners
    if (domain.includes('bank') || domain.includes('trading') || domain.includes('carbon')) {
      return {
        category: 'trading_partner',
        trustLevel: 'medium',
        preferredCommunication: 'formal',
        typicalResponseTime: '24 hours',
        riskLevel: 'low',
      };
    }

    // Regulators and auditors
    if (domain.includes('gov') || domain.includes('kpmg') || domain.includes('pwc')) {
      return {
        category: 'regulator',
        trustLevel: 'high',
        preferredCommunication: 'formal',
        typicalResponseTime: '48 hours',
        riskLevel: 'low',
        notes: 'Regulatory correspondence - high priority',
      };
    }

    // Internal
    if (domain.includes('agentmail.to') || domain.includes('praxis')) {
      return {
        category: 'internal',
        trustLevel: 'high',
        preferredCommunication: 'casual',
        typicalResponseTime: '4 hours',
        riskLevel: 'low',
      };
    }

    // Default unknown
    return {
      category: 'unknown',
      trustLevel: 'low',
      preferredCommunication: 'formal',
      typicalResponseTime: '24 hours',
      riskLevel: 'medium',
      notes: 'New contact - due diligence required',
    };
  }

  async updateRelationship(email: string, interaction: {
    responseTime: number;
    outcome: 'positive' | 'neutral' | 'negative';
    issues?: string[];
  }): Promise<void> {
    const current = this.memory.get(email);
    if (!current) return;

    // Update based on interaction
    const updated = { ...current };

    if (interaction.outcome === 'positive' && interaction.responseTime < 3600000) {
      updated.trustLevel = 'high';
    } else if (interaction.outcome === 'negative') {
      updated.trustLevel = 'low';
      updated.riskLevel = 'high';
    }

    if (interaction.issues) {
      updated.notes = `${updated.notes || ''}\nIssues: ${interaction.issues.join(', ')}`;
    }

    this.memory.set(email, updated);
    logger.info('Relationship updated for:', email);
  }

  getSenderHistory(email: string): SenderClassification | undefined {
    return this.memory.get(email);
  }

  getAllClassifications(): Map<string, SenderClassification> {
    return this.memory;
  }
}

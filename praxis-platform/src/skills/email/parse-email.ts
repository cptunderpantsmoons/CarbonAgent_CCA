/**
 * Email Parsing Skill - Intent recognition and entity extraction from emails
 */

import { LLMProvider } from '../../utils/llm.js';
import { logger } from '../../utils/logger.js';

export interface EmailParseResult {
  intent: string;
  confidence: number;
  entities: {
    counterparty?: string;
    quantity?: number;
    vintage?: number;
    price?: number;
    currency?: string;
    projectId?: string;
    invoiceNumber?: string;
    dueDate?: string;
    urgency?: 'critical' | 'high' | 'normal' | 'low';
  };
  category: 'trade' | 'transfer' | 'invoice' | 'rfi' | 'general' | 'unknown';
  suggestedResponse?: string;
  requiresHumanReview: boolean;
}

export class ParseEmailSkill {
  private llm: LLMProvider;

  constructor() {
    this.llm = new LLMProvider();
  }

  async parseEmail(emailData: any): Promise<EmailParseResult> {
    logger.info('Parsing email:', emailData.messageId);

    const systemPrompt = `You are an expert email analyzer for carbon credit trading operations. Your task is to:
1. Identify the primary intent of the email
2. Extract key entities (counterparty, quantities, prices, dates)
3. Categorize the email type
4. Assess urgency level
5. Determine if human review is needed

Intent categories:
- trade: Buy/sell carbon credits
- transfer: Move credits between entities
- invoice: Payment request or billing
- rfi: Request for information (audit, compliance)
- general: General communication
- unknown: Cannot determine

Urgency levels:
- critical: Immediate action required (<1 hour)
- high: Time-sensitive (<4 hours)
- normal: Standard business response (<24 hours)
- low: Informational (<72 hours)

Respond in JSON format with:
{
  "intent": "brief description",
  "confidence": 0.0-1.0,
  "entities": {...},
  "category": "trade|transfer|invoice|rfi|general|unknown",
  "urgency": "critical|high|normal|low",
  "suggestedResponse": "brief draft if applicable",
  "requiresHumanReview": boolean
}`;

    const userMessage = `Analyze this email:

Subject: ${emailData.subject}
From: ${emailData.from}
To: ${emailData.to.join(', ')}
Date: ${emailData.timestamp}

Body:
${emailData.text || emailData.extracted_text}

${emailData.attachments?.length ? `Attachments: ${emailData.attachments.map((a: any) => a.filename).join(', ')}` : ''}`;

    try {
      const response = await this.llm.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]);

      const result = JSON.parse(response.content);
      logger.info('Email parsed successfully:', result.category, result.intent);

      return result;
    } catch (error) {
      logger.error('Failed to parse email:', error);

      // Fallback to simple pattern matching
      return this.fallbackParse(emailData);
    }
  }

  private fallbackParse(emailData: any): EmailParseResult {
    const subject = emailData.subject?.toLowerCase() || '';
    const body = emailData.text?.toLowerCase() || '';

    // Simple keyword matching
    if (subject.includes('trade') || body.includes('buy') || body.includes('sell')) {
      return {
        intent: 'Trade request detected',
        confidence: 0.5,
        entities: {},
        category: 'trade',
        requiresHumanReview: true,
      };
    }

    if (subject.includes('invoice') || body.includes('payment')) {
      return {
        intent: 'Invoice received',
        confidence: 0.6,
        entities: {},
        category: 'invoice',
        requiresHumanReview: true,
      };
    }

    if (subject.includes('rfi') || subject.includes('audit') || body.includes('kpmg')) {
      return {
        intent: 'Regulatory inquiry',
        confidence: 0.7,
        entities: {},
        category: 'rfi',
        urgency: 'high',
        requiresHumanReview: true,
      };
    }

    return {
      intent: 'General communication',
      confidence: 0.3,
      entities: {},
      category: 'general',
      urgency: 'normal',
      requiresHumanReview: false,
    };
  }

  async extractEntities(text: string, category: string): Promise<Record<string, any>> {
    const systemPrompt = `Extract structured entities from text for carbon credit trading.

For ${category} emails, extract:
- Counterparty name
- Quantities (number of credits)
- Vintage year
- Price per credit
- Currency
- Project ID (if applicable)
- Invoice number (if applicable)
- Due date (if applicable)

Return JSON with key-value pairs.`;

    try {
      const response = await this.llm.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ]);

      return JSON.parse(response.content);
    } catch (error) {
      logger.error('Entity extraction failed:', error);
      return {};
    }
  }

  async detectUrgency(emailData: any): Promise<'critical' | 'high' | 'normal' | 'low'> {
    const subject = emailData.subject?.toLowerCase() || '';
    const body = emailData.text?.toLowerCase() || '';

    // Critical indicators
    if (subject.includes('urgent') || body.includes('immediate') || body.includes('asap')) {
      return 'critical';
    }

    // High urgency
    if (subject.includes('deadline') || body.includes('today') || body.includes('eby')) {
      return 'high';
    }

    // Low urgency
    if (subject.includes('fyi') || subject.includes('info')) {
      return 'low';
    }

    return 'normal';
  }

  async draftResponse(emailData: any, parseResult: EmailParseResult): Promise<string> {
    if (!parseResult.suggestedResponse) {
      const systemPrompt = `Draft a professional email response for carbon credit trading operations.

Context:
- Category: ${parseResult.category}
- Intent: ${parseResult.intent}
- Urgency: ${parseResult.urgency}

Guidelines:
- Be concise and professional
- Acknowledge receipt
- Set clear expectations for next steps
- Include relevant reference numbers
- Keep under 150 words`;

      try {
        const response = await this.llm.chat([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Original email:\n${emailData.text}` },
        ]);

        return response.content;
      } catch (error) {
        logger.error('Response drafting failed:', error);
        return 'Thank you for your email. We are reviewing your request and will respond shortly.';
      }
    }

    return parseResult.suggestedResponse;
  }
}

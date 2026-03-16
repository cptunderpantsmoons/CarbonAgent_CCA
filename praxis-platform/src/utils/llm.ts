/**
 * LLM Provider Integration - Support for multiple AI providers
 */

import fetch from 'node-fetch';
import { logger } from './logger.js';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMProvider {
  private providers: Map<string, any>;
  private defaultProvider: string;

  constructor() {
    this.providers = new Map();
    this.defaultProvider = process.env.DEFAULT_LLM_PROVIDER || 'zai';
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Z.AI Provider
    if (process.env.ZAI_API_KEY) {
      this.providers.set('zai', {
        apiKey: process.env.ZAI_API_KEY,
        baseURL: process.env.ZAI_BASE_URL || 'https://api.z.ai/api/coding/paas/v4',
        model: process.env.ZAI_MODEL || 'gpt-4',
      });
    }

    // xAI Grok Provider
    if (process.env.XAI_API_KEY) {
      this.providers.set('xai', {
        apiKey: process.env.XAI_API_KEY,
        baseURL: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
        model: process.env.XAI_MODEL || 'grok-2',
      });
    }

    // OpenRouter Provider
    if (process.env.OPENROUTER_API_KEY) {
      this.providers.set('openrouter', {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        model: 'anthropic/claude-3.5-sonnet',
      });
    }

    // Qwen Provider
    if (process.env.ANTHROPIC_AUTH_TOKEN) {
      this.providers.set('qwen', {
        apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
        baseURL: process.env.ANTHROPIC_BASE_URL,
        model: process.env.ANTHROPIC_MODEL || 'qwen3.5-plus',
      });
    }

    logger.info(`Initialized ${this.providers.size} LLM providers`);
  }

  async chat(
    messages: LLMMessage[],
    provider?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<LLMResponse> {
    const selectedProvider = provider || this.defaultProvider;
    const config = this.providers.get(selectedProvider);

    if (!config) {
      throw new Error(`Provider ${selectedProvider} not found`);
    }

    try {
      const response = await this.callProvider(config, messages, options);
      return {
        content: response.content,
        model: response.model,
        provider: selectedProvider,
        usage: response.usage,
      };
    } catch (error) {
      logger.error(`LLM call failed for provider ${selectedProvider}:`, error);

      // Try fallback providers
      if (selectedProvider !== this.defaultProvider) {
        logger.info('Falling back to default provider');
        return this.chat(messages, this.defaultProvider, options);
      }

      throw error;
    }
  }

  private async callProvider(
    config: any,
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<any> {
    const model = options?.model || config.model;

    // Determine API format based on provider
    if (config.baseURL.includes('z.ai') || config.baseURL.includes('openrouter')) {
      return this.callOpenAICompatible(config, messages, model, options);
    } else if (config.baseURL.includes('x.ai')) {
      return this.callXAI(config, messages, model, options);
    } else if (config.baseURL.includes('dashscope')) {
      return this.callAnthropicCompatible(config, messages, model, options);
    } else {
      throw new Error(`Unsupported provider: ${config.baseURL}`);
    }
  }

  private async callOpenAICompatible(
    config: any,
    messages: LLMMessage[],
    model: string,
    options?: any
  ): Promise<any> {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  private async callXAI(
    config: any,
    messages: LLMMessage[],
    model: string,
    options?: any
  ): Promise<any> {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  private async callAnthropicCompatible(
    config: any,
    messages: LLMMessage[],
    model: string,
    options?: any
  ): Promise<any> {
    // Convert messages format for Anthropic API
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${config.baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        system: systemMessage?.content || '',
        messages: chatMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  setDefaultProvider(provider: string): void {
    if (this.providers.has(provider)) {
      this.defaultProvider = provider;
      logger.info(`Default LLM provider set to: ${provider}`);
    } else {
      throw new Error(`Provider ${provider} not available`);
    }
  }
}

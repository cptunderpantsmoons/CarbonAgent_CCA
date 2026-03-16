/**
 * Web Search and Scraping Utilities
 */

import fetch from 'node-fetch';
import { logger } from './logger.js';

export class WebSearchTool {
  private tavilyApiKey: string;
  private firecrawlApiKey: string;

  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY || '';
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY || '';
  }

  async search(query: string, options?: {
    maxResults?: number;
    searchDepth?: 'basic' | 'advanced';
    domains?: string[];
  }): Promise<any[]> {
    if (!this.tavilyApiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.tavilyApiKey,
          query,
          max_results: options?.maxResults || 10,
          search_depth: options?.searchDepth || 'basic',
          include_domains: options?.domains,
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`Web search returned ${data.results?.length || 0} results`);

      return data.results || [];
    } catch (error) {
      logger.error('Web search failed:', error);
      throw error;
    }
  }

  async scrapeUrl(url: string): Promise<string> {
    if (!this.firecrawlApiKey) {
      throw new Error('Firecrawl API key not configured');
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('URL scraped successfully:', url);

      return data.data?.markdown || data.data?.html || '';
    } catch (error) {
      logger.error('URL scraping failed:', error);
      throw error;
    }
  }

  async carbonCreditSearch(query: string): Promise<any[]> {
    // Domain-specific search for carbon credit information
    return this.search(query, {
      domains: [
        'aspect.carbon',
        'goldstandard.org',
        'verra.org',
        'climateactionreserve.org',
        'carboncredit.com',
      ],
      maxResults: 5,
    });
  }
}

export class MemoryManager {
  private memoApiKey: string;

  constructor() {
    this.memoApiKey = process.env.MEMO_API_KEY || '';
  }

  async storeMemory(key: string, value: any, metadata?: Record<string, any>): Promise<void> {
    if (!this.memoApiKey) {
      logger.warn('Memo API key not configured, skipping memory storage');
      return;
    }

    try {
      await fetch('https://api.memo.ai/v1/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.memoApiKey}`,
        },
        body: JSON.stringify({
          key,
          value,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            source: 'praxis-platform',
          },
        }),
      });

      logger.info('Memory stored:', key);
    } catch (error) {
      logger.error('Memory storage failed:', error);
    }
  }

  async retrieveMemory(key: string): Promise<any | null> {
    if (!this.memoApiKey) {
      logger.warn('Memo API key not configured, skipping memory retrieval');
      return null;
    }

    try {
      const response = await fetch(`https://api.memo.ai/v1/memories/${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${this.memoApiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value;
    } catch (error) {
      logger.error('Memory retrieval failed:', error);
      return null;
    }
  }

  async searchMemories(query: string, limit: number = 10): Promise<any[]> {
    if (!this.memoApiKey) {
      logger.warn('Memo API key not configured, skipping memory search');
      return [];
    }

    try {
      const response = await fetch(`https://api.memo.ai/v1/memories/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.memoApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.memories || [];
    } catch (error) {
      logger.error('Memory search failed:', error);
      return [];
    }
  }
}

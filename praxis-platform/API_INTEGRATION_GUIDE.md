# Praxis Platform - API Integration Guide

Complete guide to all API integrations in the Praxis Platform.

---

## 📡 Integrated APIs

### 1. AgentMail.to - Email Processing
**Purpose**: Real-time email processing and management

**API Key**: `[API KEY HERE]`

**Endpoints**:
- WebSocket: `wss://ws.agentmail.to/v0`
- REST API: `https://api.agentmail.to/v0`

**Features**:
- Real-time email streaming via WebSocket
- Send/receive emails
- Thread management
- Attachment handling
- Webhook configuration

**Usage**:
```typescript
// WebSocket connection
const ws = new WebSocket('wss://ws.agentmail.to/v0', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});

// REST API
fetch('https://api.agentmail.to/v0/inboxes', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
})
```

---

### 2. LLM Providers - AI Processing

#### Z.AI (Primary Provider)
**Purpose**: Main LLM for email processing and response generation

**API Key**: `[API KEY HERE]`

**Base URL**: `https://api.z.ai/api/coding/paas/v4`

**Model**: GPT-4

**Features**:
- Email parsing and intent recognition
- Entity extraction
- Response generation
- Sender classification

#### xAI Grok
**Purpose**: Alternative LLM provider

**API Key**: `[API KEY HERE]`

**Base URL**: `https://api.x.ai/v1`

**Model**: Grok-2

**Features**:
- Fallback LLM provider
- Real-time web knowledge
- Alternative perspectives

#### OpenRouter
**Purpose**: Multi-model access

**API Key**: `[API KEY HERE]`

**Base URL**: `https://openrouter.ai/api/v1`

**Features**:
- Access to multiple AI models
- Model comparison and selection
- Cost optimization

#### Qwen 3.5 Plus (Alibaba)
**Purpose**: Anthropic-compatible LLM

**API Key**: `[API KEY HERE]`

**Base URL**: `https://coding-intl.dashscope.aliyuncs.com/apps/anthropic`

**Model**: Qwen 3.5 Plus

**Features**:
- Anthropic API compatibility
- Chinese language support
- Advanced reasoning

---

### 3. Web Search & Scraping

#### Tavily Web Search
**Purpose**: Web search for carbon credit information

**API Key**: `[API KEY HERE]`

**MCP URL**: `https://mcp.tavily.com/mcp/?tavilyApiKey=[API KEY HERE]`

**Features**:
- Real-time web search
- Carbon credit domain filtering
- Search depth control
- Result ranking

**Usage**:
```typescript
const search = new WebSearchTool();
const results = await search.search('carbon credit pricing 2024', {
  maxResults: 10,
  searchDepth: 'advanced',
  domains: ['aspect.carbon', 'verra.org']
});
```

#### Firecrawl Web Scraping
**Purpose**: Advanced web scraping for data extraction

**API Key**: `[API KEY HERE]`

**Base URL**: `https://api.firecrawl.dev/v1`

**Features**:
- Markdown and HTML extraction
- JavaScript rendering
- Sitemap crawling
- Rate limiting

**Usage**:
```typescript
const web = new WebSearchTool();
const content = await web.scrapeUrl('https://example.com');
```

---

### 4. Memory & Learning

#### Memo Advanced Memory
**Purpose**: Long-term memory storage and retrieval

**API Key**: `[API KEY HERE]`

**Base URL**: `https://api.memo.ai/v1`

**Features**:
- Key-value storage
- Semantic search
- Metadata tagging
- Timestamp tracking

**Usage**:
```typescript
const memory = new MemoryManager();

// Store
await memory.storeMemory('email_123', emailData, {
  type: 'email',
  category: 'trade'
});

// Retrieve
const data = await memory.retrieveMemory('email_123');

// Search
const results = await memory.searchMemories('carbon trades');
```

---

### 5. Code Execution

#### E2B Code Execution
**Purpose**: Secure code execution in sandboxed environments

**API Key**: `[API KEY HERE]`

**Base URL**: `https://api.e2b.dev`

**Features**:
- Sandboxed code execution
- Multiple language support
- File system access
- Network isolation

**Usage**:
```typescript
// Execute code in sandbox
const result = await e2bClient.code.exec('python', {
  code: 'print("Hello from E2B!")'
});
```

---

### 6. InsForge Cloud MCP (To Be Configured)
**Purpose**: Backend infrastructure (database, auth, storage)

**Required Variables**:
- `INSFORGE_MCP_URL`: `cloud-mcp.insforge.dev`
- `INSFORGE_MCP_TOKEN`: (Get from InsForge dashboard)
- `INSFORGE_PROJECT_ID`: (Get from InsForge dashboard)

**Setup**:
1. Visit https://insforge.dev
2. Create free account
3. Create new project
4. Get MCP credentials from Settings → MCP Server

---

### 7. Carbon Trading Business Systems (To Be Configured)

#### Aspect Platform
**Purpose**: Carbon credit trading execution

**Required**: API key from Aspect platform

**Features**:
- Trade execution
- Inventory management
- Position tracking
- Mark-to-market valuation

#### Xero Accounting
**Purpose**: Financial transactions and COGS tracking

**Required**: Xero developer account and API key

**Features**:
- Invoice creation
- Payment processing
- Account management
- Journal entries

#### Monday.com
**Purpose**: Workflow automation and exception handling

**Required**: API key and board setup

**Features**:
- Exception tracking
- Task management
- Team notifications
- Status updates

#### Planful
**Purpose**: Financial planning and consolidation

**Required**: Planful API access

**Features**:
- Budget management
- Forecast updates
- Report generation
- Data consolidation

---

## 🔧 Configuration

### Environment Variables

All API keys are configured in `.env` file:

```bash
# Copy example
cp praxis-platform/.env.example praxis-platform/.env

# Edit with your keys
nano praxis-platform/.env
```

### API Key Validation

The platform automatically validates required API keys on startup:

```typescript
// Required keys
const requiredKeys = [
  'AGENTMAIL_API_KEY',
  'ZAI_API_KEY',
  'TAVILY_API_KEY',
  'FIRECRAWL_API_KEY',
  'MEMO_API_KEY'
];

// Missing keys will prevent startup
```

---

## 🔒 Security Best Practices

### 1. API Key Storage
- Never commit `.env` file to version control
- Use environment variables in production
- Rotate keys regularly (90 days recommended)

### 2. Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Cache responses where appropriate

### 3. Error Handling
- Never log full API keys
- Sanitize error messages
- Implement retry logic with limits

### 4. Access Control
- Use read-only keys where possible
- Implement IP whitelisting
- Monitor API usage

---

## 📊 Usage Statistics

### API Call Tracking

The platform tracks API usage:

```typescript
// View current usage
await reporter.getApiUsageStats();

// Returns:
{
  zai: { calls: 150, tokens: 45000 },
  tavily: { calls: 20, searches: 20 },
  agentmail: { emailsProcessed: 75, sent: 30 }
}
```

### Cost Monitoring

Monitor API costs:

```typescript
// Estimated costs
{
  llm: { zai: '$2.50', xai: '$0.00' },
  search: { tavily: '$0.10' },
  email: { agentmail: '$5.00' },
  total: '$7.60'
}
```

---

## 🧪 Testing API Integrations

### Test AgentMail.to
```bash
# Send test email
echo "Test email from Praxis" | mail -s "Test" cca@agentmail.to

# Check logs
docker logs praxis-orchestrator
```

### Test LLM Providers
```bash
# From within container
docker exec -it praxis-orchestrator bash
node -e "console.log(await testLLM())"
```

### Test Web Search
```bash
# Via Agent Zero CLI
/.test-search "carbon credit pricing 2024"
```

---

## 📈 Performance Optimization

### 1. Response Caching
Cache LLM responses for similar queries:
```typescript
// Enable caching
const llm = new LLMProvider({ cache: true });
```

### 2. Batch Processing
Process multiple emails in batches:
```typescript
await batchProcessEmails(emails, { batchSize: 5 });
```

### 3. Parallel Requests
Use parallel API calls where independent:
```typescript
const [parseResult, senderClass] = await Promise.all([
  parseEmail(email),
  classifySender(email.from)
]);
```

---

## 🔄 Fallback Strategy

### LLM Provider Fallback
```typescript
// Automatic fallback on failure
Z.AI → xAI → OpenRouter → Qwen
```

### Web Search Fallback
```typescript
// Tavily → Firecrawl → Manual search
```

### Memory Fallback
```typescript
// Memo API → Local file system → In-memory
```

---

## 📞 Support

### API-Specific Support
- **AgentMail.to**: support@agentmail.to
- **Z.AI**: developer.z.ai
- **xAI**: x.ai/support
- **Tavily**: tavily.com/support
- **Firecrawl**: firecrawl.dev/support
- **Memo**: memo.ai/support
- **E2B**: e2b.dev/support

### Platform Support
- **Documentation**: See README.md
- **Issues**: Open GitHub issue
- **Community**: Discord server

---

**Last Updated**: 2026-03-15
**Version**: 1.0.0

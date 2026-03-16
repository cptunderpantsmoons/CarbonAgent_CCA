# Praxis Platform

Autonomous email processing agent for carbon credit trading operations, built on NanoClaw architecture with Agent Zero oversight.

## Overview

Praxis Platform is an intelligent email agent that:
- Processes emails via AgentMail.to in real-time
- Executes carbon credit trading operations autonomously
- Integrates with business systems (Aspect, Xero, Monday.com, Planful)
- Reports to Agent Zero command & control system
- Learns from email patterns and interactions

## Architecture

```
Agent Zero (Command & Control)
    ↓ Supervises
Praxis Orchestrator (This Platform)
    ↓ Uses
InsForge Cloud MCP (Database/Auth/Storage)
    ↓ Processes
AgentMail.to (Email Provider)
    ↓ Integrates
Business Systems (Aspect/Xero/Monday/Planful)
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Run with Docker
```bash
docker-compose -f ../deploy/docker-compose.local.yml up praxis-orchestrator
```

## Project Structure

```
praxis-platform/
├── src/
│   ├── index.ts                 # Main orchestrator entry point
│   ├── orchestrator.ts          # Message loop & task management
│   ├── container-runner.ts      # Agent container spawning
│   ├── reporting.ts             # Agent Zero communication
│   ├── skills/                  # Modular capabilities
│   │   ├── email/              # Email processing skills
│   │   └── trading/            # Carbon trading skills
│   └── utils/                  # Shared utilities
├── groups/                      # Agent memory
│   ├── cca/                    # Per-thread memory
│   └── global/                 # Global memory
├── tests/                       # Test files
└── deploy/                      # Deployment configs
```

## Skills

### Email Processing Skills
- `/parse-email` - Intent recognition & entity extraction
- `/classify-sender` - Counterparty categorization
- `/detect-urgency` - Priority assessment
- `/draft-response` - Automated response generation

### Carbon Trading Skills
- `/execute-trade` - Execute trades via Aspect API
- `/process-transfer` - Handle entity transfers
- `/handle-rfi` - Regulatory audit responses
- `/process-invoice` - Invoice processing
- `/reconcile-inventory` - Daily reconciliation
- `/monitor-compliance` - Compliance monitoring
- `/generate-report` - Scheduled reporting

## Communication with Agent Zero

### Heartbeat Messages
```typescript
{
  type: "heartbeat",
  timestamp: "2026-03-15T10:30:00Z",
  status: "operational",
  metrics: {
    emails_processed: 145,
    trades_executed: 7,
    exceptions: 2,
    queue_depth: 23
  }
}
```

### Exception Escalation
```typescript
{
  type: "exception",
  severity: "high",
  exception_id: "exc_123",
  context: { /* ... */ },
  requires_human_intervention: true
}
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
- `AGENT_ZERO_URL` - Agent Zero command & control endpoint
- `INSFORGE_MCP_TOKEN` - InsForge cloud MCP authentication
- `AGENTMAIL_API_KEY` - AgentMail.to API key
- `ASPECT_API_KEY` - Aspect trading platform API key

### Optional Variables
- `XERO_API_KEY` - Xero accounting integration
- `MONDAY_API_KEY` - Monday.com workflow automation
- `PLANFUL_API_KEY` - Planful financial planning

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Deployment

### Local Development
```bash
docker-compose -f ../deploy/docker-compose.local.yml up praxis-orchestrator
```

### Railway Production
```bash
railway up
```

## Monitoring

Praxis sends real-time metrics to Agent Zero:
- Email processing statistics
- Trade execution counts
- Exception status
- System health indicators

View status via Agent Zero dashboard:
```
/.status
```

## Security

- All containers run in isolated Docker environments
- API keys stored in read-only mounted volumes
- Audit logging for all operations
- PII detection and redaction
- Rate limiting per endpoint

## License

MIT

## Support

For issues and questions, contact the Praxis Carbon Team or refer to the main CarbonAgent documentation.

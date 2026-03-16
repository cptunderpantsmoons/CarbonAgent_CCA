# Praxis Agent Carbon Platform - Brand Glossary & Naming Conventions

This document defines the official brand names, terminology, and naming conventions used throughout the Praxis Agent Carbon Platform.

---

## 🏷️ Official Brand Names

### Platform Level
| Term | Status | Description |
|------|--------|-------------|
| **Praxis Agent Carbon Platform** | ✅ Current | The complete unified platform |
| CarbonAgent | ✅ Repository | Repository and project name |

### Component Names
| Component | Official Name | Former Name | Status |
|-----------|--------------|-------------|--------|
| Backend Infrastructure | **InsForge** | - | ✅ Active |
| Agent Framework | **Praxis Agent Carbon** | Agent Zero | ✅ Active |
| Orchestrator | **Swarm** | NanoClaw | ✅ Active |

### Service Names (Docker)
| Service | Container Name | Purpose |
|---------|---------------|---------|
| PostgreSQL | `praxis-postgres` | Database |
| PostgREST | `praxis-postgrest` | API layer |
| Backend | `praxis-insforge` | InsForge backend |
| Agent Framework | `praxis-agent-carbon` | Agent Zero framework |
| Orchestrator | `praxis-swarm` | Swarm orchestrator |
| Functions | `praxis-deno` | Deno runtime |
| Logs | `praxis-vector` | Log collection |

---

## 📖 Terminology

### Core Concepts

| Term | Definition |
|------|------------|
| **Agent** | An AI entity that can reason, plan, and execute tasks autonomously |
| **Swarm** | A collection of agents working together on different tasks |
| **Skill** | A reusable capability defined in SKILL.md format |
| **Project** | An isolated workspace for specific tasks with its own memory and files |
| **Memory** | Long-term storage of information agents can recall |
| **Channel** | Communication interface (WhatsApp, Telegram, Discord, etc.) |
| **Container** | Isolated environment where agents execute safely |
| **Workspace** | Directory structure for organizing agent work |
| **Trigger Word** | Command prefix to invoke the agent (e.g., `@Andy`) |

### Architecture Terms

| Term | Definition |
|------|------------|
| **Hierarchical Agents** | Multi-tier agent structure where higher-level agents delegate to subordinates |
| **Container Isolation** | Security model where each agent runs in isolated containers |
| **Persistent Memory** | Long-term knowledge storage across sessions |
| **Vector Embeddings** | Numerical representations of text for similarity search |
| **WebSocket Communication** | Real-time bidirectional communication protocol |
| **PostgREST** | Automatic REST API for PostgreSQL |
| **Edge Functions** | Serverless code execution at the edge |

---

## 🎯 Naming Conventions

### Code and Files

#### General Rules
- **snake_case** for files and directories: `agent_config.py`, `user_service.ts`
- **PascalCase** for classes and components: `AgentConfig`, `UserService`
- **camelCase** for variables and functions: `agentConfig`, `getUser()`
- **SCREAMING_SNAKE_CASE** for environment variables: `JWT_SECRET`, `DATABASE_URL`
- **kebab-case** for Docker services: `praxis-postgres`, `praxis-insforge`

#### Specific Patterns

**Agent Files**
```
python/tools/          # Tool implementations
python/helpers/        # Utility functions
python/extensions/     # Framework extensions
prompts/              # System prompts
agents/               # Agent profiles
usr/skills/           # Skill definitions
```

**Swarm Files**
```
src/channels/         # Channel implementations
src/container-runner/ # Agent container management
groups/               # Per-group workspaces
ipc/                  # Inter-process communication
```

**InsForge Files**
```
backend/src/api/      # API routes
backend/src/services/ # Business logic
backend/src/providers/ # External integrations
functions/            # Serverless functions
```

### Environment Variables

#### Naming Pattern
`[COMPONENT]_[CATEGORY]_[SPECIFIC]`

**Examples**
```bash
# InsForge
INSFORGE_API_BASE_URL
INSFORGE_JWT_SECRET
INSFORGE_POSTGRES_HOST

# Agent Zero
AGENT_ZERO_MODEL_PROVIDER
AGENT_ZERO_MEMORY_ENABLED
AGENT_ZERO_MAX_SUBAGENTS

# Swarm
SWARM_TRIGGER_WORD
SWARM_DEFAULT_MODEL
SWARM_GROUP_FOLDER_PATH

# Shared
POSTGRES_HOST
POSTGRES_PORT
JWT_SECRET
ENCRYPTION_KEY
```

### Database Naming

#### Tables
- **snake_case** plural: `users`, `agent_configs`, `swarm_groups`
- Prefix for component specificity: `agent_configs`, `swarm_messages`

#### Columns
- **snake_case**: `created_at`, `user_id`, `trigger_word`
- Standard columns:
  - `id UUID` (primary key)
  - `created_at TIMESTAMP WITH TIME ZONE`
  - `updated_at TIMESTAMP WITH TIME ZONE`
  - `{component}_id UUID` (foreign keys)

#### Indexes
- Pattern: `idx_{table}_{column(s)}`
- Examples: `idx_users_email`, `idx_memories_agent_id`

### Docker Naming

#### Containers
- Pattern: `praxis-{component}`
- Examples: `praxis-postgres`, `praxis-insforge`, `praxis-swarm`

#### Networks
- Pattern: `praxis-network`

#### Volumes
- Pattern: `{component}-data` or descriptive
- Examples: `postgres-data`, `swarm-node-modules`

#### Images
- Pattern: `praxis-{component}:{version}`
- Examples: `praxis-insforge:latest`, `praxis-swarm:v1.2.14`

---

## 🎨 Visual Identity

### Logos and Icons
- **Platform**: Robot/AI-themed logo (carbon atom structure)
- **InsForge**: Anvil/forge theme (building backend infrastructure)
- **Praxis Agent Carbon**: Brain/AI theme (intelligence and reasoning)
- **Swarm**: Honeycomb/beehive theme (organized collaboration)

### Color Scheme
- **Primary**: #1E3A8A (Deep Blue)
- **Secondary**: #10B981 (Emerald Green)
- **Accent**: #F59E0B (Amber)
- **Dark Mode**: #0F172A (Slate 900)
- **Light Mode**: #FFFFFF (White)

---

## 📝 Content Guidelines

### Documentation Style

#### README Files
- Start with clear description
- Include quick start guide
- Add architecture diagrams where relevant
- Use badges for status and metrics
- Include contribution guidelines

#### Code Comments
- **Python**: Google-style docstrings
- **TypeScript/JavaScript**: JSDoc comments
- **SQL**: Block comments for complex logic

#### Commit Messages
Follow conventional commits:
```
feat: add new skill system
fix: resolve database connection issue
docs: update API documentation
refactor: simplify agent initialization
test: add integration tests for memory
chore: update dependencies
```

---

## 🔄 Brand Transition

### Old Names (Deprecated)
| Old Name | New Name | Notes |
|----------|----------|-------|
| Agent Zero | Praxis Agent Carbon | Complete rebrand |
| NanoClaw | Swarm | Shortened name |
| Agent 0 | Praxis Agent Carbon | Framework name |
| NanoClaw Orchestrator | Swarm | Simplified |

### Migration Guide
When updating documentation or code:

1. **Replace**: `Agent Zero` → `Praxis Agent Carbon`
2. **Replace**: `NanoClaw` → `Swarm`
3. **Replace**: `agent-zero` → `praxis-agent-carbon` (services)
4. **Replace**: `nanoclaw` → `swarm` (services)
5. **Keep**: Repository name `CarbonAgent` unchanged

---

## 📢 Communication

### When referring to the platform:
- **Formal**: "The Praxis Agent Carbon Platform"
- **Short**: "Praxis Agent Carbon"
- **Informal**: "Carbon" (technical discussions only)

### When referring to components:
- **InsForge**: "The InsForge backend layer"
- **Praxis Agent Carbon**: "The agent framework"
- **Swarm**: "The orchestrator"

### Example Usage
```markdown
Good: "Deploy the Praxis Agent Carbon Platform with Docker Compose"
Good: "Configure Swarm to use PostgreSQL for persistence"
Good: "InsForge provides the authentication and storage layers"

Avoid: "Deploy Agent Zero" (use Praxis Agent Carbon)
Avoid: "Use NanoClaw for orchestration" (use Swarm)
```

---

## 🎯 Brand Values

### Key Attributes
1. **Modular**: Each component can be used independently
2. **Integrated**: Components work seamlessly together
3. **Secure**: Container isolation and encryption
4. **Extensible**: Skills system and plugins
5. **Transparent**: Open source and well-documented

### Taglines
- "Complete AI Agent Platform"
- "From Backend to Agents to Orchestration"
- "Build, Deploy, and Manage AI Agents"
- "The Unified Agent Platform"

---

## 📋 Checklist for New Content

Before creating new documentation, code, or marketing materials:

- [ ] Use official component names
- [ ] Follow naming conventions
- [ ] Include proper terminology
- [ ] Update glossary if introducing new terms
- [ ] Check for deprecated names
- [ ] Ensure consistency with existing docs

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-03-15 | Initial brand guidelines |
| | | Clarified naming conventions |
| | | Added transition guide |

---

<div align="center">
  <p>Part of the <strong>Praxis Agent Carbon Platform</strong></p>
  <p>Consistent branding = Better communication = Stronger community</p>
</div>

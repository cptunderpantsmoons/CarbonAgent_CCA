# CarbonAgent Skills Registry

This document lists all skills available for the CarbonAgent platform, organized by component and complexity.

## Skills Overview

| Skill | Component | Complexity | Purpose |
|-------|-----------|------------|---------|
| agent-code-execution | Praxis Agent Carbon | 4 | Execute code in multiple languages |
| container-spawning | Swarm | 5 | Spawn and manage Docker containers |
| task-scheduling | Swarm | 4 | Schedule recurring tasks with cron |
| browser-automation | Praxis Agent Carbon | 4 | Automate browser interactions |
| database-migration | InsForge | 3 | Manage PostgreSQL schema changes |

## Skill Details

### High Complexity (Level 5)

**container-spawning**
- **Component**: Swarm (nanoclaw/)
- **When to use**: Creating isolated agent environments, spawning containers
- **Key files**: `nanoclaw/src/container-runner.ts`, `docker-compose.unified.yml`
- **Prerequisites**: Docker daemon, privileged Swarm container
- **Complexity factors**: Docker-in-Docker, volume mounts, resource limits, IPC, lifecycle management

### High-Medium Complexity (Level 4)

**agent-code-execution**
- **Component**: Praxis Agent Carbon (agent-zero/)
- **When to use**: Running Python/JS/Bash code, testing implementations
- **Key files**: `agent-zero/python/tools/code_execution_tool.py`
- **Prerequisites**: Python 3.12+, Node.js 20+
- **Complexity factors**: Subprocess management, timeout handling, output streaming, cross-platform

**task-scheduling**
- **Component**: Swarm (nanoclaw/)
- **When to use**: Scheduling recurring tasks, cron jobs, periodic maintenance
- **Key files**: `nanoclaw/src/task-scheduler.ts`, `nanoclaw/src/db.ts`
- **Prerequisites**: Swarm service, SQLite database
- **Complexity factors**: Cron parsing, drift prevention, retry logic, timezone handling

**browser-automation**
- **Component**: Praxis Agent Carbon (agent-zero/)
- **When to use**: Web testing, form filling, data extraction
- **Key files**: `agent-zero/python/tools/browser_agent_tool.py`
- **Prerequisites**: Playwright, browser binaries
- **Complexity factors**: Browser lifecycle, element selection, wait conditions, JavaScript execution

### Medium Complexity (Level 3)

**database-migration**
- **Component**: InsForge (insforge/)
- **When to use**: Schema changes, adding tables, modifying structure
- **Key files**: `insforge/backend/src/infra/database/migrations/`
- **Prerequisites**: PostgreSQL 15+, Node.js 20+
- **Complexity factors**: Migration ordering, rollback logic, transaction handling, validation

## Usage Patterns

### Standalone Skills

These skills can be used independently:
- `database-migration` - Run migrations without other skills
- `task-scheduling` - Schedule tasks independently

### Composed Skills

These skills build on or work with others:
- `container-spawning` → Uses `task-scheduling` for scheduled container tasks
- `browser-automation` → Uses `agent-code-execution` for setup
- `task-scheduling` → May spawn containers using `container-spawning`

## Skill Invocation

Skills are invoked automatically based on task context:

```typescript
// Example: Agent needs to run code
const needs = analyzeTask("Process CSV file with pandas");
// → Invokes: agent-code-execution

// Example: Agent needs to schedule task
const needs = analyzeTask("Send daily report at 9 AM");
// → Invokes: task-scheduling

// Example: Agent needs to test web form
const needs = analyzeTask("Test login form on example.com");
// → Invokes: browser-automation

// Example: Agent needs to add new table
const needs = analyzeTask("Create audit_log table");
// → Invokes: database-migration

// Example: Agent needs isolated environment
const needs = analyzeTask("Run untrusted code in isolation");
// → Invokes: container-spawning
```

## Skill Metadata

Each skill includes:

### YAML Frontmatter
```yaml
---
name: skill-name
version: 1.0.0
description: |
  What the skill does.
  When to use it.
  Complexity indicators.
---
```

### Required Sections
1. **When to use this skill** - Clear usage guidelines
2. **How it works** - Technical overview
3. **Key files** - Relevant source files
4. **Usage patterns** - Code examples
5. **Prerequisites** - Requirements
6. **Error handling** - Common issues and solutions
7. **Best practices** - Recommended approaches
8. **Security considerations** - Security implications
9. **Troubleshooting** - Debugging tips
10. **Verify it worked** - Validation steps
11. **What not to do** - Anti-patterns to avoid

## Skill Development Roadmap

### Phase 1: Core Skills (Completed ✅)
- [x] agent-code-execution
- [x] container-spawning
- [x] task-scheduling
- [x] browser-automation
- [x] database-migration

### Phase 2: Integration Skills (Next)
- [ ] mcp-connection - Connect to MCP servers
- [ ] memory-management - Store and retrieve memories
- [ ] tool-execution - Execute agent tools
- [ ] websocket-management - WebSocket communication
- [ ] file-operations - File system operations

### Phase 3: Advanced Skills (Future)
- [ ] multi-agent-coordination - Coordinate multiple agents
- [ ] state-management - Manage application state
- [ ] authentication - User authentication flows
- [ ] storage-operations - S3/storage operations
- [ ] oauth-integration - OAuth provider integration

## Skill Quality Metrics

Skills are evaluated on:

- **Clarity**: Is the purpose clear from description?
- **Completeness**: Are all sections present?
- **Actionability**: Can an agent follow the instructions?
- **Examples**: Are there code examples for common use cases?
- **Error Handling**: Are common errors documented?
- **Verification**: Can success be validated?

## Contributing Skills

When adding new skills:

1. **Analyze the pattern**: Ensure it's complex and reusable enough
2. **Follow the template**: Use the standard skill structure
3. **Write clear descriptions**: Make the "when to use" section specific
4. **Include examples**: Provide code examples for common cases
5. **Document errors**: List common failures and solutions
6. **Verify independently**: Test the skill instructions work
7. **Version appropriately**: Use semantic versioning
8. **Update registry**: Add skill to this document

## Skill Maintenance

Skills require maintenance when:

- **Dependencies change**: Update command examples and requirements
- **APIs change**: Update code examples and patterns
- **Better approaches emerge**: Improve or replace skill
- **New edge cases found**: Add to troubleshooting section
- **Security issues discovered**: Update security considerations

## Skill Discovery

Find skills by searching for:

```bash
# List all skills
ls -R .factory/skills/

# Search by component
find .factory/skills -name "SKILL.md" -exec grep -l "nanoclaw" {} \;

# Search by complexity
find .factory/skills -name "SKILL.md" -exec grep -l "Complexity.*5" {} \;

# Search by keyword
find .factory/skills -name "SKILL.md" -exec grep -l "database" {} \;
```

## Skill Statistics

- **Total Skills**: 5
- **Average Complexity**: 4.0
- **Most Complex**: container-spawning (5)
- **Least Complex**: database-migration (3)
- **Components Covered**: 3 (Praxis Agent Carbon, Swarm, InsForge)
- **Pending Skills**: 20+ (identified in analysis)

## Related Documentation

- `AGENTS.md` - Platform development guide
- `README.md` - Platform overview
- `ARCHITECTURE.md` - System architecture
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Deployment instructions

---

**Last Updated**: March 16, 2026
**Registry Version**: 1.0.0

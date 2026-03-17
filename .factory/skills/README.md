# CarbonAgent Skills Directory

This directory contains skills for the CarbonAgent platform. Skills are reusable patterns and workflows that agents can invoke to accomplish common tasks.

## What Are Skills?

Skills are codified expertise - patterns that agents have discovered, refined, and documented for reuse. Instead of rediscovering solutions every time, agents can invoke skills to follow proven workflows.

## Available Skills

### Core Skills (Production Ready)

1. **agent-code-execution** (Complexity: 4)
   - Execute code in Python, JavaScript, and Bash
   - Session management with timeout handling
   - Cross-platform execution support

2. **container-spawning** (Complexity: 5)
   - Spawn Docker containers for isolated execution
   - Resource limits and volume management
   - IPC communication setup

3. **task-scheduling** (Complexity: 4)
   - Schedule recurring tasks with cron syntax
   - Drift prevention and retry logic
   - Timezone-aware execution

4. **browser-automation** (Complexity: 4)
   - Automate browser interactions with Playwright
   - Form filling, data extraction, screenshots
   - Element selection and wait conditions

5. **database-migration** (Complexity: 3)
   - Manage PostgreSQL schema changes
   - Versioned migrations with rollback support
   - Transaction handling and validation

See [SKILL_REGISTRY.md](./SKILL_REGISTRY.md) for complete details.

## How Skills Work

### Skill Structure

Each skill is a directory with a `SKILL.md` file:

```
.factory/skills/my-skill/
└── SKILL.md
```

The `SKILL.md` file contains:

1. **YAML Frontmatter**: Metadata (name, version, description)
2. **When to use**: Clear usage guidelines
3. **How it works**: Technical overview
4. **Usage patterns**: Code examples
5. **Prerequisites**: Requirements
6. **Error handling**: Common issues and solutions
7. **Best practices**: Recommended approaches
8. **Security considerations**: Security implications
9. **Troubleshooting**: Debugging tips
10. **Verify it worked**: Validation steps

### Skill Invocation

Skills are invoked automatically based on task context. The agent analyzes the task and selects appropriate skills.

Example:
```
Task: "Process CSV file with pandas"
Analysis: Requires code execution → Python → data processing
Action: Invoke agent-code-execution skill
```

## Using Skills

### For Agents

Agents automatically use skills when:
- A task matches a skill's use case
- The agent needs specialized expertise
- A proven workflow exists

Skills provide:
- Step-by-step instructions
- Code examples
- Error handling patterns
- Best practices
- Troubleshooting guides

### For Developers

Skills serve as documentation for complex workflows:
- Read skills to understand how components work
- Follow skill patterns when implementing features
- Reference skills when debugging issues
- Extend skills when improving workflows

## Creating New Skills

### When to Create a Skill

Create a skill when:
- A workflow is complex and non-obvious
- The pattern repeats across multiple sessions
- The solution took significant effort to discover
- Other agents would benefit from the knowledge

Don't create a skill for:
- Simple, one-time tasks
- Straightforward operations
- Things covered in standard documentation
- Trivial patterns

### Skill Template

```markdown
---
name: your-skill-name
version: 1.0.0
description: |
  What this skill does.
  When to use it.
  Complexity indicators.
---

# Your Skill Name

Brief description of what this skill accomplishes.

## When to use this skill

Use this when you need to:
- Task 1
- Task 2
- Task 3

## How it works

Technical overview of the approach.

## Key files

List relevant files and components.

## Usage patterns

### Basic example

```python
# Code example
result = do_something()
```

## Prerequisites

- Requirement 1
- Requirement 2

## Error handling

Common errors and solutions.

## Best practices

1. Practice 1
2. Practice 2

## Security considerations

Security implications of this skill.

## Troubleshooting

Common issues and how to fix them.

## Verify it worked

Steps to confirm successful execution.

## What not to do

Anti-patterns to avoid.
```

### Skill Creation Process

1. **Identify the pattern**: Notice a complex, repeating workflow
2. **Document the steps**: Write down each step clearly
3. **Add examples**: Include code examples for common cases
4. **Test independently**: Verify instructions work without hand-holding
5. **Get feedback**: Have other agents/users test the skill
6. **Iterate**: Improve based on feedback and usage

### Skill Quality Checklist

- [ ] Description is clear and specific
- [ ] "When to use" section has actionable criteria
- [ ] Code examples are accurate and tested
- [ ] Error handling covers common failures
- [ ] Troubleshooting section is comprehensive
- [ ] Verification steps are included
- [ ] Security considerations are documented
- [ ] Best practices are listed
- [ ] "What not to do" warns against anti-patterns

## Skill Maintenance

### When to Update Skills

Update skills when:
- Dependencies change versions
- APIs change or are deprecated
- Better approaches are discovered
- New edge cases are found
- Security issues are identified
- User feedback indicates confusion

### Versioning

Use semantic versioning:
- **Major (1.0.0 → 2.0.0)**: Breaking changes
- **Minor (1.0.0 → 1.1.0)**: New features, non-breaking changes
- **Patch (1.0.0 → 1.0.1)**: Bug fixes, documentation updates

### Deprecation

When deprecating a skill:
1. Update description to indicate deprecation
2. Link to replacement skill if available
3. Maintain for at least one major version
4. Document migration path

## Skill Discovery

### Browse Skills

```bash
# List all skills
find .factory/skills -type f -name "SKILL.md"

# View skill details
cat .factory/skills/agent-code-execution/SKILL.md
```

### Search Skills

```bash
# Search by keyword
grep -r "database" .factory/skills/*/SKILL.md

# Search by component
grep -r "nanoclaw" .factory/skills/*/SKILL.md

# Search by complexity
grep -r "Complexity.*5" .factory/skills/*/SKILL.md
```

### Filter Skills

```bash
# High complexity skills
find .factory/skills -name "SKILL.md" -exec grep -l "Complexity.*[45]" {} \;

# Specific component skills
find .factory/skills -name "SKILL.md" -exec grep -l "nanoclaw" {} \;
```

## Skill Metrics

Track skill effectiveness:
- How often is the skill invoked?
- Do users ask follow-up questions after using it?
- What error rates occur during skill execution?
- Are there common failure patterns?

## Contributing

Contributions are welcome! When adding skills:

1. Follow the skill template
2. Include code examples
3. Document errors thoroughly
4. Test independently
5. Update the registry
6. Increment version appropriately

## Related Documentation

- [SKILL_REGISTRY.md](./SKILL_REGISTRY.md) - Complete skill catalog
- [../AGENTS.md](../AGENTS.md) - Platform development guide
- [../README.md](../README.md) - Platform overview

## License

Skills are part of the CarbonAgent platform and follow the same license terms.

---

**Last Updated**: March 16, 2026
**Total Skills**: 5
**Average Complexity**: 4.0

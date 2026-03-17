---
name: task-scheduling
version: 1.0.0
description: |
  Schedule and manage recurring tasks with cron-based execution, drift prevention,
  and task persistence. Use this when agents need to run tasks periodically,
  set up automated jobs, or manage time-based workflows.

  Complexities: Cron parsing, drift correction, task persistence, error handling,
  retry logic, timezone handling.
---

# Task Scheduling

Schedule recurring tasks with cron-based timing, automatic retry, and persistent storage.

## When to use this skill

Use this when you need to:
- Run tasks at specific times (daily, weekly, monthly)
- Execute recurring jobs with cron syntax
- Schedule periodic maintenance tasks
- Set up automated reporting or monitoring
- Handle task failures with retry logic
- Prevent schedule drift from accumulating delays

## How it works

The task scheduling system uses cron-like scheduling with these components:

1. **Cron Parser**: Parses cron expressions and calculates next run times
2. **Task Store**: Persists tasks in SQLite database
3. **Scheduler Loop**: Checks for due tasks and executes them
4. **Drift Prevention**: Adjusts schedules to prevent time creep
5. **Error Handler**: Retries failed tasks with exponential backoff
6. **Timezone Support**: Handles timezone conversions correctly

## Key files

- `nanoclaw/src/task-scheduler.ts` - Main scheduler implementation
- `nanoclaw/src/db.ts` - Task persistence layer
- `nanoclaw/src/ipc.ts` - IPC communication for task results
- `swarm-workspace/ipc/` - Task status and result files

## Usage patterns

### Schedule a simple task

```typescript
// Schedule a daily task at 9 AM
const task = await scheduleTask({
  name: 'daily-report',
  cronExpression: '0 9 * * *',  // 9 AM every day
  command: 'generate-report',
  group: 'main',
  timezone: 'America/New_York'
});

// Returns: { taskId: 'task_123', nextRun: '2026-03-17T09:00:00-04:00' }
```

### Schedule with retry logic

```typescript
// Schedule with retry on failure
const task = await scheduleTask({
  name: 'fetch-data',
  cronExpression: '0 */6 * * *',  // Every 6 hours
  command: 'fetch-external-data',
  retryConfig: {
    maxRetries: 3,
    backoffMultiplier: 2,  // Exponential backoff
    initialDelayMs: 60000  // Start with 1 minute delay
  }
});
```

### Schedule with timeout

```typescript
// Schedule with execution timeout
const task = await scheduleTask({
  name: 'long-running-task',
  cronExpression: '0 0 * * 0',  # Midnight every Sunday
  command: 'weekly-backup',
  timeoutMs: 3600000  // 1 hour timeout
});
```

## Prerequisites

- Swarm service running
- SQLite database accessible
- IPC directory configured
- Proper timezone data available
- Sufficient permissions to spawn containers

## Cron expression format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6, 0 = Sunday)
│ │ │ │ │
* * * * *
```

Examples:
- `0 9 * * *` - 9:00 AM every day
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * 0` - Midnight every Sunday
- `0 9 * * 1-5` - 9:00 AM Monday through Friday
- `0 0 1 * *` - Midnight on the first day of every month

## Task lifecycle

1. **Creation**: Task is created and stored in database
2. **Scheduling**: Next run time is calculated from cron expression
3. **Waiting**: Scheduler monitors for due tasks
4. **Execution**: When due, task is executed (spawns container or runs command)
5. **Completion**: Result is saved, next run time is calculated
6. **Retry**: If failed, retry with backoff if configured
7. **Cleanup**: Old task results are archived or deleted

## Configuration options

```typescript
interface TaskConfig {
  name: string;                  // Unique task name
  cronExpression: string;        // Cron schedule
  command: string;               // Command to execute
  group?: string;                // Group context (default: 'main')
  timezone?: string;             // Timezone (default: UTC)
  enabled?: boolean;             // Enable/disable task (default: true)
  timeoutMs?: number;            // Execution timeout (default: 300000)
  retryConfig?: {
    maxRetries: number;          // Maximum retry attempts (default: 0)
    backoffMultiplier: number;   // Exponential backoff multiplier
    initialDelayMs: number;      // Initial retry delay
  };
  metadata?: Record<string, any>; // Custom metadata
}
```

## Output format

```typescript
{
  taskId: 'task_123',
  name: 'daily-report',
  cronExpression: '0 9 * * *',
  nextRun: '2026-03-17T09:00:00-04:00',
  lastRun: '2026-03-16T09:00:00-04:00',
  status: 'scheduled',           // scheduled, running, completed, failed
  runCount: 42,
  lastResult: {
    success: true,
    exitCode: 0,
    durationMs: 5234,
    output: 'Report generated successfully\n'
  }
}
```

## Error handling

Common errors and solutions:

- **InvalidCronExpression**: Cron syntax is invalid, verify format
- **TaskAlreadyExists**: Task with same name exists, use update instead
- **GroupNotFound**: Group doesn't exist, create group first
- **ExecutionTimeout**: Task exceeded timeout, increase limit or optimize task
- **RetryExhausted**: All retries failed, investigate root cause
- **TimezoneError**: Invalid timezone, use IANA timezone format (e.g., 'America/New_York')

## Best practices

1. **Use descriptive task names**: Makes debugging easier
2. **Set appropriate timeouts**: Prevent tasks from hanging forever
3. **Configure retry logic**: Handle transient failures gracefully
4. **Specify timezone**: Avoid confusion about execution times
5. **Monitor task execution**: Check logs and results regularly
6. **Test cron expressions**: Verify schedule before deploying
7. **Handle task dependencies**: Ensure required resources are available
8. **Clean up old results**: Prevent database from growing too large

## Drift prevention

Tasks can accumulate delays over time (e.g., if a task takes 5 minutes to run but is scheduled every minute). The scheduler prevents drift by:

1. **Calculating ideal schedule**: Based on cron expression, not previous run time
2. **Skipping missed runs**: If multiple runs were missed, only execute once
3. **Adjusting next run**: Always calculate from ideal schedule, not actual execution time

Example:
- Task scheduled for every minute: `* * * * *`
- Takes 2 minutes to run
- Without drift prevention: Runs at 9:00, 9:02, 9:04, 9:06...
- With drift prevention: Runs at 9:00, 9:01, 9:02, 9:03...

## Security considerations

- Tasks run with the same permissions as Swarm service
- Commands are executed in container context (isolated)
- Be careful with privileged commands (file deletion, system changes)
- Validate user input in task commands
- Don't schedule tasks with sensitive data in command string
- Use environment variables for sensitive configuration

## Troubleshooting

**Task not running:**
```bash
# Check if scheduler is running
docker logs praxis-swarm | grep -i scheduler

# Verify task is enabled
sqlite3 nanoclaw/data.db "SELECT * FROM tasks WHERE name='daily-report'"

# Check next run time
sqlite3 nanoclaw/data.db "SELECT name, next_run, enabled FROM tasks"
```

**Task failing repeatedly:**
```bash
# View task execution history
sqlite3 nanoclaw/data.db "SELECT * FROM task_runs WHERE task_id='task_123' ORDER BY created_at DESC LIMIT 10"

# Check task logs
docker logs praxis-swarm | grep -i "task_123"

# View IPC error files
ls -la swarm-workspace/ipc/errors/
```

**Schedule not working as expected:**
```bash
# Test cron expression
node -e "console.log(new CronParser('0 9 * * *').next().toString())"

# Verify timezone setting
sqlite3 nanoclaw/data.db "SELECT name, timezone FROM tasks"

# Check system time
docker exec praxis-swarm date
```

**Drift occurring:**
```bash
# Check execution times
sqlite3 nanoclaw/data.db "SELECT created_at FROM task_runs WHERE task_id='task_123' ORDER BY created_at DESC LIMIT 20"

# Verify drift prevention is enabled
docker logs praxis-swarm | grep -i drift
```

## Verify it worked

After scheduling a task:
1. Confirm task exists in database: `SELECT * FROM tasks WHERE name='your-task'`
2. Check next run time is correct: `SELECT name, next_run FROM tasks`
3. Verify task is enabled: `SELECT name, enabled FROM tasks`
4. Wait for next run time and check execution: `SELECT * FROM task_runs ORDER BY created_at DESC LIMIT 1`
5. Confirm task result is saved: `SELECT success, exit_code FROM task_runs`

## Task management commands

```typescript
// List all tasks
const tasks = await listTasks();

// Get specific task
const task = await getTask('task_123');

// Update task
await updateTask('task_123', { enabled: false });

// Delete task
await deleteTask('task_123');

// Run task immediately (ignore schedule)
await runTaskNow('task_123');

// Get task execution history
const history = await getTaskHistory('task_123', { limit: 10 });
```

## What not to do

- Don't schedule tasks more frequently than they can complete
- Don't ignore retry configuration - transient failures are common
- Don't schedule tasks without considering timezone differences
- Don't use overly complex cron expressions - keep them readable
- Don't schedule tasks that require interactive input
- Don't forget to disable tasks that are no longer needed
- Don't schedule tasks during maintenance windows unless intentional

## Integration with Swarm

Swarm uses task scheduling for:
- Periodic data fetching and processing
- Automated reporting and notifications
- Maintenance tasks (cleanup, backups)
- Health checks and monitoring
- Batch processing jobs
- Time-based agent triggers

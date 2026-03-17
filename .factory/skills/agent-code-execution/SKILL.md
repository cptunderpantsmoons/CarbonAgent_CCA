---
name: agent-code-execution
version: 1.0.0
description: |
  Execute code in multiple languages (Python, JavaScript, Bash) with proper
  session management, timeout handling, and output capture. Use this when
  an agent needs to run code snippets, test implementations, or execute
  scripts as part of task completion.

  Complexities: Handles subprocess management, streaming output, resource
  limits, and cross-platform execution (Linux/macOS/Windows).
---

# Agent Code Execution

Execute code snippets and scripts safely with proper session management and output capture.

## When to use this skill

Use this when an agent needs to:
- Run Python code for data processing, testing, or automation
- Execute JavaScript/Node.js scripts for backend operations
- Run Bash commands for system operations
- Test code implementations before finalizing
- Execute scripts with specific environments or dependencies

## How it works

The code execution system uses subprocess management with these key components:

1. **Session Management**: Each execution gets a unique session ID for tracking
2. **Timeout Handling**: Configurable timeouts to prevent hanging processes
3. **Output Capture**: Real-time stdout/stderr capture with streaming
4. **Resource Limits**: Memory and CPU limits to prevent resource exhaustion
5. **Cross-Platform**: Handles differences between Linux, macOS, and Windows

## Key files

- `agent-zero/python/tools/code_execution_tool.py` - Main execution framework
- `agent-zero/python/lib/subprocess_utils.py` - Subprocess management utilities
- `agent-zero/python/lib/session_manager.py` - Session tracking and cleanup

## Usage patterns

### Python execution

```python
# Execute Python code
result = execute_python(
    code="print('Hello, World!')",
    timeout=30,
    session_id="session_123"
)

# With dependencies
result = execute_python(
    code="import pandas as pd; df = pd.read_csv('data.csv')",
    requirements=["pandas"],
    session_id="session_123"
)
```

### JavaScript execution

```python
# Execute Node.js code
result = execute_javascript(
    code="console.log('Hello from Node.js')",
    timeout=30,
    session_id="session_123"
)
```

### Bash execution

```python
# Execute shell commands
result = execute_bash(
    command="ls -la /tmp",
    timeout=10,
    session_id="session_123"
)
```

## Prerequisites

- Python 3.12+ installed
- Node.js 20+ (for JavaScript execution)
- Proper file permissions for execution directories
- Sufficient memory and CPU for target operations

## Execution flow

1. **Code validation**: Check syntax and basic structure
2. **Session creation**: Generate unique session ID and working directory
3. **Environment setup**: Install dependencies if specified
4. **Process spawning**: Launch subprocess with proper isolation
5. **Output streaming**: Capture stdout/stderr in real-time
6. **Timeout monitoring**: Watch for timeout and kill if exceeded
7. **Resource cleanup**: Clean up session files and processes

## Output format

```python
{
    "success": True,
    "output": "Hello, World!\n",
    "error": "",
    "exit_code": 0,
    "duration_ms": 123,
    "session_id": "session_123"
}
```

## Error handling

Common errors and how to handle them:

- **SyntaxError**: Code has syntax errors, fix before re-executing
- **TimeoutError**: Execution exceeded timeout, consider increasing limit or optimizing code
- **MemoryError**: Process exceeded memory limits, reduce data size or increase limit
- **ImportError**: Missing dependencies, specify in requirements parameter
- **PermissionError**: Insufficient permissions, check file/directory permissions

## Best practices

1. **Always set timeouts**: Prevent infinite loops or hanging processes
2. **Use session IDs**: Track related executions together
3. **Clean up sessions**: Remove old session directories to prevent disk space issues
4. **Handle output size**: Large outputs can cause memory issues, implement streaming for big results
5. **Validate input**: Check code for dangerous operations before execution

## Security considerations

- Code runs in subprocess but NOT in full sandbox
- File system access is restricted to session directory
- Network access is allowed by default (can be restricted)
- Dangerous operations (rm -rf, etc.) should be filtered
- Always sanitize user input before execution

## Troubleshooting

**Execution hangs:**
```bash
# Check for orphaned processes
ps aux | grep -E "(python|node)" | grep -v grep

# Kill specific session
kill -9 $(pgrep -f "session_123")
```

**Output not captured:**
```python
# Ensure output is flushed
import sys
sys.stdout.flush()
```

**Dependencies not found:**
```bash
# Install manually for testing
pip install pandas
npm install lodash
```

## Verify it worked

After code execution:
1. Check that `success` is True in result
2. Verify output contains expected content
3. Confirm exit_code is 0 (or expected non-zero for errors)
4. Ensure session directory is cleaned up after use

## What not to do

- Don't execute code from untrusted sources without validation
- Don't set extremely long timeouts (max recommended: 300 seconds)
- Don't execute code that modifies system files outside session directory
- Don't run infinite loops without proper timeout handling
- Don't ignore error output - it often contains valuable debugging information

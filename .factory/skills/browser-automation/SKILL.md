---
name: browser-automation
version: 1.0.0
description: |
  Automate browser interactions for web testing, form filling, screenshots, and
  data extraction using browser-use library. Use this when agents need to
  interact with web pages, test web applications, or extract web data.

  Complexities: Browser lifecycle, element selection, wait conditions,
  JavaScript execution, screenshot capture, error handling.
---

# Browser Automation

Automate browser interactions for testing, data extraction, and web scraping.

## When to use this skill

Use this when you need to:
- Test web applications automatically
- Fill out and submit web forms
- Take screenshots of web pages
- Extract data from websites
- Automate multi-step web workflows
- Test web UI interactions
- Monitor web pages for changes
- Verify web application functionality

## How it works

The browser automation system uses the browser-use library with these components:

1. **Browser Controller**: Manages browser lifecycle (launch, control, close)
2. **Element Locator**: Finds web elements using various selectors (CSS, XPath, text)
3. **Action Executor**: Performs actions (click, type, scroll, wait)
4. **Screenshot Capture**: Captures and saves screenshots
5. **JavaScript Executor**: Runs custom JavaScript in page context
6. **Error Handler**: Handles timeouts, element not found, and other errors

## Key files

- `agent-zero/python/tools/browser_agent_tool.py` - Main browser automation tool
- `agent-zero/python/lib/browser_controller.py` - Browser lifecycle management
- `agent-zero/requirements.txt` - Dependencies (browser-use, playwright)

## Usage patterns

### Basic browser automation

```python
# Launch browser and navigate
result = automate_browser(
    url="https://example.com",
    actions=[
        {"action": "goto", "url": "https://example.com"},
        {"action": "wait_for_selector", "selector": "#login-form"},
        {"action": "type", "selector": "#username", "text": "user@example.com"},
        {"action": "type", "selector": "#password", "text": "password123"},
        {"action": "click", "selector": "button[type='submit']"},
        {"action": "wait_for_navigation"},
        {"action": "screenshot", "path": "/tmp/login-success.png"}
    ]
)
```

### Data extraction

```python
# Extract data from web page
result = automate_browser(
    url="https://example.com/products",
    actions=[
        {"action": "goto", "url": "https://example.com/products"},
        {"action": "wait_for_selector", "selector": ".product-item"},
        {"action": "extract", "selector": ".product-item", "fields": {
            "title": ".product-title",
            "price": ".product-price",
            "description": ".product-desc"
        }}
    ]
)

# Returns: {"data": [{"title": "...", "price": "...", "description": "..."}]}
```

### Form filling

```python
# Fill out complex form
result = automate_browser(
    url="https://example.com/form",
    actions=[
        {"action": "goto", "url": "https://example.com/form"},
        {"action": "wait_for_selector", "selector": "form"},
        {"action": "select", "selector": "#country", "value": "USA"},
        {"action": "type", "selector": "#name", "text": "John Doe"},
        {"action": "type", "selector": "#email", "text": "john@example.com"},
        {"action": "check", "selector": "#agree-terms"},
        {"action": "click", "selector": "button[type='submit']"},
        {"action": "wait_for_url", "pattern": "*success*"}
    ]
)
```

## Prerequisites

- Playwright installed (`pip install playwright`)
- Browser binaries installed (`playwright install`)
- Python 3.12+
- Sufficient memory for browser (200-500MB typical)
- Network connectivity for target websites

## Action types

### Navigation actions
- `goto` - Navigate to URL
- `go_back` - Go back in history
- `go_forward` - Go forward in history
- `refresh` - Refresh current page
- `wait_for_navigation` - Wait for page navigation
- `wait_for_url` - Wait for URL to match pattern

### Element actions
- `click` - Click on element
- `double_click` - Double click on element
- `right_click` - Right click on element
- `hover` - Hover over element
- `type` - Type text into input
- `clear` - Clear input field
- `select` - Select dropdown option
- `check` - Check checkbox
- `uncheck` - Uncheck checkbox
- `upload` - Upload file

### Information actions
- `screenshot` - Take screenshot
- `extract` - Extract data from elements
- `get_text` - Get text content
- `get_attribute` - Get element attribute
- `evaluate` - Execute JavaScript

### Wait actions
- `wait_for_selector` - Wait for element to appear
- `wait_for_text` - Wait for text to appear
- `wait_for_hidden` - Wait for element to be hidden
- `wait` - Wait for fixed time (ms)

## Configuration options

```python
{
    "url": "https://example.com",           # Starting URL
    "actions": [...],                        # List of actions
    "headless": True,                        # Run headless (default: True)
    "browser": "chromium",                   # Browser: chromium, firefox, webkit
    "timeout": 30000,                        # Default timeout (ms)
    "screenshot_on_error": True,             # Screenshot on failure
    "user_agent": "Custom User Agent",       # Custom user agent
    "viewport": {"width": 1920, "height": 1080},  # Viewport size
    "slow_mo": 0,                           # Slow down actions (ms)
    "ignore_https_errors": True,            # Ignore HTTPS errors
}
```

## Output format

```python
{
    "success": True,
    "actions_completed": 7,
    "actions_failed": 0,
    "screenshots": ["/tmp/screenshot1.png", "/tmp/screenshot2.png"],
    "data": [{"title": "...", "price": "..."}],  # If extracted
    "final_url": "https://example.com/success",
    "execution_time_ms": 5234,
    "error": null
}
```

## Error handling

Common errors and solutions:

- **TimeoutError**: Element or page didn't load in time, increase timeout or check selector
- **ElementNotFoundError**: Selector didn't match any elements, verify selector is correct
- **SelectorNotFoundError**: Multiple elements matched, make selector more specific
- **NavigationError**: Page navigation failed, check URL and network connectivity
- **JavaScriptError**: Script execution failed, check JavaScript syntax
- **BrowserCrashedError**: Browser process crashed, check system resources

## Best practices

1. **Use specific selectors**: Prefer IDs and classes over generic selectors
2. **Wait for elements**: Always wait for elements before interacting
3. **Handle dynamic content**: Use wait_for_selector, not fixed delays
4. **Take screenshots on error**: Helps debugging failed automations
5. **Clean up resources**: Always close browser when done
6. **Use explicit waits**: Avoid fixed sleep() calls
7. **Handle popups and dialogs**: Configure browser to handle alerts
8. **Respect rate limits**: Don't overwhelm servers with requests

## Security considerations

- Browser automation can execute arbitrary JavaScript
- Sensitive data (passwords, tokens) may be in screenshots
- Automations may trigger bot detection
- IP may be blocked for aggressive scraping
- User agent and fingerprints may be tracked
- Consider using proxy servers for large-scale scraping

## Troubleshooting

**Browser won't launch:**
```bash
# Install browser binaries
playwright install

# Check browser dependencies
playwright install-deps

# Verify installation
python -c "from playwright.sync_api import sync_playwright; print('OK')"
```

**Element not found:**
```python
# Test selector in browser console
document.querySelector("#my-element")

# Use more specific selector
# Bad: "button"
# Good: "button[type='submit'].primary-btn"

# Wait for element to appear
{"action": "wait_for_selector", "selector": "#my-element", "timeout": 10000}
```

**Actions happening too fast:**
```python
# Add slow_mo to slow down all actions
automate_browser(url="...", slow_mo=100)  # 100ms delay between actions

# Add explicit wait
{"action": "wait", "duration": 1000}
```

**Screenshot is empty/black:**
```python
# Wait for page to fully load
{"action": "wait_for_load_state", "state": "networkidle"}

# Increase viewport size
{"viewport": {"width": 1920, "height": 1080}}

# Wait for specific element
{"action": "wait_for_selector", "selector": "#content"}
```

## Verify it worked

After browser automation:
1. Check that `success` is True in result
2. Verify `actions_completed` matches expected number
3. Check screenshots were created if requested
4. Confirm extracted data contains expected information
5. Verify final URL is correct (if navigation occurred)
6. Check browser process was terminated

## Advanced patterns

### Handle multiple tabs

```python
result = automate_browser(
    url="https://example.com",
    actions=[
        {"action": "goto", "url": "https://example.com"},
        {"action": "click", "selector": "a[target='_blank']"},
        {"action": "wait_for_navigation"},
        {"action": "switch_tab", "index": 1},  # Switch to second tab
        {"action": "screenshot", "path": "/tmp/new-tab.png"},
        {"action": "close_tab"},
        {"action": "switch_tab", "index": 0}  # Back to first tab
    ]
)
```

### Execute JavaScript

```python
result = automate_browser(
    url="https://example.com",
    actions=[
        {"action": "goto", "url": "https://example.com"},
        {"action": "evaluate", "script": "document.title"},
        # Returns: {"result": "Example Domain"}
    ]
)
```

### Handle file downloads

```python
result = automate_browser(
    url="https://example.com",
    actions=[
        {"action": "goto", "url": "https://example.com"},
        {"action": "click", "selector": "a.download"},
        {"action": "wait_for_download", "timeout": 30000},
        {"action": "save_download", "path": "/tmp/downloaded-file.pdf"}
    ]
)
```

## What not to do

- Don't use browser automation for simple HTTP requests (use requests library instead)
- Don't ignore timeouts - they indicate something is wrong
- Don't use fragile selectors that break easily (dynamic classes, etc.)
- Don't take screenshots of every step - only important states
- Don't leave browser running - always close it when done
- Don't automate interactions that require CAPTCHA solving
- Don't overwhelm servers - add delays between requests
- Don't assume elements will be in the same order - use specific selectors

## Performance tips

1. **Run headless**: Disable GUI for faster execution
2. **Disable images**: Block images if not needed
3. **Use specific waits**: Avoid long fixed delays
4. **Reuse browser**: Keep browser open for multiple actions
5. **Parallelize**: Run multiple browser instances for independent tasks
6. **Cache selectors**: Store element references if used multiple times
7. **Minimize screenshots**: Only capture when necessary

## Integration with agent framework

The browser automation tool integrates with the agent framework:

```python
# Agent can invoke browser automation
result = agent.use_tool("browser_agent", {
    "url": "https://example.com",
    "actions": [...]
})

# Agent can analyze screenshots
if not result["success"]:
    screenshot = result["screenshots"][-1]
    analysis = agent.analyze_image(screenshot)
```

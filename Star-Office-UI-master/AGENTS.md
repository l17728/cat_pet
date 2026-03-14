# AGENTS.md - Star Office UI

> Guide for agentic coding agents working in this repository.

## Project Overview

**Star Office UI** is a pixel-style AI office dashboard that visualizes AI agent work status in real-time. Built with:
- **Backend**: Python 3.10+ / Flask
- **Frontend**: JavaScript (Phaser game engine)
- **Desktop**: Electron / Tauri (optional desktop pet mode)

## Build / Run Commands

### Backend (Primary)

```bash
# Install dependencies
python3 -m pip install -r backend/requirements.txt

# Initialize state file (first run only)
cp state.sample.json state.json

# Start backend server (default port: 19000)
cd backend && python3 app.py

# Access at http://127.0.0.1:19000
```

### Testing & Validation

```bash
# Smoke test (non-destructive endpoint check)
python3 scripts/smoke_test.py --base-url http://127.0.0.1:19000

# Security preflight check
python3 scripts/security_check.py
```

### State Management

```bash
# Set agent state via CLI
python3 set_state.py <state> "[detail]"

# Valid states: idle, writing, researching, executing, syncing, error
# Examples:
python3 set_state.py writing "正在整理文档"
python3 set_state.py idle "待命中"
```

### Desktop Pet (Optional)

```bash
cd desktop-pet
npm install
npm run dev
```

## Code Style Guidelines

### Python

**Imports & Formatting:**
```python
from __future__ import annotations  # Always first for modern type syntax

# Standard library imports first
import json
import os
from datetime import datetime
from pathlib import Path

# Third-party imports second
from flask import Flask, jsonify, request

# Local imports last
from security_utils import is_production_mode
from memo_utils import sanitize_content
```

**Type Hints:**
```python
# Use modern union syntax (requires Python 3.10+)
def normalize_state(s: str | None) -> str:
    ...

# Return types for functions
def load_state() -> dict:
    ...

def save_state(state: dict) -> None:
    ...
```

**Naming Conventions:**
- `snake_case` for functions, variables, methods
- `CAPS_SNAKE_CASE` for module-level constants (`STATE_FILE`, `VALID_STATES`)
- `PascalCase` for classes (if any)
- Private helpers prefix `_` (`_load_json`, `_save_json`)

**File Operations:**
```python
# Always use UTF-8 encoding
with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Cross-platform paths
path = os.path.join(ROOT_DIR, "subdir", "file.json")
# Or use pathlib:
path = Path(ROOT_DIR) / "subdir" / "file.json"
```

**Error Handling:**
```python
# Return defaults on error, don't crash
try:
    data = json.load(f)
except Exception:
    data = DEFAULT_STATE

# HTTP errors return JSON
return jsonify({"ok": False, "msg": "error details"}), 400
```

**Docstrings:**
```python
def function_name(arg: str) -> dict:
    """Brief one-line description.

    Longer explanation if needed.
    """
    ...
```

### JavaScript

**Variables:**
```javascript
// Use const for constants, let for mutable variables
const LAYOUT = { ... };
let currentState = 'idle';

// CAPS for constants
const FETCH_INTERVAL = 2000;
```

**Naming:**
- `camelCase` for functions, variables
- `PascalCase` for constructor functions / classes
- `CAPS_SNAKE_CASE` for true constants

**Async/Await:**
```javascript
// Prefer async/await over .then()
async function fetchData() {
  try {
    const response = await fetch('/status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

**Module Pattern:**
- No TypeScript - plain JavaScript
- Global `LAYOUT` config object loaded before `game.js`
- Phaser conventions for game logic

## Project Structure

```
Star-Office-UI/
├── backend/           # Flask backend
│   ├── app.py         # Main application
│   ├── security_utils.py
│   ├── memo_utils.py
│   └── store_utils.py
├── frontend/          # Phaser game frontend
│   ├── index.html
│   ├── layout.js      # Coordinates & config
│   └── game.js        # Main game logic
├── scripts/           # Utility scripts
│   ├── smoke_test.py
│   └── security_check.py
├── desktop-pet/       # Electron wrapper (optional)
├── electron-shell/    # Alternative Electron shell
└── set_state.py       # CLI state management
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | Get main agent state |
| `/set_state` | POST | Set main agent state |
| `/agents` | GET | Get multi-agent list |
| `/join-agent` | POST | Visitor joins office |
| `/agent-push` | POST | Visitor pushes status |
| `/yesterday-memo` | GET | Get yesterday's memo |

## Security Considerations

**Environment Variables:**
- `FLASK_SECRET_KEY` or `STAR_OFFICE_SECRET`: Session secret (24+ chars in production)
- `ASSET_DRAWER_PASS`: Sidebar password (8+ chars, not "1234")
- `STAR_OFFICE_ENV=production`: Enable production hardening
- `GEMINI_API_KEY`: For AI image generation (optional)

**Production Checklist:**
1. Set strong `FLASK_SECRET_KEY` (24+ chars)
2. Change default `ASSET_DRAWER_PASS` from "1234"
3. Run `scripts/security_check.py` before deployment
4. File permissions: `runtime-config.json` should be `0600`

## Valid Agent States

| State | Area | Description |
|-------|------|-------------|
| `idle` | breakroom | Waiting / resting |
| `writing` | writing | Writing code/docs |
| `researching` | writing | Researching/searching |
| `executing` | writing | Running commands |
| `syncing` | writing | Syncing data |
| `error` | error | Bug / exception |

## Common Patterns

### Adding a new API endpoint

```python
@app.route("/new-endpoint", methods=["GET", "POST"])
def new_endpoint():
    """Description of what this does."""
    try:
        # For POST: data = request.get_json()
        # Process...
        return jsonify({"ok": True, "result": data})
    except Exception as e:
        return jsonify({"ok": False, "msg": str(e)}), 500
```

### Adding a new utility module

```python
#!/usr/bin/env python3
"""Module description."""

from __future__ import annotations

import os
from typing import Any

# Constants at top
DEFAULT_VALUE = {}

def helper_function(arg: str) -> dict:
    """Brief description."""
    ...
```

## Testing

No formal test framework. Use smoke test for validation:

```bash
python3 scripts/smoke_test.py --base-url http://127.0.0.1:19000
```

Manual state testing:

```bash
python3 set_state.py writing "测试状态"
python3 set_state.py error "测试错误"
python3 set_state.py idle "恢复待命"
```
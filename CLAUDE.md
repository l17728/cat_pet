# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **cat-pet** (v3.0.0) — a virtual cat raising simulation skill for the **OpenClaw** agent platform. It is designed as a pure-logic tool skill: business logic runs in JavaScript, and the OpenClaw Agent's LLM handles natural language formatting. No LLM calls should be made inside the skill code itself.

The skill is installed into `~/.openclaw/workspace/skills/cat-pet/` and invoked when users send cat-related messages to an OpenClaw agent.

## Running Tests

```bash
node test.js           # main test suite
node test-game.js      # game flow tests
node test-enhanced.js  # enhanced features tests
node test-evolution.js # evolution system tests
node test-verify.js    # verification tests
```

There is no lint or build step — this is plain Node.js with no transpilation.

## Architecture

There are **two parallel implementations** in this repo:

### 1. `cat-core.js` + `core/` — Evolution System (v3.0)
The primary entry point. `cat-core.js` (main module per `package.json`) imports the evolution subsystem from `core/evolution-index.js`, which re-exports all evolution components:

- `core/evolvable.js` — base interface and shared utilities (`loadCatData`, `saveCatData`, `callLLM`, rarity helpers)
- `core/evolution-manager.js` — orchestrates all evolution checks after interactions
- `core/action-system.js` — cats learn/invent new actions
- `core/reaction-system.js` — personality-based unique reactions
- `core/toy-system.js` — toys develop new play styles after 30 uses
- `core/facility-system.js` — cats renovate their environment (trust ≥ 60)
- `core/auto-action-system.js` — autonomous behavior decisions (exploration, requests to owner)
- `utils/cat-tools.js` — pure utility functions with no side effects

Data is persisted as JSON files at `$OPENCLAW_WORKSPACE/cat-pet/data/{userId}.json` and `cat_{catId}.json`.

### 2. `src/` — Extended System (v2.0+ modules)
`src/index.js` exports a `CatPetSystem` singleton class that composes many subsystems:

- `src/data/backup.js`, `src/data/error-handler.js` — data reliability
- `src/core/bond-system.js` — affection/bond points
- `src/core/streak-reward.js` — daily care streak bonuses
- `src/core/tutorial.js` — onboarding guidance
- `src/core/aigc-photo.js` — AI-generated cat photo descriptions
- `src/core/self-evolution.js` — scans `extensions/` directory every 15 min for hot-loadable modules
- `src/core/growth-system.js`, `skill-tree.js`, `achievement-system.js` — progression systems
- `src/core/exploration-system.js`, `social-system.js`, `multi-cat-system.js`, `biography-system.js`
- `src/core/logging-system.js` — structured interaction logs

### Integration Pattern

```
User message → OpenClaw Agent → selects tool → cat-core.js function → returns structured data → Agent LLM formats response
```

The `AGENT_INSTRUCTIONS.md` file documents all available tool functions and their expected return shapes for the Agent's system prompt.

## Key Design Constraints

- **No direct LLM calls in skill code.** The `callLLM` utility in `core/evolvable.js` exists as a stub/interface — actual LLM invocation is the Agent's responsibility. Any code that calls `sessions_spawn` directly is considered a design anti-pattern (documented in `ARCHITECTURE_REDESIGN.md`).
- **Pure functions preferred.** Tool functions should take input, mutate persisted JSON, and return structured objects — not formatted text.
- **Data directory is runtime-determined** via `OPENCLAW_WORKSPACE` env var, defaulting to `/root/.openclaw/workspace`.

## Archived Tests

`tests/archive/` contains older test files from pre-v3.0 development. These are not part of the active test suite.

---
layout: doc
title: Getting Started
description: Install architect-lint for your AI agent, configure your repo, run reviews locally, and optionally automate PR checks in GitHub CI.
---

Architect Lint runs AI architecture reviews against a catalog of principles. Every finding links to a stable rule page with examples and rationale.

<TerminalDemo />

## Prerequisites

- An **AI coding agent** — Cursor, Claude Code, Codex, or any agent that can run slash commands and read project skills
- A repo with **Nx**, **React**, or **NestJS** code to review
- For **GitHub CI** (optional): `ANTHROPIC_API_KEY` in repository secrets — the bundled workflow uses [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)

Claude Code is **not** required for local reviews. Pick whichever agent your team already uses.

## Install for your agent

Architect Lint ships `skills/`, `commands/`, and `catalog/`. Load them through your agent’s plugin or skills mechanism.

### Cursor

```bash
git clone https://github.com/matipojo/architect-lint.git
ln -sfn "$(pwd)/architect-lint" ~/.cursor/plugins/local/architect-lint
```

Reload Cursor, then invoke `/architect-lint-review` or `/architect-lint`.

### Claude Code

The plugin is published from the `matipojo-architect-lint` marketplace in this repository.

**In a Claude Code session:**

```bash
/plugin marketplace add matipojo/architect-lint
/plugin install architect-lint@matipojo-architect-lint --scope project
```

Reload plugins if prompted, then verify `/architect-lint-review` is available.

**From the terminal:**

```bash
claude plugin marketplace add matipojo/architect-lint --scope project
claude plugin install architect-lint@matipojo-architect-lint --scope project
```

> [!TIP]
> Use `--scope project` so teammates inherit the same plugin through repo settings.

### Other agents (Codex, etc.)

If your agent does not use the Cursor or Claude Code plugin formats, point it at this repo’s skills and commands:

1. Clone or vendor [`skills/`](https://github.com/matipojo/architect-lint/tree/main/skills) and [`commands/`](https://github.com/matipojo/architect-lint/tree/main/commands) into your project’s agent config (for example `AGENTS.md`, `.agents/skills/`, or your tool’s equivalent).
2. Ensure the agent can read `catalog/stacks/**/*.rule.md` at review time — skills are thin pointers, not duplicated rules.
3. Run `/architect-lint-review` if your agent supports slash commands, or ask for an **architecture lint review** using the `architect-lint-review` skill.

> [!IMPORTANT]
> Every agent path uses the same review contract: read `.architect-lint.yaml`, load applicable catalog Principle Records, emit Tier 1 findings with permalinks.

## Configure your repo

Add `.architect-lint.yaml` at the repo root. All agents and CI read the same file:

```yaml
stacks:
  - nx
  - nestjs
scope: changed
preset: recommended
```

| Field | Values | Purpose |
| --- | --- | --- |
| `stacks` | `nx`, `react`, `nestjs` | Which rule sets apply to your codebase |
| `scope` | `changed`, `all` | Review changed files only, or the whole tree |
| `preset` | `recommended`, `baseline`, `strict`, `all` | How many rules to apply |

> [!TIP]
> When the file is missing, the reviewer falls back to reading all stacks and `scope: changed` with `preset: recommended`.

## Run your first review (local)

In Cursor, Claude Code, Codex, or any agent that loaded the skills:

```text
/architect-lint-review
/architect-lint-review --explain
```

**Progressive disclosure:**

1. **Tier 1** — rule id, title, file, problem, permalink
2. **Tier 2** (`--explain`) — adds the “How to fix” rationale from the catalog
3. **Tier 3** — open the permalink for full bad/good examples and related principles

Example Tier 1 output:

```text
❌ nestjs-realtime-transport-sse-vs-websocket — Pick one mechanism per flow — don't confuse SSE with WebSocket
   https://matipojo.github.io/architect-lint/rules/nestjs-realtime-transport-sse-vs-websocket
   File: src/chat/chat.gateway.ts:8
   Problem: WebSocket for one-way LLM token stream
   Fix: Use SSE for server→client streaming
```

## Run in GitHub CI (optional)

To automate PR reviews in GitHub, use Claude Code GitHub Actions with the architect-lint plugin. This is one CI path — it does not replace local reviews in Cursor, Codex, or other agents.

**Setup:**

1. Add `ANTHROPIC_API_KEY` to your repository secrets
2. Copy [`examples/workflows/architect-lint-review.yml`](https://github.com/matipojo/architect-lint/blob/main/examples/workflows/architect-lint-review.yml) to `.github/workflows/architect-lint-review.yml`
3. Commit `.architect-lint.yaml` so CI respects your stacks and scope
4. Open or update a pull request — the workflow runs on `pull_request` opened and synchronize

Workflow template:

<<< ../../../examples/workflows/architect-lint-review.yml

> [!WARNING]
> CI runs an **agent review**, not a deterministic linter. Quality depends on the prompt, model, and PR diff size. Tune `claude_args` (for example `--model` or `--max-turns`) for your team.

> [!IMPORTANT]
> Reviews read catalog Principle Records at review time — skills and docs are thin pointers, not duplicated rule content.

## What's Next?

- [Principles Overview](/rules/) — browse by stack and domain
- Open a finding permalink for bad/good code examples
- [GitHub repository](https://github.com/matipojo/architect-lint) — issues and rule suggestions

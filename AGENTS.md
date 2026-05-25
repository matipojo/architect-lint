# AGENTS.md

# STRICT RULES

## CRITICAL PARTNER MINDSET

Do not affirm my statements or assume my conclusions are correct. Question assumptions, offer counterpoints, test reasoning. Prioritize truth over agreement.

## EXECUTION SEQUENCE (always reply with "Applying rules X,Y,Z")

1. SEARCH FIRST - Use codebase_search/grep/web_search/MCP tools until finding similar functionality or confirming none exists. Investigate deeply, be 100% sure before implementing.
2. REUSE FIRST - Check existing functions/patterns/structure. Extend before creating new. Strive to smallest possible code changes
3. NO ASSUMPTIONS - Only use: files read, user messages, tool results. Missing info? Search then ask user.
4. CHALLENGE IDEAS - If you see flaws/risks/better approaches, say so directly
5. BE HONEST - State what's needed/problematic, don't sugarcoat to please
6. PERIODICALLY Self-check rule compliance during long conversations
7. LOG CHECK - Check the 3 service logs for errors (logs/frontend,backend,integration) after implementing changes, or debugging/fixing issues
8. RULE REFRESH - Re-check this rules file every few messages to stay compliant

## CODING STANDARDS

- Follow development-guidelines.mdc for planning, file organization, typing, clean code, and code quality
- Test your tests and run npm run lint:ci for lint check

## Github Rules

- PR content: use gh pr view for basic info
- PR metadata: use gh api repos/OWNER/REPO/pulls/PR_NUMBER for JSON
- PR files: use gh api repos/OWNER/REPO/pulls/PR_NUMBER/files
- PR comments: check 3 types - issues/comments, pulls/comments, pulls/reviews
- NEVER use fetch_pull_request tool - returns wrong data
- Line comments most important: gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments
- PR description: Use .github/pull_request_template.md - extract XXXX from branch name

## PROHIBITED ACTIONS

- DO NOT WRITE DOCS UNLESS EXPLICITLY ASKED TO
- NEVER run npm/yarn start commands - assume dev servers always running

Instructions for AI agents working in the **architect-lint** repository.

## Skills (required)

This repo ships Cursor skills under `skills/`. **Read and follow the relevant skill before acting** — do not guess at review workflows or rule content.

| Skill | Path | When to use |
| --- | --- | --- |
| `architect-lint` | `skills/architect-lint/SKILL.md` | Any architecture review; pick the right stack skill |
| `architect-lint-review` | `skills/architect-lint-review/SKILL.md` | `/architect-lint-review`, or when the user asks for an architecture lint review |
| `architect-lint-nx` | `skills/stacks/nx/SKILL.md` | Nx monorepo / domain isolation / monorepo hygiene changes |
| `architect-lint-react` | `skills/stacks/react/SKILL.md` | React platform composition changes |
| `architect-lint-nestjs` | `skills/stacks/nestjs/SKILL.md` | NestJS modules, auth, data, realtime, resilience changes |
| `architect-lint-integrations` | `skills/stacks/integrations/SKILL.md` | Third-party APIs, external clients, vendor response contracts |

### Review rules

1. **Read** each applicable `catalog/stacks/**/*.rule.md` Principle Record before citing a violation — never rely on cached or inlined skill content.
2. Load `registry/index.json` for rule metadata and permalinks.
3. Respect consumer config in `.architect-lint.yaml` when reviewing another repo (`stacks`, `scope`, `preset`).
4. Emit Tier 1 findings with permalinks (`https://matipojo.github.io/architect-lint/rules/{rule-id}`). Use `--explain` for Tier 2 (How to fix from the rule).

## Working in this repo

### Source of truth

- **Catalog**: `catalog/stacks/{nx,react,nestjs,integrations}/**/*.rule.md` — edit rules here.
- **Schema**: `packages/codegen/schema.ts` — every rule must validate.
- **Template**: `catalog/rule.template.md` — required fields and sections for new rules.

### Generated artifacts (do not hand-edit)

Run `pnpm docs:generate` after catalog changes. It regenerates:

- `registry/index.json`
- `website/src/data/**`
- `skills/architect-lint/SKILL.md`, `skills/architect-lint-review/SKILL.md`, and `skills/stacks/*/SKILL.md`

### Commands

```bash
pnpm validate          # schema + generated file checks
pnpm docs:generate     # catalog → JSON, skills, index
pnpm docs:dev          # local docs site
pnpm docs:build        # production build
```

### Adding or changing a rule

1. Create or edit `{rule-id}.rule.md` under the correct stack/domain/group (`rule-id` must start with `nx-`, `react-`, `nestjs-`, or `integrations-`).
2. Run `pnpm validate` and fix any schema errors.
3. Run `pnpm docs:generate` to refresh skills, index, and website data.

### Commands exposed to users

- `/architect-lint-review` — see `commands/architect-lint-review.md` and `skills/architect-lint-review/SKILL.md`.

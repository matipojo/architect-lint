# AGENTS.md

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

### Review rules

1. **Read** each applicable `catalog/stacks/**/*.rule.md` Principle Record before citing a violation — never rely on cached or inlined skill content.
2. Load `registry/index.json` for rule metadata and permalinks.
3. Respect consumer config in `.architect-lint.yaml` when reviewing another repo (`stacks`, `scope`, `preset`).
4. Emit Tier 1 findings with permalinks (`https://matipojo.github.io/architect-lint/rules/{rule-id}`). Use `--explain` for Tier 2 (How to fix from the rule).

## Working in this repo

### Source of truth

- **Catalog**: `catalog/stacks/{nx,react,nestjs}/**/*.rule.md` — edit rules here.
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

1. Create or edit `{rule-id}.rule.md` under the correct stack/domain/group (`rule-id` must start with `nx-`, `react-`, or `nestjs-`).
2. Run `pnpm validate` and fix any schema errors.
3. Run `pnpm docs:generate` to refresh skills, index, and website data.

### Commands exposed to users

- `/architect-lint-review` — see `commands/architect-lint-review.md` and `skills/architect-lint-review/SKILL.md`.

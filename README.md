# architect-lint

Open architecture rules catalog with a single source of truth in `catalog/stacks/**/*.rule.md`.

- **Docs**: https://matipojo.github.io/architect-lint/
- **Get Started**: https://matipojo.github.io/architect-lint/guide/getting-started
- **Review**: `/architect-lint-review` in Cursor, Claude Code, Codex, or any agent that loads the skills

## Install for your agent

### Cursor

```bash
git clone https://github.com/matipojo/architect-lint.git
ln -sfn "$(pwd)/architect-lint" ~/.cursor/plugins/local/architect-lint
```

Reload Cursor, then invoke `/architect-lint-review` or `/architect-lint`.

### Claude Code

```bash
claude plugin marketplace add matipojo/architect-lint --scope project
claude plugin install architect-lint@matipojo-architect-lint --scope project
```

In a Claude Code session:

```bash
/plugin marketplace add matipojo/architect-lint
/plugin install architect-lint@matipojo-architect-lint --scope project
```

### Other agents (Codex, etc.)

Point your agent at `skills/` and `commands/` from this repo (or vendor them into your project’s agent config). Ask for an architecture lint review or run `/architect-lint-review` if your tool supports slash commands.

## Consumer config

Add `.architect-lint.yaml` to your repo:

```yaml
stacks:
  - nx
  - nestjs
  - integrations
scope: changed
preset: recommended
```

## GitHub CI (optional)

Copy [`examples/workflows/architect-lint-review.yml`](examples/workflows/architect-lint-review.yml) to `.github/workflows/` and add `ANTHROPIC_API_KEY` to repository secrets. This automates PR reviews via Claude Code GitHub Actions — local reviews can still use any agent. See the [Getting Started guide](https://matipojo.github.io/architect-lint/guide/getting-started#run-in-github-ci-optional) for details.

## Development

```bash
pnpm install
pnpm docs:generate     # catalog → website/src/data/*.json, skills, index.json
pnpm docs:build        # production build → website/docs/.vitepress/dist
pnpm validate          # schema + generated file checks
pnpm docs:dev          # local VitePress dev server
```

## Architecture

- `catalog/stacks/{nx,react,nestjs}/` — rule Markdown (source of truth)
- `packages/codegen/schema.ts` — Zod schema every rule must pass
- `registry/index.json` — generated rule index with permalinks
- `website/` — VitePress docs site (reads generated JSON at build time)
- `skills/stacks/` — thin orchestrators pointing at catalog files

## Adding a rule

1. Pick the stack (`nx`, `react`, or `nestjs`) and domain/group folder.
2. Create `{rule-id}.rule.md` where `rule-id` starts with the stack prefix (`nx-`, `react-`, `nestjs-`).
3. Run `pnpm validate` — the schema checks id, stack, path, examples, and related references.

See `catalog/rule.template.md` for the required fields.

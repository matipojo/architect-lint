# architect-lint

Open architecture rules catalog with a single source of truth in `catalog/stacks/**/*.rule.yaml`.

- **Docs**: https://matipojo.github.io/architect-lint/
- **Review**: `/architect-lint-review` in Cursor or Claude

## Install (local Cursor plugin)

```bash
ln -sfn "$(pwd)" ~/.cursor/plugins/local/architect-lint
```

Reload Cursor, then invoke `/architect-lint-review` or `/architect-lint`.

## Consumer config

Add `.architect-lint.yaml` to your repo:

```yaml
stacks:
  - nx
  - nestjs
scope: changed
preset: recommended
```

## Development

```bash
pnpm install
pnpm docs:generate     # YAML → website/src/data/*.json, skills, index.json
pnpm docs:dev          # local VitePress dev server
pnpm docs:build        # production build → website/docs/.vitepress/dist
pnpm validate          # schema + generated file checks
```

## Architecture

- `catalog/stacks/{nx,react,nestjs}/` — rule YAML (source of truth)
- `packages/codegen/schema.ts` — Zod schema every rule must pass
- `registry/index.json` — generated rule index with permalinks
- `website/` — VitePress docs site (reads generated JSON at build time)
- `skills/stacks/` — thin orchestrators pointing at catalog files

## Adding a rule

1. Pick the stack (`nx`, `react`, or `nestjs`) and domain/group folder.
2. Create `{rule-id}.rule.yaml` where `rule-id` starts with the stack prefix (`nx-`, `react-`, `nestjs-`).
3. Run `pnpm validate` — the schema checks id, stack, path, examples, and related references.

See `catalog/rule.template.yaml` for the required fields.

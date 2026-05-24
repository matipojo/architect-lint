---
name: architect-lint-nestjs
description: Review NestJS architecture principles (32 rules). Read catalog Principle Records at review time — never use cached content.
---

# NestJS

When reviewing, **READ** each rule file below. Do not use cached or inlined content.

| Rule | Catalog path | Permalink |
| --- | --- | --- |
| nestjs-auth-one-passport-strategy-per-method | `catalog/stacks/nestjs/domains/auth-security/groups/authn-authz/nestjs-auth-one-passport-strategy-per-method.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/auth-security/nestjs-auth-one-passport-strategy-per-method |
| nestjs-auth-policies-not-decorators | `catalog/stacks/nestjs/domains/auth-security/groups/authn-authz/nestjs-auth-policies-not-decorators.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/auth-security/nestjs-auth-policies-not-decorators |
| nestjs-auth-separate-authn-authz | `catalog/stacks/nestjs/domains/auth-security/groups/authn-authz/nestjs-auth-separate-authn-authz.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/auth-security/nestjs-auth-separate-authn-authz |
| nestjs-config-for-root-async | `catalog/stacks/nestjs/domains/nestjs-modules/groups/configuration/nestjs-config-for-root-async.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-modules/nestjs-config-for-root-async |
| nestjs-config-module-not-process-env | `catalog/stacks/nestjs/domains/nestjs-modules/groups/configuration/nestjs-config-module-not-process-env.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-modules/nestjs-config-module-not-process-env |
| nestjs-config-openapi-from-code | `catalog/stacks/nestjs/domains/nestjs-modules/groups/configuration/nestjs-config-openapi-from-code.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-modules/nestjs-config-openapi-from-code |
| nestjs-data-jobs-in-owning-domain | `catalog/stacks/nestjs/domains/nestjs-data-errors/groups/data-access/nestjs-data-jobs-in-owning-domain.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-data-errors/nestjs-data-jobs-in-owning-domain |
| nestjs-data-nestjs-exceptions | `catalog/stacks/nestjs/domains/nestjs-data-errors/groups/data-access/nestjs-data-nestjs-exceptions.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-data-errors/nestjs-data-nestjs-exceptions |
| nestjs-data-repository-pattern | `catalog/stacks/nestjs/domains/nestjs-data-errors/groups/data-access/nestjs-data-repository-pattern.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-data-errors/nestjs-data-repository-pattern |
| nestjs-data-transactions-at-use-case | `catalog/stacks/nestjs/domains/nestjs-data-errors/groups/data-access/nestjs-data-transactions-at-use-case.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-data-errors/nestjs-data-transactions-at-use-case |
| nestjs-infra-guards-not-business-logic | `catalog/stacks/nestjs/domains/nestjs-data-errors/groups/infrastructure/nestjs-infra-guards-not-business-logic.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-data-errors/nestjs-infra-guards-not-business-logic |
| nestjs-module-cross-module-via-services | `catalog/stacks/nestjs/domains/nestjs-modules/groups/module-structure/nestjs-module-cross-module-via-services.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-modules/nestjs-module-cross-module-via-services |
| nestjs-module-domain-standalone | `catalog/stacks/nestjs/domains/nestjs-modules/groups/module-structure/nestjs-module-domain-standalone.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-modules/nestjs-module-domain-standalone |
| nestjs-module-dtos-not-entities-in-controllers | `catalog/stacks/nestjs/domains/nestjs-modules/groups/module-structure/nestjs-module-dtos-not-entities-in-controllers.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/nestjs-modules/nestjs-module-dtos-not-entities-in-controllers |
| nestjs-realtime-stream-agent-runs-as-resource | `catalog/stacks/nestjs/domains/realtime-streaming/groups/streaming/nestjs-realtime-stream-agent-runs-as-resource.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-stream-agent-runs-as-resource |
| nestjs-realtime-stream-heartbeats-reconnect | `catalog/stacks/nestjs/domains/realtime-streaming/groups/streaming/nestjs-realtime-stream-heartbeats-reconnect.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-stream-heartbeats-reconnect |
| nestjs-realtime-stream-idempotency-keys | `catalog/stacks/nestjs/domains/realtime-streaming/groups/streaming/nestjs-realtime-stream-idempotency-keys.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-stream-idempotency-keys |
| nestjs-realtime-stream-llm-cancellation-backpressure | `catalog/stacks/nestjs/domains/realtime-streaming/groups/streaming/nestjs-realtime-stream-llm-cancellation-backpressure.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-stream-llm-cancellation-backpressure |
| nestjs-realtime-stream-structured-agent-events | `catalog/stacks/nestjs/domains/realtime-streaming/groups/streaming/nestjs-realtime-stream-structured-agent-events.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-stream-structured-agent-events |
| nestjs-realtime-transport-namespaced-rooms | `catalog/stacks/nestjs/domains/realtime-streaming/groups/transport/nestjs-realtime-transport-namespaced-rooms.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-transport-namespaced-rooms |
| nestjs-realtime-transport-redis-adapter-scaling | `catalog/stacks/nestjs/domains/realtime-streaming/groups/transport/nestjs-realtime-transport-redis-adapter-scaling.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-transport-redis-adapter-scaling |
| nestjs-realtime-transport-sse-vs-websocket | `catalog/stacks/nestjs/domains/realtime-streaming/groups/transport/nestjs-realtime-transport-sse-vs-websocket.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-transport-sse-vs-websocket |
| nestjs-realtime-transport-thin-gateway | `catalog/stacks/nestjs/domains/realtime-streaming/groups/transport/nestjs-realtime-transport-thin-gateway.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-transport-thin-gateway |
| nestjs-realtime-transport-ws-auth-at-handshake | `catalog/stacks/nestjs/domains/realtime-streaming/groups/transport/nestjs-realtime-transport-ws-auth-at-handshake.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/realtime-streaming/nestjs-realtime-transport-ws-auth-at-handshake |
| nestjs-resilience-error-boundaries-per-domain | `catalog/stacks/nestjs/domains/runtime-resilience/groups/resilience/nestjs-resilience-error-boundaries-per-domain.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/runtime-resilience/nestjs-resilience-error-boundaries-per-domain |
| nestjs-resilience-migrations-in-domain | `catalog/stacks/nestjs/domains/runtime-resilience/groups/resilience/nestjs-resilience-migrations-in-domain.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/runtime-resilience/nestjs-resilience-migrations-in-domain |
| nestjs-resilience-observability-infrastructure | `catalog/stacks/nestjs/domains/runtime-resilience/groups/resilience/nestjs-resilience-observability-infrastructure.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/runtime-resilience/nestjs-resilience-observability-infrastructure |
| nestjs-security-authorize-from-db-object | `catalog/stacks/nestjs/domains/auth-security/groups/security-hardening/nestjs-security-authorize-from-db-object.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/auth-security/nestjs-security-authorize-from-db-object |
| nestjs-security-no-secrets-in-code | `catalog/stacks/nestjs/domains/auth-security/groups/security-hardening/nestjs-security-no-secrets-in-code.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/auth-security/nestjs-security-no-secrets-in-code |
| nestjs-security-rate-limit-csrf-infrastructure | `catalog/stacks/nestjs/domains/auth-security/groups/security-hardening/nestjs-security-rate-limit-csrf-infrastructure.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/auth-security/nestjs-security-rate-limit-csrf-infrastructure |
| nestjs-security-tenant-required-scope | `catalog/stacks/nestjs/domains/auth-security/groups/security-hardening/nestjs-security-tenant-required-scope.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/auth-security/nestjs-security-tenant-required-scope |
| nestjs-testing-generated-client-not-fetch | `catalog/stacks/nestjs/domains/testing-contracts/groups/contracts/nestjs-testing-generated-client-not-fetch.rule.md` | https://matipojo.github.io/architect-lint/rules/nestjs/testing-contracts/nestjs-testing-generated-client-not-fetch |

## Output format (Tier 1)

```
❌ {rule-id} — {title}
   {permalink}
   File: {path}:{line}
   Problem: ...
   Fix: ...
```

## Output format (Tier 2 — with `--explain`)

Add `do_this_instead` from the rule and a concrete fix hint.

## Full details (Tier 3)

User opens the permalink for bad/good examples and related principles.

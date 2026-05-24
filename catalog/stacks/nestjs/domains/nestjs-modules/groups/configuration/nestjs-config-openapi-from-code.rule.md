---
id: nestjs-config-openapi-from-code
stack: nestjs
domain: nestjs-modules
group: configuration
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - modules
  - openapi
priority: medium
related:
  - nestjs-testing-generated-client-not-fetch
---

# OpenAPI / Swagger is generated from code, not maintained by hand

A hand-maintained spec rots the moment code changes. Wrong docs are worse than no docs.

## Why it matters

- A hand-maintained spec rots the moment code changes. Wrong docs are worse than no docs.
- One source of truth: the controller + DTO. Frontend, docs, and tests consume the same spec.

## Issues

- [contract] Without this: hand-maintained OpenAPI drifts from controllers — wrong docs are worse than no docs.
- [ux] Without this: frontend client codegen builds against a spec that doesn't match runtime behavior.
- [contract] Without this: a hand-maintained spec rots the moment code changes. Wrong docs are worse than no docs.
- [testability] Without this: failure mode: one source of truth: the controller + DTO. Frontend, docs, and tests consume the same spec.
- [testability] Failure mode: one source of truth: the controller + DTO. Frontend, docs, and tests consume the same spec.

## How to fix

`@nestjs/swagger` generates an OpenAPI spec from DTOs and decorators. That spec is the source for the frontend client codegen (see `professional-architecture-testing-contracts` rule 15).

## Incorrect

```yaml
# openapi/sites.yaml — maintained by hand, drifts from controllers
paths:
  /sites:
    post:
      requestBody:
        schema:
          properties:
            title: { type: string }
```

## Correct

```typescript
// libs/sites-management/backend-feature/src/lib/dto/site.dto.ts
export class SiteDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

// apps/api/src/main.ts
const config = new DocumentBuilder().setTitle('Angie API').build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
// + export to JSON in CI so the frontend can codegen
```

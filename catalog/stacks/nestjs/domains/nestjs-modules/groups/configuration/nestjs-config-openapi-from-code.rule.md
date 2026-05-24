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

Generate OpenAPI from controllers and DTOs — the spec follows the code, not a hand-edited file.

## Why it matters

- [api-drift] A hand-maintained spec rots the moment code changes. Wrong docs are worse than no docs.
- [api-drift] Three truths — controller, handwritten spec, frontend types — diverge on the first field rename.
- [api-drift] hand-maintained OpenAPI drifts from controllers — wrong docs are worse than no docs.
- [api-drift] frontend client codegen builds against a spec that doesn't match runtime behavior.

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
const config = new DocumentBuilder().setTitle('Example API').build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
// + export to JSON in CI so the frontend can codegen
```

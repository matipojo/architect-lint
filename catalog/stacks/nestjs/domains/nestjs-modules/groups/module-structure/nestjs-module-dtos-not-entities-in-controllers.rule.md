---
id: nestjs-module-dtos-not-entities-in-controllers
stack: nestjs
domain: nestjs-modules
group: module-structure
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - modules
  - openapi
priority: medium
related: []
---

# DTOs in controllers, entities in repositories — never mixed

Returning an ORM entity directly = you've exposed the DB schema. A column change becomes a public-API change.

## Why it matters

- [layer-mixing] Returning an ORM entity directly = you've exposed the DB schema. A column change becomes a public-API change.
- [layer-mixing] Return ORM entities from controllers — over-posting and internal columns reach the client.
- [secret-exposure] An entity may carry internal fields (`passwordHash`, `internalNotes`) that must never reach the client.


## How to fix

The controller takes a DTO from the client and returns a DTO. The service works with domain models. The repository maps to the ORM entity. Every conversion is intentional.

## Incorrect

```typescript
@Controller('sites')
export class SitesController {
  @Post()
  async create(@Body() body: any) {                       // ← any
    return this.sitesRepo.save(body);                     // ← entity returned directly
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.sitesRepo.findOne({ where: { id } });     // ← includes internal fields
  }
}
```

## Correct

```typescript
// libs/sites-management/backend-feature/src/lib/dto/create-site.dto.ts
export class CreateSiteDto {
  @IsString() @MinLength(1) name!: string;
  @IsString() @Matches(/^[a-z0-9-]+$/) slug!: string;
}

// libs/sites-management/backend-feature/src/lib/dto/site.dto.ts
export class SiteDto {
  id!: string;
  name!: string;
  slug!: string;
  createdAt!: string;

  static fromEntity(e: SiteEntity): SiteDto {
    return { id: e.id, name: e.name, slug: e.slug, createdAt: e.createdAt.toISOString() };
  }
}

// libs/sites-management/backend-feature/src/lib/sites.controller.ts
@Controller('sites')
export class SitesController {
  constructor(private sites: SitesService) {}

  @Post()
  async create(@Body() dto: CreateSiteDto): Promise<SiteDto> {
    const site = await this.sites.create(dto);
    return SiteDto.fromEntity(site);
  }
}
```

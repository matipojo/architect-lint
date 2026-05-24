---
name: professional-architecture-nestjs-modules
description: Structure Angie NestJS backend domains as standalone Modules with clean public surfaces, DTOs separated from entities, configuration via ConfigModule, async dynamic modules for tunable infrastructure, cross-module communication via exported services, and OpenAPI generated from controllers. Use when designing a new NestJS module, adding a controller, deciding what a module should export, wiring a Redis/DB/3rd-party client, validating env vars in a Nest app, or generating typed clients from the API.
---

# NestJS Modules — Domain Composition (Angie)

NestJS gives DI, modules, guards, and interceptors for free. It also invites several classic anti-patterns. These rules pin down how a domain becomes a Module and how Modules talk.

Rules in this skill: 22 (every domain is a NestJS Module), 23 (cross-module via exported services, not repositories), 24 (DTOs in controllers, entities in repositories), 26 (ConfigModule, not `process.env`), 27 (`forRootAsync` for tunable modules), 33 (OpenAPI generated from code).

---

## 22. Every domain is a standalone NestJS Module

In Nx + NestJS, a domain becomes a `Module` that lives in `libs/<domain>/backend-feature-*` (or similar). The backend `app` only assembles those modules in `AppModule`.

**Why it matters**
- A standalone module can be loaded into a different app, or run isolated in tests.
- Without this, all controllers and services live in the app and the libs are empty — and rule 1 (domain separation) becomes decoration.

❌ Bad:

```typescript
// apps/api/src/app.module.ts
@Module({
  controllers: [SitesController, AgentsController, UsersController, BillingController],
  providers: [SitesService, AgentsService, UsersService, BillingService, PrismaService],
})
export class AppModule {}
```

All logic in one app. Libs are empty. No real separation.

✅ Good:

```typescript
// libs/sites-management/backend-feature/src/lib/sites.module.ts
@Module({
  imports: [SitesDataAccessModule],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],          // ← only what's public
})
export class SitesModule {}

// libs/studio/backend-feature/src/lib/studio.module.ts
@Module({
  imports: [StudioDataAccessModule],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class StudioModule {}

// apps/api/src/app.module.ts
@Module({
  imports: [SitesModule, StudioModule, AccountModule],
})
export class AppModule {}
```

The app is just a composer. You can spin up a microservice that loads only `SitesModule`.

---

## 23. Cross-module communication via exported services, not repositories or DB

If `StudioModule` needs site information, it does not inject `SitesRepository` or hit the DB directly. It injects the `SitesService` exported by `SitesModule`.

**Why it matters**
- The repository is internal to the domain. The service is the public API.
- If Studio touches Sites' repository, a change to Sites' internal schema breaks Studio.
- The service is where validation, authorization, and logging are enforced.

❌ Bad:

```typescript
// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Site)
    private sitesRepo: Repository<Site>,    // ← reaching into Sites' repo
  ) {}

  async attachToSite(agentId: string, siteId: string) {
    const site = await this.sitesRepo.findOne({ where: { id: siteId } });
    // bypasses every SitesService validation
  }
}
```

✅ Good:

```typescript
// libs/sites-management/backend-feature/src/lib/sites.service.ts
@Injectable()
export class SitesService {
  async getSite(id: string): Promise<Site> { /* ... */ }
}

@Module({
  providers: [SitesService, SitesRepository],
  exports: [SitesService],   // ← repository is NOT exported
})
export class SitesModule {}

// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(private sites: SitesService) {}   // through the front door

  async attachToSite(agentId: string, siteId: string) {
    const site = await this.sites.getSite(siteId);
    // goes through SitesService validation, authorization, logging
  }
}
```

---

## 24. DTOs in controllers, entities in repositories — never mixed

The controller takes a DTO from the client and returns a DTO. The service works with domain models. The repository maps to the ORM entity. Every conversion is intentional.

**Why it matters**
- Returning an ORM entity directly = you've exposed the DB schema. A column change becomes a public-API change.
- DTOs give you `class-validator` validation and protection from over-posting.
- An entity may carry internal fields (`passwordHash`, `internalNotes`) that must never reach the client.

❌ Bad:

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

The API now leaks `internalSecretKey`, `deletedAt`, `migrationFlags`, and everything else in the table.

✅ Good:

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

`class-validator` rejects bad input before it reaches the service. The returned DTO is a stable public contract.

---

## 26. Configuration via ConfigModule, not `process.env`

NestJS provides `@nestjs/config` with schema validation. Use it. Services receive an injected `ConfigService` — they don't read `process.env` directly. (This is the NestJS expression of rule 16.)

**Why it matters**
- A service that reads `process.env` directly is not testable — you can't fake configuration.
- Validation at boot means the app won't start if a var is missing.

❌ Bad:

```typescript
@Injectable()
export class OpenAIService {
  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,   // ← if missing, runtime crash
  });
}
```

✅ Good:

```typescript
// apps/api/src/config/config.schema.ts
import { z } from 'zod';

export const ConfigSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL:   z.string().url(),
  PORT:           z.coerce.number().default(3000),
});

// apps/api/src/main.ts
ConfigModule.forRoot({
  validate: (env) => ConfigSchema.parse(env),
  isGlobal: true,
});

// libs/studio/backend-feature/src/lib/openai.service.ts
@Injectable()
export class OpenAIService {
  private client: OpenAI;
  constructor(config: ConfigService) {
    this.client = new OpenAI({ apiKey: config.get('OPENAI_API_KEY') });
  }
}
```

App fails to boot if anything is missing. Tests fake `ConfigService`.

---

## 27. `forRootAsync` for modules with dependent configuration

A module that needs configuration (DB connection, API key) provides a static `forRoot` / `forRootAsync`. Without it, you slide back to singletons and global state.

**Why it matters**
- Lets the same module run with different configs in different environments without code changes.
- Lets tests assemble the module with synthetic config.

❌ Bad:

```typescript
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: new Redis(process.env.REDIS_URL!),   // ← bound to env, not to config
    },
  ],
})
export class RedisModule {}
```

✅ Good:

```typescript
@Module({})
export class RedisModule {
  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<RedisOptions> | RedisOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: async (...args) => new Redis(await options.useFactory(...args)),
          inject: options.inject,
        },
      ],
      exports: ['REDIS_CLIENT'],
    };
  }
}

// app.module.ts
RedisModule.forRootAsync({
  useFactory: (config: ConfigService) => ({ url: config.get('REDIS_URL') }),
  inject: [ConfigService],
})
```

`RedisModule` doesn't know about `ConfigService`. It knows about a factory.

---

## 33. OpenAPI / Swagger is generated from code, not maintained by hand

`@nestjs/swagger` generates an OpenAPI spec from DTOs and decorators. That spec is the source for the frontend client codegen (see `professional-architecture-testing-contracts` rule 15).

**Why it matters**
- A hand-maintained spec rots the moment code changes. Wrong docs are worse than no docs.
- One source of truth: the controller + DTO. Frontend, docs, and tests consume the same spec.

✅ Good:

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

In CI: `nx run api:export-openapi` → JSON file → `nx run sites-management-data-access:generate-client`. A DTO change breaks the frontend at compile time, not runtime.

---
name: professional-architecture-nestjs-data-errors
description: Keep NestJS guards/interceptors as thin infrastructure, throw typed exceptions instead of generic Errors, hide ORM behind repository interfaces, place transactions at the use-case boundary, and keep async work and cross-domain events inside the owning domain. Use when a guard starts running queries, when `throw new Error` returns a generic 500, when a service depends directly on TypeORM/Prisma types, when a multi-step operation can leave partial state, or when one domain pushes jobs onto another domain's queue.
---

# NestJS Data Access, Errors, and Async Work (Angie)

These rules cover the seam between business logic and infrastructure: guards, exceptions, repositories, transactions, and cross-domain async work.

Rules in this skill: 25 (guards/interceptors are infrastructure), 28 (NestJS exceptions, not bare `Error`), 29 (repository abstracts the ORM), 30 (transactions at the use-case boundary), 31 (background jobs and events stay in the owning domain).

---

## 25. Guards and Interceptors — cross-cutting infrastructure, not business logic

A `Guard` answers "is this request allowed?" — it does not run business operations, doesn't query several tables, doesn't change state.
An `Interceptor` wraps the response (logging, error mapping, transformation) — it does not make business decisions.

**Why it matters**
- A guard that contains business logic = logic hidden from the service. Bugs that take an hour to find.
- An interceptor that changes behavior = action at a distance. Who added the `if`?

❌ Bad:

```typescript
@Injectable()
export class CanCreateSiteGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    const siteCount = await this.sitesRepo.count({ where: { ownerId: user.id } });
    if (siteCount >= 10 && !user.isPro) return false;

    if (user.trialEndsAt < new Date()) {
      await this.usersService.markTrialExpired(user.id);   // ← side effect in guard!
      return false;
    }
    return true;
  }
}
```

The guard performs operations, knows plan limits, makes business decisions. That logic belongs in a service.

✅ Good:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    return !!ctx.switchToHttp().getRequest().user;
  }
}

@Injectable()
export class SitesService {
  async create(userId: string, dto: CreateSiteDto): Promise<Site> {
    await this.quotas.assertCanCreateSite(userId);   // throws if not allowed
    return this.repo.create({ ...dto, ownerId: userId });
  }
}
```

The guard answers a technical question (who you are). The service answers a business question (what you can do).

---

## 28. Errors — NestJS exceptions, not `throw new Error`

Throwing `BadRequestException`, `NotFoundException`, `ForbiddenException` lets NestJS map to the right HTTP status. `throw new Error()` collapses to a generic 500 and hides real failures.

**Why it matters**
- Generic 500 in two different cases = inability to distinguish a bug from bad input.
- A NestJS exception filter can map exceptions to a unified error format.

❌ Bad:

```typescript
async getSite(id: string) {
  const site = await this.repo.findOne({ where: { id } });
  if (!site) throw new Error('Site not found');     // ← 500
  if (!site.isPublic) throw new Error('Forbidden'); // ← also 500. Same response for two different failures.
  return site;
}
```

✅ Good:

```typescript
async getSite(id: string, requester: User) {
  const site = await this.repo.findOne({ where: { id } });
  if (!site) throw new NotFoundException(`Site ${id} not found`);
  if (!site.isPublic && site.ownerId !== requester.id) {
    throw new ForbiddenException('Cannot access this site');
  }
  return site;
}
```

The client gets 404 or 403 as appropriate. Monitoring can distinguish them.

Even better: domain exceptions mapped by a filter.

```typescript
// libs/sites-management/backend-feature/src/lib/errors.ts
export class SiteNotFoundError extends Error {
  constructor(public siteId: string) { super(`Site ${siteId} not found`); }
}

// libs/shared/backend/src/lib/domain-exception.filter.ts
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof SiteNotFoundError) {
      // map to 404
    }
    // ...
  }
}
```

The service doesn't know about HTTP. It throws domain errors. The filter maps.

---

## 29. Repository pattern — don't expose the ORM to services

A service does not receive `Repository<Site>` from TypeORM or `PrismaClient`. It receives a `SitesRepository` you wrote — a clear interface.

**Why it matters**
- Tomorrow you swap TypeORM for Prisma or vice versa — change the repository only, services don't move.
- In tests, you can mock `SitesRepository` without mocking the entire ORM.
- ORMs leak abstractions (lazy loading, transactions, eager fetching). The repository layer seals the leak.

❌ Bad:

```typescript
@Injectable()
export class SitesService {
  constructor(@InjectRepository(Site) private repo: Repository<Site>) {}

  async getSite(id: string) {
    return this.repo
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.owner', 'owner')
      .where('site.id = :id', { id })
      .getOne();
    // service knows about TypeORM QueryBuilder
  }
}
```

✅ Good:

```typescript
// libs/sites-management/backend-data-access/src/lib/sites.repository.ts
export interface SitesRepository {
  findById(id: string): Promise<Site | null>;
  findByOwner(ownerId: string): Promise<Site[]>;
  create(input: CreateSiteInput): Promise<Site>;
}

@Injectable()
export class TypeOrmSitesRepository implements SitesRepository {
  constructor(@InjectRepository(SiteEntity) private repo: Repository<SiteEntity>) {}

  async findById(id: string): Promise<Site | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: ['owner'] });
    return entity ? toDomain(entity) : null;
  }
}

// libs/sites-management/backend-feature/src/lib/sites.service.ts
@Injectable()
export class SitesService {
  constructor(@Inject(SITES_REPOSITORY) private repo: SitesRepository) {}

  async getSite(id: string) {
    return this.repo.findById(id);
  }
}
```

The service works against an interface. The implementation can be swapped.

---

## 30. Transactions sit at the use-case boundary, not inside a repository call

`@Transactional` or unit-of-work wraps a service-level call, not a single repository call. If an operation needs two repositories — the transaction lives in the service.

**Why it matters**
- A transaction inside a repository = the repository knows too much. It doesn't know if it's part of a larger flow.
- A transaction in a controller = the controller knows about the DB. Layer violation.
- The service is the use case. The use case is the natural transaction boundary.

❌ Bad:

```typescript
async createSiteWithAgent(input: CreateSiteWithAgentDto) {
  const site = await this.sitesRepo.create(input.site);      // commit 1
  const agent = await this.agentsRepo.create({               // commit 2
    ...input.agent,
    siteId: site.id,
  });
  // if the second fails, an orphaned site is left in the DB
  return { site, agent };
}
```

✅ Good:

```typescript
@Injectable()
export class SiteProvisioningService {
  constructor(
    private dataSource: DataSource,
    private sites: SitesService,
    private agents: AgentsService,
  ) {}

  async provisionSiteWithAgent(input: ProvisionInput) {
    return this.dataSource.transaction(async (tx) => {
      const site  = await this.sites.create(input.site, { tx });
      const agent = await this.agents.create({ ...input.agent, siteId: site.id }, { tx });
      return { site, agent };
    });
  }
}
```

Or with Prisma `$transaction`, or with a CLS-based `@Transactional` decorator — the principle is identical: the boundary is the use case.

---

## 31. Background jobs and events — inside the owning domain

If a domain needs async work (send an email, fire a webhook, recompute statistics), it defines the job inside its own module. Another domain does not push a job onto domain X's queue.

Cross-domain communication via events — a typed event bus, not a direct call into another module's job.

**Why it matters**
- If Studio pushes a job to Sites' queue, Studio knows Sites' internal job structure. Hidden coupling.
- Events are how domains coordinate without one knowing the other's internals.

❌ Bad:

```typescript
// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(
    @InjectQueue('sites-cleanup') private sitesQueue: Queue,   // ← another domain's queue
  ) {}

  async deleteAgent(id: string) {
    await this.repo.delete(id);
    await this.sitesQueue.add('rebuild-index', { agentId: id });   // ← Studio knows Sites internals
  }
}
```

✅ Good:

```typescript
// libs/shared/backend-events/src/lib/events.ts
export type AgentDeletedEvent = {
  type: 'agent.deleted';
  agentId: string;
  at: string;
};

// libs/studio/backend-feature/src/lib/agents.service.ts
@Injectable()
export class AgentsService {
  constructor(private events: EventBus) {}

  async deleteAgent(id: string) {
    await this.repo.delete(id);
    await this.events.publish<AgentDeletedEvent>({
      type: 'agent.deleted',
      agentId: id,
      at: new Date().toISOString(),
    });
  }
}

// libs/sites-management/backend-feature/src/lib/agent-deleted.handler.ts
@EventHandler('agent.deleted')
export class AgentDeletedHandler {
  async handle(event: AgentDeletedEvent) {
    // Sites decides what to do, at its own pace
  }
}
```

Studio publishes an event. Sites listens if it cares. Anyone can add a listener without anyone else knowing.

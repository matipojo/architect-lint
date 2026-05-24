---
id: nestjs-data-repository-pattern
stack: nestjs
domain: nestjs-data-errors
group: data-access
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - repository
  - errors
priority: medium
related: []
---

# Repository pattern — don't expose the ORM to services

Tomorrow you swap TypeORM for Prisma or vice versa — change the repository only, services don't move.

## Why it matters

- [hard-to-change] ORM swap forces edits across every service — persistence leaks past the repository boundary.
- [hard-to-test] In tests, you can mock `SitesRepository` without mocking the entire ORM.
- [layer-mixing] ORMs leak abstractions (lazy loading, transactions, eager fetching). The repository layer seals the leak.
- [hidden-coupling] service knows about TypeORM QueryBuilder

## How to fix

A service does not receive `Repository<Site>` from TypeORM or `PrismaClient`. It receives a `SitesRepository` you wrote — a clear interface.

## Incorrect

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

## Correct

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

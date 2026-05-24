---
id: nestjs-data-transactions-at-use-case
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

# Transactions sit at the use-case boundary, not inside a repository call

A transaction inside a repository = the repository knows too much. It doesn't know if it's part of a larger flow.

## Why it matters

- [layer-mixing] A transaction inside a repository = the repository knows too much. It doesn't know if it's part of a larger flow.
- [hidden-coupling] A transaction in a controller = the controller knows about the DB. Layer violation.
- [layer-mixing] The service is the use case. The use case is the natural transaction boundary.
- [data-corruption] If the second fails, an orphaned site is left in the DB

## How to fix

`@Transactional` or unit-of-work wraps a service-level call, not a single repository call. If an operation needs two repositories — the transaction lives in the service.

## Incorrect

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

## Correct

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

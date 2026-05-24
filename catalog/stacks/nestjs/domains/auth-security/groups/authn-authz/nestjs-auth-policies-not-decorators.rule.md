---
id: nestjs-auth-policies-not-decorators
stack: nestjs
domain: auth-security
group: authn-authz
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - security
  - auth
priority: medium
related: []
---

# Authorization = Policies, not decorators sprinkled across the code

Decorators scatter permissions across dozens of places. A policy change = grep across the project.

## Why it matters

- Decorators scatter permissions across dozens of places. A policy change = grep across the project.
- The same permission needs to apply both in the UI (hide a button) and in the backend. One policy = two consumers.
- A decorator gets the user but not the resource. Most real permissions are about a specific resource.

## Issues

- [maintainability] Decorators scatter permissions across dozens of places. A policy change = grep across the project.
- [maintainability] The same permission needs to apply both in the UI (hide a button) and in the backend. One policy = two consumers.


## How to fix

Not `@RequireRole('admin')`, not `@CanAccess('sites:write')` on the controller. A permission is a question about a user and a resource, and the answer lives in a policy function you can test and reuse.

## Incorrect

```typescript
@Controller('sites')
export class SitesController {
  @Patch(':id')
  @RequireRole('admin')                          // ← admin of what?
  async update(@Param('id') id: string) { /* ... */ }

  @Delete(':id')
  @RequirePermission('sites:delete')             // ← but the owner can also delete
  async delete(@Param('id') id: string) { /* ... */ }
}
```

## Correct

```typescript
// libs/sites-management/backend-feature/src/lib/sites.policy.ts
@Injectable()
export class SitesPolicy {
  canRead(user: User, site: Site): boolean {
    return site.isPublic || site.ownerId === user.id || user.role === 'admin';
  }
  canUpdate(user: User, site: Site): boolean {
    return site.ownerId === user.id || user.role === 'admin';
  }
  canDelete(user: User, site: Site): boolean {
    if (site.protected) return user.role === 'admin';
    return site.ownerId === user.id;
  }
}

// in the service
async update(siteId: string, user: User, dto: UpdateSiteDto) {
  const site = await this.repo.findById(siteId);
  if (!this.policy.canUpdate(user, site)) throw new ForbiddenException();
  return this.repo.update(siteId, dto);
}
```

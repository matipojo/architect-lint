---
name: professional-architecture-domain-isolation
description: Enforce hard boundaries between domains in the Angie Nx + pnpm monorepo. Use when designing or reviewing how apps and libs are split, when adding a new domain, when an import crosses domain folders, when a test pulls in another domain's setup, when libraries mix UI/data/business concerns, when server-only code leaks into the client bundle, when a global singleton is proposed, when dependencies flow the wrong way, or when someone wants to "spin up just this domain" but cannot.
---

# Domain Isolation (Angie / Nx + pnpm)

Overarching principle: we don't build an app, we build a platform that apps are composed from. Each domain must be runnable on its own.

Rules in this skill: 1 (domain separation), 2 (test isolation), 4 (explicit cross-domain contracts), 5 (no shared global state), 9 (unidirectional dependencies), 11 (single-purpose libraries), 12 (server vs client scope), 21 (deliberate friction for new domains).

---

## 1. Full separation between domains

Every domain is a standalone app: own backend, own frontend, runnable alone. The test: I want to work on sites-management — I bring up that app alone, open the browser, and work. No Studio, no agent builder, nothing else.

**Why it matters**
- Dev speed — don't load the whole system to fix one bug.
- Blast radius — a bug in Studio doesn't take down sites-management.
- Clear ownership — every domain has a boundary you can point at.
- Teams work in parallel without trampling each other.

❌ Bad:

```
/apps
  angie/                    # one giant app
/libs
  shared/
    components/
    services/
```

✅ Good:

```
/apps
  sites-management/
  studio/
  account/
/libs
  sites-management/
    feature-site-list/
    feature-site-create/
    data-access/
    ui/
  studio/
    feature-agent-builder/
    data-access/
    ui/
  shared/
    ui-kit/                 # only truly shared
    util-types/
```

Test: `nx serve sites-management` runs with zero connection to Studio. `nx graph` shows islands, not a pile.

---

## 2. Full test isolation

`nx affected:test` is the default. CI runs only the tests for what changed.

**Why it matters**
- Without this, rule 1 is empty words — if tests need the whole system, dependencies live in code even if invisible.
- CI times stay sane as the system grows.
- When a test fails, it's clear who broke what.

❌ Bad:

```yaml
# .github/workflows/ci.yml
- run: pnpm nx run-many --target=test --all
```

```typescript
// apps/sites-management/tests/site-creation.test.ts
import { setupStudio } from '../../studio/test-helpers';
import { mockAgentRuntime } from '../../studio/mocks';

test('creates a site', async () => {
  await setupStudio();           // why?
  mockAgentRuntime();            // unrelated to sites
  const site = await createSite();
  expect(site).toBeDefined();
});
```

✅ Good:

```yaml
- run: pnpm nx affected --target=test --base=origin/main
- run: pnpm nx affected --target=lint --base=origin/main
- run: pnpm nx affected --target=build --base=origin/main
```

```typescript
// apps/sites-management/tests/site-creation.test.ts
import { createSite } from '../src/sites';

test('creates a site', async () => {
  const site = await createSite({ name: 'My Site' });
  expect(site.id).toBeDefined();
});
```

A test that needs the whole system up = red flag the architecture is wrong.

---

## 4. Explicit cross-domain contracts via Nx tags

A domain may not import from `src/` of another domain. Only via the library barrel (`index.ts`). Nx enforces this with tags.

**Why it matters**
- The moment one domain reaches into another's internals, rule 1 silently breaks.
- Internal changes must not break consumers — if they do, you have hidden coupling.
- The public API is the only surface that needs strict review.

❌ Bad:

```typescript
// apps/studio/src/agent-builder.ts
import { SiteModel } from '../../../libs/sites-management/data-access/src/lib/internal/models/site';
import { validateSlug } from '../../../libs/sites-management/data-access/src/lib/utils/validation';
```

✅ Good — `.eslintrc.json`:

```json
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        { "sourceTag": "domain:studio",            "onlyDependOnLibsWithTags": ["domain:studio", "domain:shared"] },
        { "sourceTag": "domain:sites-management",  "onlyDependOnLibsWithTags": ["domain:sites-management", "domain:shared"] },
        { "sourceTag": "domain:shared",            "onlyDependOnLibsWithTags": ["domain:shared"] },
        { "sourceTag": "type:feature",             "onlyDependOnLibsWithTags": ["type:feature", "type:data-access", "type:ui", "type:util"] },
        { "sourceTag": "type:ui",                  "onlyDependOnLibsWithTags": ["type:ui", "type:util"] }
      ]
    }]
  }
}
```

Each lib's `project.json` carries `tags: ["domain:sites-management", "type:data-access"]`. Consumers import `@angie/sites-management/data-access`. Lint screams on internal reach.

---

## 5. No shared global state

No singletons holding cross-domain state. No global store every app writes to. If two domains need the same data, one owns it and the other receives it via the public contract.

**Why it matters**
- Global state is the fastest way to destroy a platform — untraceable dependencies.
- Without this, "run the app standalone" becomes an illusion — it waits for someone to populate state.

❌ Bad:

```typescript
// libs/shared/state/src/lib/global-store.ts
export const globalStore = {
  currentUser: null,
  currentSite: null,
  activeAgent: null,
  isTestMode: false,
};
```

✅ Good:

```typescript
// libs/studio/feature-agent-builder/src/lib/agent-runner.ts
type RunAgentOptions = { agent: Agent; testMode: boolean };

export function runAgent({ agent, testMode }: RunAgentOptions) {
  if (testMode) { /* ... */ }
  return agent.run();
}

// apps/studio/src/main.tsx — composing layer
const user = await usersApi.getCurrent();
const site = await sitesApi.get(siteId);
runAgent({ agent: site.agent, testMode: user.preferences.testMode });
```

Data enters through the front door. There is no back door.

---

## 9. Dependencies flow one direction

Layering: `apps → features → data-access/ui → util/shared`. `shared` may not know about a specific domain. `ui` may not import `feature`. Nx enforces with `type:` tags.

**Why it matters**
- Once `shared` knows a domain, it's not shared anymore.
- This is what lets you add a new domain without touching `shared`.

❌ Bad:

```typescript
// libs/shared/auth/src/lib/permissions.ts
import { StudioPermissions } from '@angie/studio/permissions';
import { SitesPermissions } from '@angie/sites-management/permissions';

export function canAccess(user: User, resource: string) {
  if (resource.startsWith('studio/')) return StudioPermissions.check(user);
  if (resource.startsWith('sites/'))  return SitesPermissions.check(user);
}
```

✅ Good — registry pattern, dependency inversion:

```typescript
// libs/shared/auth/src/lib/registry.ts
type Checker = (user: User, resource: string) => boolean;
const checkers = new Map<string, Checker>();

export function registerPermissionChecker(prefix: string, checker: Checker) {
  checkers.set(prefix, checker);
}

export function canAccess(user: User, resource: string) {
  const prefix = resource.split('/')[0];
  return checkers.get(prefix)?.(user, resource) ?? false;
}

// apps/studio/src/main.ts
import { registerPermissionChecker } from '@angie/shared/auth';
import { StudioPermissions } from '@angie/studio/feature-permissions';
registerPermissionChecker('studio', StudioPermissions.check);
```

`shared` provides a mechanism. The domain registers into it. `nx graph` shows flow goes one way.

---

## 11. Every library has one purpose — feature, data-access, ui, or util

In Nx this is the `type` tag, not just convention. A library that mixes UI with API calls with business logic is a library you can't understand, test, or delete.

**Why it matters**
- Pure UI lib runs in Storybook with zero mocks.
- data-access lib can be replaced with a mock in one shot.
- feature is the only lib that knows both — and is the only one that composes.
- Without this split, every lib drags the whole system behind it.

❌ Bad:

```typescript
// libs/sites-management/everything/src/lib/site-card.tsx
export function SiteCard({ siteId }: { siteId: string }) {
  const [site, setSite] = useState<Site>();
  useEffect(() => {
    fetch(`/api/sites/${siteId}`).then(r => r.json()).then(setSite);
  }, [siteId]);

  const handleDelete = async () => {
    await fetch(`/api/sites/${siteId}`, { method: 'DELETE' });
    analytics.track('site_deleted');
  };

  return <div className="card">{/* ... */}</div>;
}
```

✅ Good — three libs:

```typescript
// libs/sites-management/ui/src/lib/site-card.tsx — type:ui, pure
export function SiteCard({ site, onDelete }: {
  site: Site;
  onDelete: () => void;
}) {
  return <div className="card">{/* ... */}</div>;
}

// libs/sites-management/data-access/src/lib/sites-api.ts — type:data-access
export function useSite(id: string) { /* ... */ }
export function useDeleteSite() { /* ... */ }

// libs/sites-management/feature-site-list/src/lib/site-card-container.tsx — type:feature
export function SiteCardContainer({ siteId }: { siteId: string }) {
  const { data: site } = useSite(siteId);
  const deleteSite = useDeleteSite();
  if (!site) return null;
  return <SiteCard site={site} onDelete={() => deleteSite.mutate(siteId)} />;
}
```

`SiteCard` lives in Storybook with one prop. `useSite` is testable alone. The container is the glue.

---

## 12. Clear server vs client boundary

In a monorepo with backend and frontend apps, every library must declare which side it runs on. A "both" library is one the bundler will catch importing `fs` in production. Tag libs `scope:server`, `scope:client`, or `scope:isomorphic` and enforce via `enforce-module-boundaries`.

**Why it matters**
- Server code leaking to client = bloated bundle, or worse, secret leak.
- Client code leaking to server = runtime errors on `window`.

❌ Bad:

```typescript
// libs/shared/utils/src/lib/index.ts
export { formatDate } from './format-date';      // browser-safe
export { signJWT }    from './sign-jwt';         // server-only, uses crypto
export { parseCSV }   from './parse-csv';        // browser-safe
```

The frontend imports `formatDate` and drags `crypto` with it.

✅ Good:

```
/libs/shared
  /util-formatting    [scope:isomorphic]    # both sides
  /util-server        [scope:server]        # backend only
  /util-browser       [scope:client]        # frontend only
```

ESLint screams if a frontend app imports from `util-server`.

---

## 21. Raise the friction for adding a new domain

Creating a new domain is not a casual decision. It requires tech review, a defined owner, a README, and a CODEOWNERS entry. A domain is a commitment.

**Why it matters**
- Anti-pattern: every new feature becomes a domain → 40 micro-domains → the platform turns into the inverse mess of a monolith.
- A domain should be a business capability, not a feature.

The simple test: if domain X disappears tomorrow, what business capability vanishes? If the answer is "kind of a widget" — that's not a domain, it's a feature lib inside an existing domain.

✅ Good — the bar to add a new domain:
- Tech-review with platform leads.
- Named owner team.
- README in `/apps/<domain>/README.md` with responsibility, public API, how to run alone, external deps.
- CODEOWNERS line for `/apps/<domain>/` and `/libs/<domain>/`.
- Tags configured on every lib so `enforce-module-boundaries` covers it.

Without all five, the domain doesn't exist.

---

## Nx tooling that enforces these rules

- `nx graph` — if the graph is messy, the architecture is messy. Look before any large refactor.
- `@nx/enforce-module-boundaries` — enforces rules 1, 4, 9, 12 in lint. Without it, the rules are suggestions.
- `nx affected` — enforces rule 2 in CI.
- `nx generate` — write custom generators that create new libs with the correct tags automatically. Prevents "I forgot to tag it".
- `pnpm workspaces` — explicit `package.json` per lib with declared dependencies.

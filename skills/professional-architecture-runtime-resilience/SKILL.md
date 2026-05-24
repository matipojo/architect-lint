---
name: professional-architecture-runtime-resilience
description: Make Angie domain isolation visible at runtime through error boundaries per domain, structured platform-wide observability, and per-domain database migrations. Use when a single component crash brings down the whole app, when log formats are inconsistent across domains, when one domain alters another's database tables, or when wiring telemetry, logs, traces, or metrics for a new module.
---

# Runtime Resilience (Angie)

Domain isolation must hold at runtime, not only in source layout. Crashes, logs, and migrations are the three places it gets violated quietly.

Rules in this skill: 14 (domain error boundaries), 17 (observability is platform), 18 (migrations belong to the domain).

---

## 14. Error boundaries per domain

A crash in one domain does not take down the app. Each domain wraps itself in an Error Boundary that knows how to display failure sensibly for that domain.

**Why it matters**
- Without it, a bug in a small Studio widget wipes the entire screen, including the sidebar.
- This is the runtime expression of "domain separation". If they're separated in code but explode together at runtime — the separation isn't real.

❌ Bad:

```tsx
function App() {
  return (
    <div>
      <Sidebar />
      <SitesPanel />
      <StudioPanel />     {/* throws → whole app blank */}
      <AccountPanel />
    </div>
  );
}
```

✅ Good:

```tsx
function App() {
  return (
    <div>
      <Sidebar />
      <DomainBoundary domain="sites">       <SitesPanel />   </DomainBoundary>
      <DomainBoundary domain="studio">      <StudioPanel />  </DomainBoundary>
      <DomainBoundary domain="account">     <AccountPanel /> </DomainBoundary>
    </div>
  );
}

function DomainBoundary({ domain, children }: { domain: string; children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<DomainErrorFallback domain={domain} />}
      onError={(e) => telemetry.captureError(e, { domain })}
    >
      {children}
    </ErrorBoundary>
  );
}
```

Studio falls → Sites and Account keep working. Telemetry has the domain attached.

---

## 17. Observability is infrastructure, not an add-on

Logs, metrics, and traces come out of one shared platform library. Every domain uses it — does not roll its own. Every log carries `domain` and `requestId` by default.

**Why it matters**
- When something breaks, the first question is "which domain?" If the logs don't know — you're blind.
- Without a standard, you end up with five log formats and can't search anything.

❌ Bad:

```typescript
// in one domain
console.log('site created', siteId);

// in another
logger.info({ event: 'agent_started', agent_id: agentId });

// in a third
console.log(`[STUDIO] running agent ${name} at ${new Date()}`);
```

Search "site creation failed" → good luck.

✅ Good:

```typescript
// libs/shared/observability/src/lib/logger.ts
export function createLogger(domain: string) {
  return baseLogger.child({ domain });
}

// in a domain
import { createLogger } from '@angie/shared/observability';
const log = createLogger('sites-management');

log.info({ event: 'site.created', siteId });
```

Now `domain:sites-management event:site.created` is a one-line query.

---

## 18. Migrations are part of the domain

A DB migration lives in the domain's `data-access` lib. One domain doesn't touch another's tables. A schema change = a PR inside that domain, not in infrastructure.

**Why it matters**
- A migration that needs two-team coordination = a feature that slips by a month.
- The moment a domain edits another's tables, separation is in code only — not in the DB.

❌ Bad:

```sql
-- migrations/2026_05_add_agent_to_sites.sql (where does it live? who owns it?)
ALTER TABLE sites ADD COLUMN active_agent_id UUID REFERENCES agents(id);
-- now sites knows about agents. The Studio domain injected a column into Sites.
```

✅ Good:
- Changes to the `sites` table live in `libs/sites-management/data-access/migrations/`.
- Changes to the `agents` table live in `libs/studio/data-access/migrations/`.
- If Studio needs to link an agent to a site, it holds the link in its own table (`agents.site_id`), not in the Sites table.
- The foreign-key direction matters: the consumer (Studio) holds the link to the owner (Sites), not the other way around.

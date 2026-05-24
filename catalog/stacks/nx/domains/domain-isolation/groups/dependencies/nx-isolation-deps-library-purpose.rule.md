---
id: nx-isolation-deps-library-purpose
stack: nx
domain: domain-isolation
group: dependencies
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nx
  - monorepo
  - domain-driven-design
priority: high
related: []
---

# Every library has one purpose — feature, data-access, ui, or util

Pure UI lib runs in Storybook with zero mocks.

## Why it matters

- Pure UI lib runs in Storybook with zero mocks.
- data-access lib can be replaced with a mock in one shot.
- feature is the only lib that knows both — and is the only one that composes.
- Without this split, every lib drags the whole system behind it.

## Issues

- [testability] Without this: pure UI lib runs in Storybook with zero mocks.
- [testability] Without this: data-access lib can be replaced with a mock in one shot.
- [maintainability] Without this: feature is the only lib that knows both — and is the only one that composes.
- [blast-radius] Without this: failure mode: without this split, every lib drags the whole system behind it.
- [blast-radius] Failure mode: without this split, every lib drags the whole system behind it.

## How to fix

In Nx this is the `type` tag, not just convention. A library that mixes UI with API calls with business logic is a library you can't understand, test, or delete.

## Incorrect

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

## Correct

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

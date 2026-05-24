---
id: nestjs-resilience-error-boundaries-per-domain
stack: nestjs
domain: runtime-resilience
group: resilience
status: active
replaced_by: null
since: 2026-05-01
tags:
  - react
  - observability
  - migrations
priority: medium
related: []
---

# Error boundaries per domain

Without it, a bug in a small Studio widget wipes the entire screen, including the sidebar.

## Why it matters

- Without it, a bug in a small Studio widget wipes the entire screen, including the sidebar.
- This is the runtime expression of "domain separation". If they're separated in code but explode together at runtime — the separation isn't real.

## Issues

- [blast-radius] Without it, a bug in a small Studio widget wipes the entire screen, including the sidebar.
- [maintainability] This is the runtime expression of "domain separation". If they're separated in code but explode together at runtime — the separation isn't real.


## How to fix

A crash in one domain does not take down the app. Each domain wraps itself in an Error Boundary that knows how to display failure sensibly for that domain.

## Incorrect

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

## Correct

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

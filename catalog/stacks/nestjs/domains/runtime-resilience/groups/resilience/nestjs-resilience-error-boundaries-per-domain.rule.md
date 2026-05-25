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
  - error-boundary
  - resilience
priority: medium
related: []
---

# Error boundaries per domain

Wrap each domain's UI in an error boundary — one widget crash must not blank the whole shell.

## Why it matters

- [spreads-failure] Without it, a bug in a small workspace widget wipes the entire screen, including the sidebar.
- [spreads-failure] Runtime expression of domain separation — separated in code but exploding together at runtime means the separation isn't real.

## How to fix

A crash in one domain does not take down the app. Each domain wraps itself in an Error Boundary that knows how to display failure sensibly for that domain.

## Incorrect

```tsx
function App() {
  return (
    <div>
      <Sidebar />
      <CatalogPanel />
      <WorkspacePanel />     {/* throws → whole app blank */}
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
      <DomainBoundary domain="catalog">    <CatalogPanel />    </DomainBoundary>
      <DomainBoundary domain="workspace">  <WorkspacePanel />  </DomainBoundary>
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

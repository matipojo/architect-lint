---
id: react-platform-config-not-conditionals
stack: react
domain: platform-composition
group: composition
status: active
replaced_by: null
since: 2026-05-01
tags:
  - react
  - platform
  - composition
priority: high
related: []
---

# Configuration, not conditionals

A UI lib containing `if (context === 'wordpress')` is no longer a lib — it's part of WordPress.

## Why it matters

- A UI lib containing `if (context === 'wordpress')` is no longer a lib — it's part of WordPress.
- New context = compose different props. Don't touch the lib.
- Without this, in a year you have 40 `if`s in one component and nobody knows what's safe to delete.

## Issues

- [maintainability] A UI lib containing `if (context === 'wordpress')` is no longer a lib — it's part of WordPress.
- [maintainability] New context = compose different props. Don't touch the lib.


## How to fix

Same library, different behaviors per host — through props and configuration, not `if`s that sniff where the code is running.

## Incorrect

```tsx
// libs/shared/ui-chat/src/lib/chat-sidebar.tsx
function ChatSidebar({ context }: { context: 'wordpress' | 'account' }) {
  return (
    <Sidebar>
      <NewChatButton />
      {context === 'wordpress' && <TestModeToggle />}
      {context === 'wordpress' && <SuperAdminToggle />}
      {context === 'account' && <BillingShortcut />}
    </Sidebar>
  );
}
```

## Correct

```tsx
// libs/shared/ui-chat/src/lib/chat-sidebar.tsx
type SidebarAction = { id: string; render: () => ReactNode };

export function ChatSidebar({ actions }: { actions: SidebarAction[] }) {
  return (
    <Sidebar>
      <NewChatButton />
      {actions.map(a => <Fragment key={a.id}>{a.render()}</Fragment>)}
    </Sidebar>
  );
}

// apps/wordpress-integration/src/main.tsx
<ChatSidebar actions={[
  { id: 'test-mode', render: () => <TestModeToggle /> },
  { id: 'super-admin', render: () => <SuperAdminToggle /> },
]} />

// apps/account/src/main.tsx
<ChatSidebar actions={[
  { id: 'billing', render: () => <BillingShortcut /> },
]} />
```

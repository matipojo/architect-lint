---
id: react-platform-composition-not-inheritance
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

# Composition, not inheritance

UI libs receive behavior via props and slots — they do not pull from app context.

## Why it matters

- [hard-to-test] A component that inherits from context cannot be rendered alone in Storybook without faking the context.

## How to fix

UI libs do not inherit behavior from context. They receive it — as props, as children, as render-props, as slots. The parent decides how to assemble; the child only knows how to render.

## Incorrect

```tsx
// libs/shared/ui-chat/src/lib/chat-panel.tsx
function ChatPanel() {
  const hostContext = useHostContext();
  const workspaceContext = useWorkspaceContext();
  return (
    <div>
      <ChatHeader title={hostContext?.siteName ?? workspaceContext?.workflowName} />
      <ChatMessages />
    </div>
  );
}
```

## Correct

```tsx
// libs/shared/ui-chat/src/lib/chat-panel.tsx
export function ChatPanel({ header, children }: {
  header: ReactNode;
  children: ReactNode;
}) {
  return <div>{header}{children}</div>;
}

// libs/embedded-host/feature-chat/src/lib/host-chat.tsx
<ChatPanel header={<ChatHeader title={site.name} />}>
  <ChatMessages />
</ChatPanel>
```

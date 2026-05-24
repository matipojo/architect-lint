---
name: professional-architecture-platform-composition
description: Build platform components in Angie that adapt by configuration and composition, not by branching on context. Use when a component is about to grow an `if (context === 'wordpress')` branch, when the same UI must appear in multiple hosts (WordPress, account, studio) with different actions, when adding feature flags, when changing a public API in a way that could break consumers, or when designing how an outer layer assembles props for an inner component.
---

# Platform Composition (Angie)

Apps in Angie are compositions over the same building blocks. A component must not learn about its hosts. The decision of what to render lives in the layer that assembles props.

Rules in this skill: 3 (configuration not conditionals), 6 (composition not inheritance), 7 (feature flags not code branches), 8 (versioned public contracts).

---

## 3. Configuration, not conditionals

Same library, different behaviors per host — through props and configuration, not `if`s that sniff where the code is running.

**Why it matters**
- A UI lib containing `if (context === 'wordpress')` is no longer a lib — it's part of WordPress.
- New context = compose different props. Don't touch the lib.
- Without this, in a year you have 40 `if`s in one component and nobody knows what's safe to delete.

❌ Bad:

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

Shared UI knows about WordPress. Every new context = a change to the shared lib.

✅ Good:

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

The lib doesn't know about WordPress or Account. It knows how to render a list. Composition happens in the host app.

---

## 6. Composition, not inheritance

UI libs do not inherit behavior from context. They receive it — as props, as children, as render-props, as slots. The parent decides how to assemble; the child only knows how to render.

**Why it matters**
- A component that inherits from context cannot be rendered alone in Storybook without faking the context.
- Composition is what enables reuse without "variants". One component, assembled differently.

❌ Bad:

```tsx
// libs/shared/ui-chat/src/lib/chat-panel.tsx
function ChatPanel() {
  const wpContext = useWordPressContext();
  const studioContext = useStudioContext();
  return (
    <div>
      <ChatHeader title={wpContext?.siteName ?? studioContext?.agentName} />
      <ChatMessages />
    </div>
  );
}
```

A shared UI lib that knows about WordPress and Studio. Cannot be loaded in Storybook without simulating contexts.

✅ Good:

```tsx
// libs/shared/ui-chat/src/lib/chat-panel.tsx
export function ChatPanel({ header, children }: {
  header: ReactNode;
  children: ReactNode;
}) {
  return <div>{header}{children}</div>;
}

// libs/wordpress/feature-chat/src/lib/wp-chat.tsx
<ChatPanel header={<ChatHeader title={site.name} />}>
  <ChatMessages />
</ChatPanel>
```

`ChatPanel` doesn't know where the title came from. It only knows how to render.

---

## 7. Feature flags instead of code branches

A new capability ships behind a flag. The flag is controlled from outside (configuration, not code). When the capability is mature — delete the flag, do not leave it "just in case".

**Why it matters**
- Enables deploy without release.
- Prevents long-lived branches that drift from the system.
- Replaces the scattered `if (isNewFeatureEnabled)` with a single, defined source.

❌ Bad:

```typescript
function generateResponse(prompt: string) {
  if (process.env.NEW_PROMPT_FORMAT === 'true') return newFormat(prompt);
  if (window.location.hostname.includes('staging')) return experimentalFormat(prompt);
  return legacyFormat(prompt);
}
```

Three ways to make the same decision. Nobody knows which path is safe to delete.

✅ Good:

```typescript
// libs/shared/feature-flags/src/lib/flags.ts
export const flags = {
  newPromptFormat: isEnabled('new-prompt-format'),
};

// usage
import { flags } from '@angie/shared/feature-flags';
function generateResponse(prompt: string) {
  return flags.newPromptFormat ? newFormat(prompt) : legacyFormat(prompt);
}
```

When `newPromptFormat` is mature: delete the flag, delete `legacyFormat`, delete the ternary. Only `newFormat` remains.

---

## 8. Version your public contracts

The `data-access` lib of a domain is a contract. A breaking change to its public API = a new entry, not a delete of the old one. Consumers migrate at their own pace.

**Why it matters**
- Without versioning, every change becomes a cross-team coordination project.
- Versioning is what lets domains evolve independently.

❌ Bad:

```typescript
// libs/sites-management/data-access/src/index.ts
// this week
export function getSite(id: string): Promise<Site>;
// next week — breaking change, no warning
export function getSite(id: string, options: GetSiteOptions): Promise<SiteWithMeta>;
```

Every consumer is broken. Has to be fixed in one day.

✅ Good — `libs/sites-management/data-access/package.json`:

```json
{
  "name": "@angie/sites-management-data-access",
  "exports": {
    ".":    "./src/index.ts",
    "./v1": "./src/v1/index.ts",
    "./v2": "./src/v2/index.ts"
  }
}
```

Consumers:

```typescript
import { getSite } from '@angie/sites-management-data-access/v1';   // still works
import { getSite } from '@angie/sites-management-data-access/v2';   // new
```

`v1` is deleted only when `nx graph` shows it has no consumers.

---

## How these rules reinforce each other

Configuration (3) is what's possible because of composition (6). Feature flags (7) are a controlled form of configuration. Versioning (8) is configuration for time — different consumers picking different versions of the same contract. Together they keep the platform's surface stable while its internals evolve.

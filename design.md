---
version: alpha
name: Architect Lint
description: Visual identity for the Architect Lint docs site — a technical reference for architecture principles.
colors:
  primary: "#3451b2"
  primary-dark: "#a8b1ff"
  on-primary: "#ffffff"
  text-1: "#213547"
  text-2: "#476582"
  text-3: "#8b949e"
  surface: "#ffffff"
  surface-alt: "#f6f6f7"
  surface-soft: "#f9f9fb"
  surface-elevated: "#ffffff"
  divider: "#e2e2e3"
  border: "#c2c2c4"
  danger: "#b8272c"
  warning: "#915930"
  success: "#18794e"
  issue-testing-fg: "#1d4ed8"
  issue-testing-bg: "#dbeafe"
  issue-security-fg: "#991b1b"
  issue-security-bg: "#fee2e2"
  issue-data-money-fg: "#9a3412"
  issue-data-money-bg: "#ffedd5"
  issue-structure-fg: "#b45309"
  issue-structure-bg: "#fef3c7"
  issue-api-fg: "#a16207"
  issue-api-bg: "#fef9c3"
  issue-runtime-fg: "#6d28d9"
  issue-runtime-bg: "#ede9fe"
  issue-ops-fg: "#0f766e"
  issue-ops-bg: "#ccfbf1"
  issue-agent-fg: "#334155"
  issue-agent-bg: "#e2e8f0"
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.03em
  code-md:
    fontFamily: "VP Font Mono"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  section: 32px
  content-max: 960px
  search-max: 640px
  issue-tag-width: 172px
components:
  arch-panel:
    backgroundColor: "{colors.surface-alt}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  issue-tag:
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 8px
  principle-badge:
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 9px
  arch-search-panel:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.xl}"
    padding: 0
  resource-icon-btn:
    rounded: "{rounded.lg}"
    size: 36px
  code-compare-label-bad:
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
  code-compare-label-good:
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
---

## Overview

Architect Lint is a documentation product for engineers reviewing architecture. The visual identity should feel **precise, calm, and reference-grade** — closer to a well-maintained internal handbook than a marketing landing page.

The site builds on the VitePress default theme with scoped custom layers (`arch-*` classes in `website/docs/.vitepress/theme/custom.css`). Custom UI should extend VitePress semantic tokens (`--vp-c-*`) rather than introducing one-off colors. Rule pages prioritize scannability: metadata badges, structured “Why it matters” issue tags, and side-by-side bad/good code comparisons.

Target audience: developers and reviewers who need fast orientation, stable permalinks, and clear severity signals without visual noise.

## Colors

The palette inherits VitePress indigo as the brand accent. Issue tags use **seven stake families** mapped to the 24 codegen types in `packages/codegen/issue-types.ts`.

- **Primary (#3451b2):** Brand accent for links, active tabs, success labels, and interactive hover borders. In dark mode, use `{colors.primary-dark}` (#a8b1ff).
- **Text hierarchy:** `{colors.text-1}` for body copy, `{colors.text-2}` for secondary labels, `{colors.text-3}` for de-emphasized chrome.
- **Surfaces:** `{colors.surface}` for page background, `{colors.surface-alt}` for inset panels and issue rows, `{colors.surface-elevated}` for floating elements.
- **Semantic:** `{colors.danger}` for bad examples and critical severity; `{colors.warning}` for deprecation banners; brand tint for good examples.
- **Issue tag families:** testing (blue), agent/maintainability (slate), security (red), data/money (orange), structure/coupling (amber), API/contracts (yellow), runtime/UX/scale (purple), ops/governance (teal). Each family has light and dark triplets in `custom.css`.

## Typography

Typography follows VitePress defaults: **Inter** for prose, monospace stack for rule IDs, terminal output, and search result IDs.

- **Headlines:** `{typography.headline-lg}` for hero titles (`.rule-title`); `{typography.headline-md}` for section titles (`.rule-section-title`).
- **Body:** `{typography.body-md}` for markdown content; `{typography.body-sm}` for issue text and card summaries.
- **Labels:** `{typography.label-sm}` uppercase for badges, severity pills, and issue tags. Keep letter-spacing at 0.03–0.04em for legibility at 12px.
- **Code:** `{typography.code-md}` inside terminal demos and monospace IDs. Do not reduce code size below 13px on rule pages.

## Layout

Layout follows a **content-first, fixed-max-width** model on marketing sections and fluid prose on rule pages.

- **Grid rhythm:** 4px micro-step, 8px base unit. Common gaps: 0.35rem for tight icon groups, 0.5rem for badge rows, 0.75rem for issue list items, 1rem for card padding.
- **Max widths:** `{spacing.content-max}` (960px) for feature sections and overview; `{spacing.search-max}` (640px) for command palette; 720px for terminal demo.
- **Issue list:** Two-column grid — fixed `{spacing.issue-tag-width}` (10.75rem) tag column + fluid text. Below 640px, stack tag above text.
- **Panels:** Rule sections use `.arch-panel` / `.arch-panel-solid` wrappers for visual grouping.

## Elevation & Depth

Depth is conveyed through **borders and tonal layers**, not heavy shadows.

- **Level 0:** Page background (`--vp-c-bg`).
- **Level 1:** Inset panels and issue rows — 1px `{colors.border}` border on `{colors.surface-alt}`.
- **Level 2:** Floating UI (search panel, version dropdown) — `{colors.divider}` border + `var(--vp-shadow-3)` or `var(--vp-shadow-5)`.
- **Level 3:** Modal backdrop — `rgb(0 0 0 / 0.45)` for search dialog `::backdrop`.

Avoid drop shadows on inline badges or issue tags; use color-mix tints at 15% opacity for severity pills instead.

## Shapes

The shape language is **soft-engineered**: slightly rounded rectangles, pill badges, no sharp corners on interactive targets.

- **Buttons & icon targets:** `{rounded.md}` (6px) for 32px nav icons; `{rounded.lg}` (8px) for 36px resource buttons.
- **Cards & panels:** `{rounded.lg}` (8px) for issue items and meta links; `{rounded.xl}` (12px) for search panel, terminal, and showcase cards.
- **Badges & tags:** `{rounded.full}` for severity, issue type, code-compare labels, and feature tabs.
- **Terminal chrome dots:** 50% circles (10px) with macOS-style red/yellow/green (#ff5f57, #febc2e, #28c840).

## Components

### Rule hero (`.rule-hero`)

Top-of-page header inside `.arch-panel`. Shows eyebrow, title, rule ID, principle badges, and summary. Badges use uppercase `{typography.label-sm}` with severity tint via `color-mix(in srgb, var(--vp-c-*-1) 15%, transparent)`.

### Why it matters (`.why-section`)

Structured list of issue tags + rationale text. Tag labels come from `ISSUE_TYPE_LABELS` in `packages/codegen/issue-types.ts`. CSS groups the 24 types into seven color families.

### Code compare labels (`.code-compare-label`)

Pill labels above fenced code blocks, injected by `buildRuleContentMarkdown()` in `rule-data.ts`. `.bad` uses danger tint; `.good` uses brand tint.

### Search dialog (`.arch-search-dialog`)

Command-palette pattern: centered panel, mono rule ID + secondary title, keyboard hint badge. Opens via ⌘K / Ctrl+K.

### Terminal demo (`.arch-terminal`)

Marketing component mimicking CLI lint output. Success lines use brand color; errors use danger; dim lines use text-3.

### Resource icon buttons (`.resource-icon-btn`)

36px square with divider border; hover shifts border and icon to brand.

### Home showcase (`.arch-showcase`)

Stack filter tabs (`.arch-showcase-tab`) and rule cards on the home page below the hero terminal demo.

### Rules overview (`.arch-overview`)

Stack cards, domain grids, and getting-started code panel on `/rules`.

## Do's and Don'ts

- Do extend VitePress `--vp-c-*` tokens for new UI; map custom tokens to them in YAML when exporting.
- Do keep issue-tag family colors synchronized between light (`:root`) and dark (`.dark`) blocks in `custom.css`.
- Do use `{rounded.full}` for categorical labels and `{rounded.lg}`–`{rounded.xl}` for containers.
- Do maintain the two-column issue layout on desktop; collapse to stacked layout below 640px.
- Don't add colors outside the seven issue families for “Why it matters” tags.
- Don't add box shadows to inline badges or list rows; reserve shadows for floating overlays only.
- Don't override VitePress search or appearance toggles without updating `Layout.vue` and nav actions consistently (search is custom; default VP theme toggle is hidden in favor of the nav-bar cycle button).
- Don't hand-edit generated website data; change catalog rules and run `pnpm docs:generate`.

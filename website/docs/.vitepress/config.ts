import { defineConfig } from 'vitepress';
import sidebarData from '../../src/data/sidebar.json';
import { applyRulePageData } from './rule-data';

type SidebarGroup = {
  text: string;
  collapsed: boolean;
  items: Array<{ text: string; href: string; title?: string }>;
};

function mapSidebar(groups: SidebarGroup[]) {
  return groups.map((group) => ({
    text: `${group.text} (${group.items.length})`,
    collapsed: group.collapsed,
    items: group.items.map((item) => ({
      text: item.text,
      link: item.href,
      ...(item.title ? { title: item.title } : {}),
    })),
  }));
}

export default defineConfig({
  title: 'architect-lint',
  description: 'Open architecture rules catalog',
  base: '/architect-lint/',
  cleanUrls: true,
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    config(md) {
      const defaultFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'mermaid') {
          return `<pre class="mermaid">${md.utils.escapeHtml(token.content.trim())}</pre>\n`;
        }
        return defaultFence ? defaultFence(tokens, idx, options, env, self) : '';
      };
    },
  },
  transformPageData(pageData) {
    applyRulePageData(pageData as Parameters<typeof applyRulePageData>[0]);
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Principles', link: '/rules/' },
      { text: 'GitHub', link: 'https://github.com/matipojo/architect-lint' },
    ],
    sidebar: mapSidebar(sidebarData as SidebarGroup[]),
    search: { provider: 'local' },
    editLink: {
      text: 'Suggest change on GitHub',
    },
    outline: { level: [2, 3], label: 'On this page' },
    docFooter: {
      prev: 'Previous rule',
      next: 'Next rule',
    },
    footer: {
      message: 'Released under the MIT License',
      copyright: 'matipojo/architect-lint',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/matipojo/architect-lint' }],
  },
});

import { defineConfig } from 'vitepress';
import sidebarData from '../../src/data/sidebar.json';
import { applyRulePageData } from './rule-data';

type SidebarGroup = {
  text: string;
  collapsed: boolean;
  items: Array<{ text: string; href: string; id?: string }>;
};

type SidebarItem = SidebarGroup['items'][number];

function mapSidebar(groups: SidebarGroup[]) {
  return groups.map((group) => ({
    text: group.text,
    collapsed: group.collapsed,
    items: group.items.map((item: SidebarItem) => ({
      text: item.text,
      link: item.href,
      ...(item.id ? { title: item.id } : {}),
    })),
  }));
}

export default defineConfig({
  title: 'Architect Lint',
  description: 'Open architecture rules catalog for Nx, React, and NestJS',
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
    nav: [{ text: 'Principles', link: '/rules/' }],
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
      message: 'Released under the MIT License.',
      copyright: 'Copyright © matipojo/architect-lint',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/matipojo/architect-lint' }],
  },
});

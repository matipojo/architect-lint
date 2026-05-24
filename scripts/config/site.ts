export const DOCS_BASE_URL = 'https://matipojo.github.io/architect-lint';
export const DOCS_BASE_PATH = '/architect-lint';
export const GITHUB_REPO = 'matipojo/architect-lint';
export const GITHUB_BRANCH = 'main';

export function rulePermalink(id: string): string {
  return `${DOCS_BASE_URL}/rules/${id}`;
}

export function ruleCatalogPath(stack: string, domain: string, group: string, id: string): string {
  return `catalog/stacks/${stack}/domains/${domain}/groups/${group}/${id}.rule.md`;
}

export function githubBlobUrl(catalogPath: string): string {
  return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${catalogPath}`;
}

export function githubEditUrl(catalogPath: string): string {
  return `https://github.com/${GITHUB_REPO}/edit/${GITHUB_BRANCH}/${catalogPath}`;
}

export function githubDiscussUrl(id: string): string {
  return `https://github.com/${GITHUB_REPO}/issues/new?labels=rule:${id}&title=Discuss%20${id}`;
}

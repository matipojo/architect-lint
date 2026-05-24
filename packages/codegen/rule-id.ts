export function shortRuleId(id: string, stack: string, domain: string): string {
  let rest = id;
  const stackPrefix = `${stack}-`;
  if (rest.startsWith(stackPrefix)) {
    rest = rest.slice(stackPrefix.length);
  }

  const domainSlug = domain.replace(/^domain-/, '');
  if (rest.startsWith(`${domainSlug}-`)) {
    return rest.slice(domainSlug.length + 1);
  }

  for (const part of domain.split('-')) {
    if (part && rest.startsWith(`${part}-`)) {
      return rest.slice(part.length + 1);
    }
  }

  return rest;
}

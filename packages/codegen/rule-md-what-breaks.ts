function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function extractBadExampleHints(badCode: string): string[] {
  const hints: string[] = [];
  for (const line of badCode.split('\n')) {
    const comment = line.match(/^\s*\/\/\s*(.+)$/);
    if (comment) {
      const text = comment[1].trim();
      if (text.length > 8 && !text.startsWith('...')) {
        hints.push(`- ${text.charAt(0).toUpperCase()}${text.slice(1)}`);
      }
    }
  }
  return hints;
}

function rephraseBulletAsFailure(bullet: string): string {
  const text = bullet.replace(/^-\s*/, '').trim();
  if (/^(Without|If |When |No |Missing|Mixing|Returning|One |A crash|Partial|Silent)/i.test(text)) {
    return `- ${text}`;
  }
  if (/^Failure mode:/i.test(text)) {
    return `- ${text}`;
  }
  const lower = text.charAt(0).toLowerCase() + text.slice(1);
  return `- If ignored: ${lower}`;
}

function countBullets(text: string): number {
  return text.split('\n').filter((line) => line.trim().startsWith('-')).length;
}

function shouldImproveWhatBreaks(why: string, whatBreaks: string): boolean {
  if (normalizeText(why) === normalizeText(whatBreaks)) return true;
  const whyBullets = countBullets(why);
  const breakBullets = countBullets(whatBreaks);
  return breakBullets < whyBullets && breakBullets <= 1;
}

export function improveWhatBreaks(
  why: string,
  whatBreaks: string,
  summary: string,
  badCode: string,
): string {
  if (!shouldImproveWhatBreaks(why, whatBreaks)) {
    return whatBreaks.trim();
  }

  const fromComments = extractBadExampleHints(badCode);
  const bullets = why
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'));
  const rephrased = bullets.map(rephraseBulletAsFailure);

  const merged: string[] = [];
  for (const line of [...fromComments, ...rephrased]) {
    if (!merged.some((existing) => normalizeText(existing) === normalizeText(line))) {
      merged.push(line);
    }
  }
  if (merged.length > 0) {
    return merged.join('\n');
  }

  const paragraph = why
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ');

  if (paragraph) {
    return `- If ignored: ${paragraph.charAt(0).toLowerCase()}${paragraph.slice(1)}`;
  }

  return `- ${summary.trim()}`;
}

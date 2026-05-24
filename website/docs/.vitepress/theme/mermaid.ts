let mermaidInitialized = false;

export async function initMermaid() {
  if (typeof document === 'undefined') return;

  const nodes = document.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed])');
  if (nodes.length === 0) return;

  const { default: mermaid } = await import('mermaid');
  if (!mermaidInitialized) {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
    mermaidInitialized = true;
  }

  for (const node of nodes) {
    node.dataset.processed = 'true';
    const chart = node.textContent?.trim() ?? '';
    try {
      const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).slice(2)}`, chart);
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-block';
      wrapper.innerHTML = svg;
      node.replaceWith(wrapper);
    } catch {
      // keep raw chart on failure
    }
  }
}

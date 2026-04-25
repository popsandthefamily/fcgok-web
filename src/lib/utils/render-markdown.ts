function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\/?(?:script|style|iframe|object|embed|form|input|button|meta|link)[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, '');
}

export function renderSafeMarkdown(markdown: string): string {
  let html = escapeHtml(markdown.replace(/\r\n/g, '\n'));

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>');

  html = html.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').map((row) => row.slice(1, -1).split('|').map((cell) => cell.trim()));
    if (rows.length < 2) return block;
    const [header, sep, ...body] = rows;
    if (!sep.every((cell) => /^-+$/.test(cell))) return block;
    return `<table><thead><tr>${header.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${body
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`;
  });

  html = html.replace(/(^[-*] .+(\n[-*] .+)*)/gm, (block) => {
    const items = block.split('\n').map((line) => line.replace(/^[-*]\s+/, '').trim());
    return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  });

  html = html.replace(/(^\d+\. .+(\n\d+\. .+)*)/gm, (block) => {
    const items = block.split('\n').map((line) => line.replace(/^\d+\.\s+/, '').trim());
    return `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
  });

  return html
    .split(/\n\n+/)
    .map((block) => {
      if (block.match(/^<(h\d|ul|ol|table|blockquote)/)) return block;
      if (!block.trim()) return '';
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

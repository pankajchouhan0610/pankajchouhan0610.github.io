/**
 * Decap editor helper: insert a Mermaid diagram block into the post body.
 * Diagrams are plain text in Markdown — no image files.
 */
(function registerMermaidEditorComponent() {
  function register() {
    if (!window.CMS || typeof window.CMS.registerEditorComponent !== 'function') {
      return false;
    }

    window.CMS.registerEditorComponent({
      id: 'mermaid',
      label: 'Mermaid diagram',
      fields: [
        {
          name: 'body',
          label: 'Diagram source',
          widget: 'text',
          default:
            'flowchart LR\n  Client --> API --> Cache\n  Cache --> DB',
          hint: 'Use Mermaid syntax. No images needed — this text renders as a diagram on the blog.',
        },
      ],
      pattern: /^```mermaid\n([\s\S]*?)\n```$/,
      fromBlock: function fromBlock(match) {
        return { body: match[1] };
      },
      toBlock: function toBlock(data) {
        return '```mermaid\n' + (data.body || '') + '\n```';
      },
      toPreview: function toPreview(data) {
        const escaped = String(data.body || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return (
          '<div style="border:1px solid #ddd;padding:12px;border-radius:6px;background:#f7f7f7">' +
          '<strong>Mermaid diagram</strong>' +
          '<pre style="margin:8px 0 0;white-space:pre-wrap;font-size:12px">' +
          escaped +
          '</pre></div>'
        );
      },
    });

    return true;
  }

  if (register()) return;

  // Decap may finish loading after this script; retry briefly.
  let attempts = 0;
  const timer = setInterval(function () {
    attempts += 1;
    if (register() || attempts > 40) clearInterval(timer);
  }, 250);
})();

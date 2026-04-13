'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  initialHtml: string;
  onSave: (html: string) => void;
  onCancel: () => void;
  saving: boolean;
}

// Lightweight contentEditable-based rich editor. No external deps.
export default function RichEditor({ initialHtml, onSave, onCancel, saving }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    forceUpdate((n) => n + 1);
  }

  function handleSave() {
    const html = editorRef.current?.innerHTML ?? '';
    onSave(html);
  }

  const btnStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #d1d5db',
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    cursor: 'pointer',
    borderRadius: 3,
    minWidth: 32,
  };

  return (
    <div style={{ border: '1px solid #1a3a2a', borderRadius: 4, background: 'white' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 8,
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          flexWrap: 'wrap',
        }}
      >
        <button type="button" style={btnStyle} onClick={() => exec('bold')} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('italic')} title="Italic">
          <em>I</em>
        </button>
        <div style={{ width: 1, background: '#e5e7eb', margin: '0 4px' }} />
        <button type="button" style={btnStyle} onClick={() => exec('formatBlock', 'H2')} title="Heading">
          H2
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('formatBlock', 'H3')} title="Subheading">
          H3
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('formatBlock', 'P')} title="Paragraph">
          ¶
        </button>
        <div style={{ width: 1, background: '#e5e7eb', margin: '0 4px' }} />
        <button type="button" style={btnStyle} onClick={() => exec('insertUnorderedList')} title="Bullet list">
          •
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('insertOrderedList')} title="Numbered list">
          1.
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('formatBlock', 'BLOCKQUOTE')} title="Pull quote">
          ❝
        </button>
        <div style={{ width: 1, background: '#e5e7eb', margin: '0 4px' }} />
        <button
          type="button"
          style={btnStyle}
          onClick={() => {
            const url = prompt('Link URL:');
            if (url) exec('createLink', url);
          }}
          title="Link"
        >
          🔗
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('removeFormat')} title="Clear formatting">
          ✕
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="portal-btn portal-btn-ghost"
            onClick={onCancel}
            disabled={saving}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="portal-btn portal-btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor surface */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="doc-content"
        style={{
          padding: '1rem 1.25rem',
          minHeight: 200,
          outline: 'none',
          fontSize: 14,
          lineHeight: 1.7,
          color: '#374151',
        }}
      />
    </div>
  );
}

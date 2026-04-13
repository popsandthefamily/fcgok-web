'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  initialHtml: string;
  onSave: (html: string) => void;
  onCancel: () => void;
  saving: boolean;
  documentId: string;
}

// Lightweight contentEditable-based rich editor with inline image support.
export default function RichEditor({ initialHtml, onSave, onCancel, saving, documentId }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, forceUpdate] = useState(0);
  const [uploading, setUploading] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preserve the caret position when clicking toolbar buttons so execCommand still works
  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }
  }

  function exec(command: string, value?: string) {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    forceUpdate((n) => n + 1);
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'inline');
      const res = await fetch(`/api/documents/${documentId}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      // Insert floating image at cursor
      restoreSelection();
      editorRef.current?.focus();
      const imgHtml = `<img src="${url}" alt="" class="inline-img inline-img-right" />`;
      document.execCommand('insertHTML', false, imgHtml);
      forceUpdate((n) => n + 1);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Click a floated image inside the editor to cycle its alignment
  function handleEditorClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.classList.contains('inline-img')) {
      e.preventDefault();
      if (target.classList.contains('inline-img-right')) {
        target.classList.replace('inline-img-right', 'inline-img-left');
      } else if (target.classList.contains('inline-img-left')) {
        target.classList.replace('inline-img-left', 'inline-img-full');
      } else if (target.classList.contains('inline-img-full')) {
        target.classList.remove('inline-img-full');
        target.classList.add('inline-img-right');
      } else {
        target.classList.add('inline-img-right');
      }
      forceUpdate((n) => n + 1);
    }
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
    lineHeight: 1,
  };

  return (
    <div style={{ border: '1px solid #1a3a2a', borderRadius: 4, background: 'white' }}>
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 8,
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}
        onMouseDown={(e) => {
          // Save caret before button click steals focus
          saveSelection();
          // Don't blur the editor
          if ((e.target as HTMLElement).tagName === 'BUTTON') e.preventDefault();
        }}
      >
        <button type="button" style={btnStyle} onClick={() => exec('bold')} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('italic')} title="Italic">
          <em>I</em>
        </button>
        <button type="button" style={btnStyle} onClick={() => exec('underline')} title="Underline">
          <u>U</u>
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
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Insert image (click again after to cycle float: right → left → full-width → right)"
        >
          {uploading ? '…' : '🖼'}
        </button>
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
          }}
        />

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

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="doc-content rich-editor"
        onClick={handleEditorClick}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        style={{
          padding: '1rem 1.25rem',
          minHeight: 240,
          maxHeight: 600,
          overflowY: 'auto',
          outline: 'none',
          fontSize: 14,
          lineHeight: 1.7,
          color: '#374151',
        }}
      />

      <div style={{ padding: '0.5rem 1rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#6b7280' }}>
        Tip: Click an inserted image to cycle its alignment (right → left → full-width).
      </div>
    </div>
  );
}

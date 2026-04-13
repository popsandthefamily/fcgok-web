'use client';

import { useEffect, useState, useRef } from 'react';
import { BlockNoteEditor, type PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

export interface BlockEditorProps {
  initialContent: string;
  initialFormat: 'blocks' | 'markdown' | 'html';
  documentId: string;
  primaryColor: string;
  onSave: (html: string) => Promise<void> | void;
  onCancel: () => void;
  saving: boolean;
}

async function parseInitialContent(
  editor: BlockNoteEditor,
  content: string,
  format: 'blocks' | 'markdown' | 'html',
): Promise<PartialBlock[]> {
  if (!content || !content.trim()) {
    return [{ type: 'paragraph' }];
  }

  if (format === 'blocks') {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // fall through
    }
  }

  // Auto-detect HTML vs markdown
  const looksLikeHtml = /<(p|h[1-6]|ul|ol|li|strong|em|blockquote|br|div|img)[\s>]/i.test(content);

  try {
    if (format === 'html' || looksLikeHtml) {
      return await editor.tryParseHTMLToBlocks(content);
    }
    return await editor.tryParseMarkdownToBlocks(content);
  } catch (err) {
    console.error('Failed to parse content, falling back to plain text', err);
    return [{ type: 'paragraph', content: content.slice(0, 4000) }];
  }
}

export default function BlockEditor({
  initialContent,
  initialFormat,
  documentId,
  primaryColor,
  onSave,
  onCancel,
  saving,
}: BlockEditorProps) {
  const [ready, setReady] = useState(false);
  const initializedRef = useRef(false);

  const editor = useCreateBlockNote({
    uploadFile: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'inline');
      const res = await fetch(`/api/documents/${documentId}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      return url;
    },
  });

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      const blocks = await parseInitialContent(editor, initialContent, initialFormat);
      try {
        editor.replaceBlocks(editor.document, blocks);
      } catch (err) {
        console.error('Failed to set initial blocks', err);
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    try {
      const html = await editor.blocksToFullHTML(editor.document);
      await onSave(html);
    } catch (err) {
      console.error('Save failed:', err);
      alert(err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <div
      style={{
        border: `1px solid ${primaryColor}`,
        borderRadius: 4,
        background: 'white',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Editing · Press <kbd style={kbdStyle}>/</kbd> for blocks · Drag the handle to reorder
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="portal-btn portal-btn-ghost"
            onClick={onCancel}
            disabled={saving}
            style={{ padding: '5px 12px', fontSize: 12 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="portal-btn portal-btn-primary"
            onClick={handleSave}
            disabled={saving || !ready}
            style={{ padding: '5px 12px', fontSize: 12 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {!ready ? (
        <div style={{ padding: '1.5rem', color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>
          Loading editor…
        </div>
      ) : (
        <div
          className="block-editor-wrap"
          style={{
            ['--bn-colors-editor-text' as string]: '#374151',
            ['--bn-colors-menu-text' as string]: primaryColor,
            ['--bn-colors-highlights-background' as string]: '#fefbf0',
            padding: '8px 0',
          }}
        >
          <BlockNoteView editor={editor} theme="light" />
        </div>
      )}
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  background: '#e5e7eb',
  padding: '1px 6px',
  borderRadius: 3,
  fontFamily: 'monospace',
  fontSize: 11,
  color: '#374151',
};

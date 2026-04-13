'use client';

import dynamic from 'next/dynamic';
import type { BlockEditorProps } from './BlockEditor';

// BlockNote uses window/document at import time — must be client-only.
const BlockEditor = dynamic(() => import('./BlockEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '1rem', color: '#9ca3af', fontSize: 13, fontStyle: 'italic' }}>
      Loading editor…
    </div>
  ),
});

export default function BlockEditorClient(props: BlockEditorProps) {
  return <BlockEditor {...props} />;
}

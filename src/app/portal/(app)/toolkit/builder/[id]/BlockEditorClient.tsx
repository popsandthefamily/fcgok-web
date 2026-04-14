'use client';

import dynamic from 'next/dynamic';
import type { BlockEditorProps } from './BlockEditor';
import { WheelLoader } from '@/components/BuggyWheel';

// BlockNote uses window/document at import time — must be client-only.
const BlockEditor = dynamic(() => import('./BlockEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '1rem' }}>
      <WheelLoader label="Loading editor…" style={{ fontSize: 13 }} />
    </div>
  ),
});

export default function BlockEditorClient(props: BlockEditorProps) {
  return <BlockEditor {...props} />;
}

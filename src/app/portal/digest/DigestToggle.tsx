'use client';

import { useState } from 'react';

export default function DigestToggle({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        className="portal-btn portal-btn-ghost"
        onClick={() => setExpanded(!expanded)}
        style={{ fontSize: 12 }}
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      {expanded && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: 4,
            fontSize: 14,
            lineHeight: 1.7,
            color: '#374151',
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

import type { CSSProperties } from 'react';

interface BuggyWheelProps {
  size?: number;
  spinning?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export default function BuggyWheel({
  size = 32,
  spinning = false,
  strokeWidth = 5,
  className,
  style,
  title,
}: BuggyWheelProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      style={{
        display: 'inline-block',
        color: 'currentColor',
        animation: spinning ? 'buggy-wheel-spin 2.4s linear infinite' : undefined,
        ...style,
      }}
    >
      {title ? <title>{title}</title> : null}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      >
        <circle cx="50" cy="50" r="44" />
        <circle cx="50" cy="50" r="34" strokeWidth={strokeWidth * 0.55} />
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="10" y1="50" x2="90" y2="50" />
        <line x1="21.7" y1="21.7" x2="78.3" y2="78.3" />
        <line x1="78.3" y1="21.7" x2="21.7" y2="78.3" />
      </g>
      <circle cx="50" cy="50" r="7" fill="currentColor" />
    </svg>
  );
}

export function WheelLoader({
  label,
  size = 18,
  color = '#9ca3af',
  style,
}: {
  label?: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 14,
        color,
        ...style,
      }}
    >
      <BuggyWheel spinning size={size} strokeWidth={7} />
      {label ?? 'Loading'}
    </span>
  );
}

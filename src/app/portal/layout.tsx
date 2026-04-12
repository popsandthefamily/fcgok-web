import type { Metadata } from 'next';
import './portal.css';

export const metadata: Metadata = {
  title: { default: 'Frontier Intelligence', template: '%s | Frontier Intelligence' },
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

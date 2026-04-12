import type { Metadata } from 'next';
import './portal.css';

export const metadata: Metadata = {
  title: { default: 'FCG Capital Intelligence Portal', template: '%s | FCG Portal' },
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

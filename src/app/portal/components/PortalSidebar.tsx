'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_SECTIONS = [
  {
    title: 'Intelligence',
    links: [
      { href: '/portal', label: 'Dashboard', icon: '◉' },
      { href: '/portal/feed', label: 'Intel Feed', icon: '▤' },
      { href: '/portal/investors', label: 'Investor Radar', icon: '◎' },
      { href: '/portal/digest', label: 'Weekly Digest', icon: '◫' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/portal/toolkit', label: 'Deal Toolkit', icon: '⬡' },
      { href: '/portal/toolkit/builder', label: 'Document Builder', icon: '✎' },
      { href: '/portal/toolkit/market-snapshot', label: 'Market Snapshot', icon: '▦' },
      { href: '/portal/toolkit/comps', label: 'Comps Tracker', icon: '▥' },
      { href: '/portal/toolkit/templates', label: 'Outreach Templates', icon: '▧' },
      { href: '/portal/toolkit/deck-review', label: 'Deck Review', icon: '▨' },
    ],
  },
];

const ADMIN_SECTION = {
  title: 'Admin',
  links: [
    { href: '/portal/admin', label: 'Overview', icon: '⬢' },
    { href: '/portal/admin/curate', label: 'Curate Intel', icon: '✦' },
    { href: '/portal/admin/entities', label: 'Manage Entities', icon: '◈' },
    { href: '/portal/admin/clients', label: 'Clients', icon: '◆' },
    { href: '/portal/admin/sources', label: 'Source Health', icon: '◇' },
  ],
};

export default function PortalSidebar({
  userName,
  orgName,
  isAdmin,
}: {
  userName: string;
  orgName: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const sections = isAdmin ? [...NAV_SECTIONS, ADMIN_SECTION] : NAV_SECTIONS;

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-brand">
        <h2>Frontier Intelligence</h2>
        <span>{orgName}</span>
      </div>

      {sections.map((section) => (
        <nav key={section.title} className="portal-nav-section">
          <div className="portal-nav-section-title">{section.title}</div>
          {section.links.map(({ href, label, icon }) => {
            const isActive =
              href === '/portal'
                ? pathname === '/portal'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`portal-nav-link${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: 14, opacity: 0.7, width: 18, textAlign: 'center' }}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
      ))}

      <div style={{ marginTop: 'auto', padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 13, color: 'rgba(244,241,234,0.6)', marginBottom: 4 }}>{userName}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            href="/portal/settings"
            style={{ fontSize: 12, color: 'rgba(244,241,234,0.3)', textDecoration: 'none' }}
          >
            Settings
          </Link>
          <Link
            href="/portal/logout"
            style={{ fontSize: 12, color: 'rgba(244,241,234,0.3)', textDecoration: 'none' }}
          >
            Sign out
          </Link>
        </div>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import BuggyWheel from '@/components/BuggyWheel';

type IconName =
  | 'dashboard'
  | 'feed'
  | 'radar'
  | 'digest'
  | 'toolbox'
  | 'document'
  | 'chart'
  | 'comps'
  | 'mail'
  | 'deck'
  | 'shield'
  | 'sparkle'
  | 'building'
  | 'users'
  | 'signal'
  | 'cog'
  | 'logout';

const ICON_SIZE = 16;

function Icon({ name }: { name: IconName }) {
  const common = {
    width: ICON_SIZE,
    height: ICON_SIZE,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="10" rx="1" />
          <rect x="13" y="3" width="8" height="6" rx="1" />
          <rect x="13" y="11" width="8" height="10" rx="1" />
          <rect x="3" y="15" width="8" height="6" rx="1" />
        </svg>
      );
    case 'feed':
      return (
        <svg {...common}>
          <path d="M4 4h16v5H4z" />
          <path d="M4 13h10" />
          <path d="M4 17h16" />
          <path d="M4 21h10" />
        </svg>
      );
    case 'radar':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
        </svg>
      );
    case 'digest':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );
    case 'toolbox':
      return (
        <svg {...common}>
          <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M3 12h6" />
          <path d="M15 12h6" />
          <path d="M9 10v4" />
          <path d="M15 10v4" />
        </svg>
      );
    case 'document':
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 3 3 5-6" />
        </svg>
      );
    case 'comps':
      return (
        <svg {...common}>
          <rect x="3" y="10" width="5" height="11" rx="0.5" />
          <rect x="9.5" y="6" width="5" height="15" rx="0.5" />
          <rect x="16" y="13" width="5" height="8" rx="0.5" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case 'deck':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <path d="M12 16v4" />
          <path d="M8 20h8" />
          <path d="M7 8l3 3 4-5 3 4" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="M12 8l2 2-2 2-2-2z" fill="currentColor" />
        </svg>
      );
    case 'building':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M9 7h2" />
          <path d="M13 7h2" />
          <path d="M9 11h2" />
          <path d="M13 11h2" />
          <path d="M9 15h2" />
          <path d="M13 15h2" />
          <path d="M10 21v-3h4v3" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c.5-3.5 3.3-5.5 6.5-5.5s6 2 6.5 5.5" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 14.5c2.5.2 4.5 2 5 5" />
        </svg>
      );
    case 'signal':
      return (
        <svg {...common}>
          <path d="M4 18a9 9 0 0 1 16 0" />
          <path d="M7 18a6 6 0 0 1 10 0" />
          <path d="M10 18a3 3 0 0 1 4 0" />
          <circle cx="12" cy="19" r="0.75" fill="currentColor" />
        </svg>
      );
    case 'cog':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
  }
}

interface NavLink {
  href: string;
  label: string;
  icon: IconName;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Intelligence',
    links: [
      { href: '/portal', label: 'Dashboard', icon: 'dashboard' },
      { href: '/portal/raise', label: 'Capital Raise', icon: 'sparkle' },
      { href: '/portal/feed', label: 'Intel Feed', icon: 'feed' },
      { href: '/portal/investors', label: 'Investor Radar', icon: 'radar' },
      { href: '/portal/digest', label: 'Weekly Digest', icon: 'digest' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/portal/toolkit/builder', label: 'Document Builder', icon: 'document' },
      { href: '/portal/toolkit/market-snapshot', label: 'Market Snapshot', icon: 'chart' },
      { href: '/portal/toolkit/comps', label: 'Comps Tracker', icon: 'comps' },
      { href: '/portal/toolkit/templates', label: 'Outreach Templates', icon: 'mail' },
      { href: '/portal/toolkit/deck-review', label: 'Deck Review', icon: 'deck' },
    ],
  },
];

const ADMIN_SECTION: NavSection = {
  title: 'Admin',
  links: [
    { href: '/portal/admin', label: 'Overview', icon: 'shield' },
    { href: '/portal/admin/entities', label: 'Manage Entities', icon: 'building' },
    { href: '/portal/admin/clients', label: 'Members', icon: 'users' },
    { href: '/portal/admin/sources', label: 'Source Health', icon: 'signal' },
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

  const sections: NavSection[] = isAdmin ? [...NAV_SECTIONS, ADMIN_SECTION] : NAV_SECTIONS;

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BuggyWheel size={22} strokeWidth={6} style={{ color: 'rgba(244,241,234,0.7)' }} />
          <h2 style={{ margin: 0 }}>Frontier Intelligence</h2>
        </div>
        <span style={{ marginLeft: 32 }}>{orgName}</span>
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
                <span className="portal-nav-icon" aria-hidden>
                  <Icon name={icon} />
                </span>
                {label as ReactNode}
              </Link>
            );
          })}
        </nav>
      ))}

      <div style={{ marginTop: 'auto', padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 13, color: 'rgba(244,241,234,0.6)', marginBottom: 10 }}>{userName}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link
            href="/portal/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              color: 'rgba(244,241,234,0.5)',
              textDecoration: 'none',
              lineHeight: 1,
            }}
          >
            <Icon name="cog" />
            <span>Settings</span>
          </Link>
          <form action="/portal/logout" method="post" style={{ display: 'contents' }}>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                fontSize: 12,
                color: 'rgba(244,241,234,0.5)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                lineHeight: 1,
                textAlign: 'left',
              }}
            >
              <Icon name="logout" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

import AuthGate from './AuthGate';

export default function AuthenticatedPortalLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

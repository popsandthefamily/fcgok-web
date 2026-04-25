// Minimal public layout for tokenized share links. Strips the marketing
// site chrome (Navbar/Footer) so investors see the asset directly.
export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

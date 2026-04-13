// Setup page uses its own layout so it bypasses the (app) authenticated shell
export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

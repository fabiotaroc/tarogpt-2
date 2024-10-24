import { SidebarDesktop } from "@/components/sidebar-desktop";
import { SidebarToggle } from "@/components/sidebar-toggle";

interface QueryLayoutProps {
  children: React.ReactNode;
}

export default async function QueryLayout({ children }: QueryLayoutProps) {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <div className="absolute p-4">
        <SidebarToggle />
      </div>
      <SidebarDesktop />
      {children}
    </div>
  );
}

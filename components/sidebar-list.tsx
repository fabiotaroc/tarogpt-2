import { clearQueries, getQueries } from "@/app/actions";
import { ClearHistory } from "@/components/clear-history";
import { SidebarItems } from "@/components/sidebar-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { cache } from "react";

interface SidebarListProps {
  userId?: string;
  children?: React.ReactNode;
}

const loadQueries = cache(async (userId?: string) => {
  return await getQueries(userId)
})

export async function SidebarList({ userId }: SidebarListProps) {
  const queries = await loadQueries(userId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {queries?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems queries={queries} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearQueries={clearQueries} isEnabled={queries?.length > 0} />
      </div>
    </div>
  );
}

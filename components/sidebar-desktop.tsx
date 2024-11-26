import { Sidebar } from "@/components/sidebar";

import { auth } from "@clerk/nextjs/server";
import { QueryHistory } from "@/components/query-history";

export async function SidebarDesktop() {
  const session = auth();

  if (!session?.userId) {
    return null;
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-50 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      <QueryHistory userId={session.userId} />
    </Sidebar>
  );
}

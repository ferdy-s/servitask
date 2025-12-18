"use client";

import { useMemo, useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

export type OrgRole = "OWNER" | "ADMIN" | "PM" | "MEMBER" | "CLIENT";

export default function AppShell({
  children,
  user,
  role,
  activeOrg,
  organizations,
  modules,
}: {
  children: React.ReactNode;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  role: OrgRole;
  activeOrg: { id: string; name: string; slug: string };
  organizations: { id: string; name: string; role: OrgRole }[];
  modules: string[]; // keys dari Module table
}) {
  const [collapsed, setCollapsed] = useState(false);

  const ctx = useMemo(
    () => ({
      user,
      role,
      activeOrg,
      organizations,
      modules,
      collapsed,
      setCollapsed,
    }),
    [user, role, activeOrg, organizations, modules, collapsed]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar {...ctx} />

        <div className="flex-1 min-w-0">
          <Topbar {...ctx} />
          <main className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-4 md:px-6 md:pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

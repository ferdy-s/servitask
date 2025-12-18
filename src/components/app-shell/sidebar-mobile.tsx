"use client";

import Sidebar from "./sidebar";
import type { OrgRole } from "./app-shell";

export default function SidebarMobile(props: {
  user: { name: string; email: string; avatarUrl: string | null };
  role: OrgRole; // ✅ WAJIB, bukan optional
  activeOrg: { id: string; name: string; slug: string };
  organizations: { id: string; name: string; role: OrgRole }[];
  modules: string[];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  return <Sidebar {...props} />;
}

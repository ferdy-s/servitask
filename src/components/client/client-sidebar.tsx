"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, FolderKanban, Bell } from "lucide-react";

const items = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/client/dashboard", // project list ada di dashboard
    icon: FolderKanban,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

export default function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[220px] border-r bg-background/80 backdrop-blur">
      <div className="flex w-full flex-col px-4 py-5">
        <div className="mb-6">
          <div className="text-lg font-semibold tracking-tight">ServiTask</div>
          <div className="text-xs text-muted-foreground">Client Portal</div>
        </div>

        <nav className="space-y-1">
          {items.map((i) => {
            const active =
              pathname === i.href || pathname.startsWith(i.href + "/");
            return (
              <Link
                key={i.href}
                href={i.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <i.icon size={18} />
                <span>{i.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

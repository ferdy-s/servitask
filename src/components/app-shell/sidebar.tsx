"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Users,
  Settings,
  Clock,
  Bell,
  ChevronLeft,
  Package,
  BrickWallShield,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { OrgRole } from "./app-shell";

/* ================= TYPES ================= */

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: OrgRole[];
  moduleKey?: string;
};

/* ================= MENU CONFIG ================= */

const mainMenu: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["OWNER", "ADMIN", "PM", "MEMBER", "CLIENT"],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["OWNER", "ADMIN", "PM", "MEMBER"],
    moduleKey: "projects",
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Briefcase,
    roles: ["OWNER", "ADMIN", "PM"],
    moduleKey: "clients",
  },
  {
    label: "Time Reports",
    href: "/reports/time",
    icon: Clock,
    roles: ["OWNER", "ADMIN"],
    moduleKey: "time_tracking",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["OWNER", "ADMIN", "PM", "MEMBER", "CLIENT"],
    moduleKey: "notifications",
  },
];

const settingsMenu: MenuItem[] = [
  {
    label: "Team",
    href: "/settings/team",
    icon: Users,
    roles: ["OWNER", "ADMIN"],
    moduleKey: "team",
  },
  {
    label: "Organization",
    href: "/settings/org",
    icon: Settings,
    roles: ["OWNER", "ADMIN"],
    moduleKey: "org_settings",
  },
  {
    label: "Modules",
    href: "/settings/modules",
    icon: Package,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Audit Log",
    href: "/settings/audit",
    icon: BrickWallShield,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Trash",
    href: "/settings/trash",
    icon: Trash,
    roles: ["OWNER", "ADMIN"],
  },
];

/* ================= COMPONENT ================= */

export default function Sidebar(props: {
  user: { name: string; email: string; avatarUrl: string | null };
  role: OrgRole;
  activeOrg: { id: string; name: string; slug: string };
  organizations: { id: string; name: string; role: OrgRole }[];
  modules: string[];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { role, modules, collapsed, setCollapsed } = props;

  const isEnabled = (item: MenuItem) =>
    !item.moduleKey || modules.includes(item.moduleKey);

  const NavItem = ({ item }: { item: MenuItem }) => {
    const active =
      pathname === item.href || pathname.startsWith(item.href + "/");

    const base =
      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors";
    const activeCls = "bg-primary text-primary-foreground";
    const idleCls =
      "text-muted-foreground hover:bg-muted hover:text-foreground";

    const content = (
      <Link
        href={item.href}
        className={clsx(
          base,
          active ? activeCls : idleCls,
          collapsed && "justify-center px-2"
        )}
      >
        <item.icon size={18} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );

    if (!collapsed) return content;

    return (
      <TooltipProvider delayDuration={120}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <aside
      className={clsx(
        "hidden md:flex min-h-screen border-r bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        collapsed ? "w-[84px]" : "w-[280px]"
      )}
    >
      <div className="flex w-full flex-col">
        {/* ===== BRAND ===== */}
        <div className={clsx("px-4 py-5", collapsed && "px-3")}>
          <div
            className={clsx(
              "flex items-center justify-between",
              collapsed && "justify-center"
            )}
          >
            {!collapsed ? (
              <div className="space-y-0.5">
                <div className="text-lg font-semibold tracking-tight">
                  ServiTask
                </div>
                <div className="text-xs text-muted-foreground">
                  Workspace OS
                </div>
              </div>
            ) : (
              <div className="text-lg font-semibold">ST</div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </Button>
            )}
          </div>

          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="mt-3 rounded-xl"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <ChevronLeft size={18} className="rotate-180" />
            </Button>
          )}
        </div>

        <Separator />

        {/* ===== NAVIGATION ===== */}
        <ScrollArea className="flex-1">
          <div className={clsx("px-3 py-4", collapsed && "px-2")}>
            {/* MAIN */}
            <div
              className={clsx(
                "mb-4 text-xs font-medium text-muted-foreground",
                collapsed && "text-center"
              )}
            >
              {!collapsed ? "MAIN" : "•"}
            </div>

            <div className="space-y-1">
              {mainMenu
                .filter((m) => m.roles.includes(role))
                .filter(isEnabled)
                .map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
            </div>

            <div className="my-6">
              <Separator />
            </div>

            {/* SETTINGS */}
            <div
              className={clsx(
                "mb-4 text-xs font-medium text-muted-foreground",
                collapsed && "text-center"
              )}
            >
              {!collapsed ? "SETTINGS" : "•"}
            </div>

            <div className="space-y-1">
              {settingsMenu
                .filter((m) => m.roles.includes(role))
                .filter(isEnabled)
                .map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
            </div>
          </div>
        </ScrollArea>

        {/* ===== FOOTER ===== */}
        <div className={clsx("px-4 py-4", collapsed && "px-2")}>
          <div
            className={clsx(
              "rounded-2xl border bg-muted/40 p-3",
              collapsed && "p-2"
            )}
          >
            {!collapsed ? (
              <div className="text-xs text-muted-foreground leading-relaxed">
                Secure multi-tenant workspace. Role-based access enabled.
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                RBAC
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, Building2, LogOut, Bell } from "lucide-react";
import type { OrgRole } from "./app-shell";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import Sidebar from "./sidebar";

type Notification = {
  id: string;
  title: string;
  body?: string;
  href?: string;
  isRead: boolean;
};

export default function Topbar(props: {
  user: { name: string; email: string; avatarUrl: string | null };
  role: OrgRole;
  activeOrg: { id: string; name: string; slug: string };
  organizations: { id: string; name: string; role: OrgRole }[];
  modules: string[];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  /* ---------------- ORG SWITCH ---------------- */
  async function switchOrg(organizationId: string) {
    if (organizationId === props.activeOrg.id) return;

    setSwitching(true);
    try {
      const res = await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      if (!res.ok) return;

      router.refresh(); // refresh server layout
      router.push("/dashboard");
    } finally {
      setSwitching(false);
    }
  }

  /* ---------------- LOGOUT ---------------- */
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  /* ---------------- NOTIFICATIONS ---------------- */
  async function loadNotifications() {
    setLoadingNotif(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
    } finally {
      setLoadingNotif(false);
    }
  }

  async function markAsRead(n: Notification) {
    if (!n.isRead) {
      await fetch(`/api/notifications/${n.id}/read`, {
        method: "PATCH",
      });
    }
    if (n.href) router.push(n.href);
    loadNotifications();
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const initials = props.user.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-2">
          {/* Mobile sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl md:hidden"
              >
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[320px]">
              <Sidebar {...props} />
            </SheetContent>
          </Sheet>

          {/* Organization switch */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-xl gap-2 max-w-[220px]"
              >
                <Building2 size={18} />
                <span className="truncate font-medium">
                  {props.activeOrg.name}
                </span>
                <ChevronDown size={16} className="opacity-70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[260px]">
              {props.organizations.map((o) => (
                <DropdownMenuItem
                  key={o.id}
                  onClick={() => switchOrg(o.id)}
                  disabled={switching || o.id === props.activeOrg.id}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{o.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {o.role}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings/org")}>
                Organization Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[360px] p-0">
              <div className="px-4 py-2 text-sm font-medium">Notifications</div>
              <Separator />

              <div className="max-h-[360px] overflow-y-auto">
                {loadingNotif && (
                  <div className="p-4 text-sm text-muted-foreground">
                    Loading notifications…
                  </div>
                )}

                {!loadingNotif && notifications.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">
                    Tidak ada notifikasi
                  </div>
                )}

                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n)}
                    className={`cursor-pointer px-4 py-3 text-sm transition ${
                      !n.isRead
                        ? "bg-muted/40 hover:bg-muted"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium">{n.title}</div>
                    {n.body && (
                      <div className="text-xs text-muted-foreground">
                        {n.body}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-xl gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={props.user.avatarUrl ?? undefined} />
                  <AvatarFallback>{initials || "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block max-w-[160px] truncate text-sm font-medium">
                  {props.user.name}
                </span>
                <ChevronDown size={16} className="opacity-70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[240px]">
              <div className="px-3 py-2">
                <div className="text-sm font-medium truncate">
                  {props.user.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {props.user.email}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Role: <span className="font-medium">{props.role}</span>
                </div>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut size={16} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

import type { OrgRole } from "@/components/app-shell/app-shell";

export function hasRole(role: OrgRole, allowed: OrgRole[]) {
  return allowed.includes(role);
}

export function hasModule(modules: string[], key: string) {
  return modules.includes(key);
}

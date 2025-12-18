import { KPIItem } from "@/types/kpi";

export function normalizeKpiItems(items: unknown): KPIItem[] {
  if (!Array.isArray(items)) return [];
  return items;
}

export function sortKpiByValue(items: unknown): KPIItem[] {
  const safeItems = normalizeKpiItems(items);

  return [...safeItems].sort((a: KPIItem, b: KPIItem) => b.value - a.value);
}

export function calculateTotal(items: unknown): number {
  const safeItems = normalizeKpiItems(items);

  return safeItems.reduce((total: number, t: KPIItem) => total + t.value, 0);
}

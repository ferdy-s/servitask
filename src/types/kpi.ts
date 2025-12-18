export type KPIItem = {
  label: string;
  value: number;
  trend?: number; // +1 / -1 / %
};

export type KPIProps = {
  items: KPIItem[];
};

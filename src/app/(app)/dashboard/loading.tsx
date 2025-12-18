import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-96 rounded bg-muted animate-pulse" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="h-[120px] rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

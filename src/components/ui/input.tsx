import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base
        "w-full min-w-0 rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground",
        "transition-all duration-200 ease-out",

        // Light / Dark surface
        "border-input shadow-sm",
        "dark:bg-input/40 dark:border-border/50 dark:shadow-none",

        // Placeholder
        "placeholder:text-muted-foreground/70",

        // Focus state (modern & elegant)
        "focus-visible:outline-none",
        "focus-visible:border-primary",
        "focus-visible:ring-2 focus-visible:ring-primary/25",

        // Invalid state
        "aria-invalid:border-destructive",
        "aria-invalid:ring-2 aria-invalid:ring-destructive/30",

        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",

        // File input (rapi & konsisten)
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",

        // Responsive text
        "md:text-sm text-[15px]",

        className
      )}
      {...props}
    />
  );
}

export { Input };

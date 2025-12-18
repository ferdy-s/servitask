import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Base
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-medium",
    "transition-all duration-200 ease-out",
    "select-none",
    "outline-none",

    // Interaction
    "hover:-translate-y-[1px] active:translate-y-0",
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",

    // Focus & accessibility
    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",

    // Icon handling
    "[&_svg]:pointer-events-none",
    "[&_svg:not([class*='size-'])]:size-4",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm",
          "hover:bg-primary/90 hover:shadow-md",
          "active:shadow-sm",
        ].join(" "),

        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm",
          "hover:bg-secondary/85 hover:shadow-md",
        ].join(" "),

        outline: [
          "border border-border bg-background",
          "shadow-xs",
          "hover:bg-accent hover:text-accent-foreground",
          "hover:border-accent-foreground/20",
        ].join(" "),

        ghost: [
          "bg-transparent",
          "hover:bg-accent hover:text-accent-foreground",
        ].join(" "),

        destructive: [
          "bg-destructive text-white",
          "shadow-sm",
          "hover:bg-destructive/90 hover:shadow-md",
          "focus-visible:ring-destructive/50",
        ].join(" "),

        link: [
          "bg-transparent text-primary",
          "underline-offset-4 hover:underline",
          "hover:text-primary/80",
        ].join(" "),
      },

      size: {
        sm: "h-8 px-3 rounded-md text-xs gap-1.5",
        default: "h-10 px-4 gap-2",
        lg: "h-11 px-6 text-base gap-2.5",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-12 p-0",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };

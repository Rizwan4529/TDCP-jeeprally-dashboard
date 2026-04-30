import { type ReactNode, type ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      display: "font-heading text-[80px] leading-[0.92] tracking-tight",
      "section-title": "font-heading text-[50px] leading-[3rem] tracking-tight",
      "section-description":
        "font-description text-lg leading-[1.5rem] tracking-tight",
      h1: "font-heading text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight",
      h2: "font-heading text-4xl md:text-5xl leading-tight",
      h3: "font-heading text-3xl md:text-4xl leading-snug",
      "resort-name": "font-heading text-xl md:text-[28px] leading-snug",
      h4: "text-2xl font-semibold leading-snug",
      h5: "text-xl font-semibold leading-snug",
      h6: "text-lg font-semibold",
      "body-lg": "text-lg leading-[1.75]",
      body: "text-base leading-[1.7]",
      "body-sm": "text-sm leading-relaxed",
      caption: "text-xs leading-normal",
      overline: "text-xs font-semibold uppercase tracking-[0.18em]",
      label: "text-sm font-medium leading-none",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      white: "text-white",
      inherit: "text-inherit",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
});

const elementMap: Record<string, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  "resort-name": "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  "body-lg": "p",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
  label: "span",
};

interface TypographyProps extends VariantProps<typeof typographyVariants> {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Typography({
  as,
  variant = "body",
  color = "default",
  className,
  children,
}: TypographyProps) {
  const Component = as ?? elementMap[variant ?? "body"] ?? "p";
  return (
    <Component
      className={cn(typographyVariants({ variant, color }), className)}
    >
      {children}
    </Component>
  );
}

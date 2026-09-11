import type { ReactNode } from "react";

import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";

export type NavigationTabItem<T extends string = string> = {
  name: string;
  label: T;
  count?: number;
};

type NavigationCommonProps<T extends string = string> = {
  navList: NavigationTabItem<T>[];
  activeTab: NavigationTabItem<T>;
  handleActiveTab: (tab: NavigationTabItem<T>) => void;
  className?: string;
};

export function NavigationCommon<T extends string = string>({
  navList,
  activeTab,
  handleActiveTab,
  className,
}: NavigationCommonProps<T>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-1 border-b border-[#E8E8E8]",
        className,
      )}
      role="tablist"
    >
      {navList.map((navItem) => {
        const isActive = activeTab.label === navItem.label;
        return (
          <button
            key={navItem.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleActiveTab(navItem)}
            className={cn(
              "box-border flex h-10 items-center gap-2 border-b-2 px-3 pb-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-primary/40 hover:text-primary",
            )}
          >
            <Typography as="span" variant="body-sm" color="inherit">
              {navItem.name}
            </Typography>
            {typeof navItem.count === "number" ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {navItem.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <Typography
          as="h1"
          variant="h5"
          className="text-[22px] font-semibold tracking-tight text-[#1F1838] sm:text-[24px]"
        >
          {title}
        </Typography>
        {description ? (
          <Typography variant="body-sm" className="text-[#6B7890]">
            {description}
          </Typography>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

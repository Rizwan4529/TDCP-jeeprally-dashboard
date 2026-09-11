import { Link, useLocation } from "react-router-dom";
import { ChevronRightIcon } from "lucide-react";

import { Typography } from "@/components/common/Typography";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";

type Crumb = {
  name: string;
  path?: string;
  isCurrent?: boolean;
};

const ROUTE_LABELS: { match: RegExp | string; name: string }[] = [
  { match: ROUTES.DASHBOARD, name: "Dashboard" },
  { match: ROUTES.PROFILE + "/edit", name: "Edit profile" },
  { match: ROUTES.PROFILE, name: "Profile" },
  { match: ROUTES.TEAMS, name: "Teams" },
  { match: ROUTES.VEHICLE + "/new", name: "Add vehicle" },
  { match: /^\/vehicle\/[^/]+\/edit$/, name: "Edit vehicle" },
  { match: ROUTES.VEHICLE, name: "Vehicle" },
  { match: "/events", name: "Events" },
  { match: ROUTES.REGISTRATION, name: "Registration" },
  { match: ROUTES.PAYMENT_CALLBACK, name: "Payment" },
];

const PARENT_BY_PATH: { match: RegExp | string; parentPath: string; parentName: string }[] =
  [
    {
      match: ROUTES.PROFILE + "/edit",
      parentPath: ROUTES.PROFILE,
      parentName: "Profile",
    },
    {
      match: ROUTES.VEHICLE + "/new",
      parentPath: ROUTES.VEHICLE,
      parentName: "Vehicle",
    },
    {
      match: /^\/vehicle\/[^/]+\/edit$/,
      parentPath: ROUTES.VEHICLE,
      parentName: "Vehicle",
    },
  ];

function matches(pathname: string, match: RegExp | string) {
  if (typeof match === "string") return pathname === match;
  return match.test(pathname);
}

function resolveLabel(pathname: string): string | null {
  for (const entry of ROUTE_LABELS) {
    if (matches(pathname, entry.match)) return entry.name;
  }
  return null;
}

function resolveParent(pathname: string) {
  for (const entry of PARENT_BY_PATH) {
    if (matches(pathname, entry.match)) {
      return { path: entry.parentPath, name: entry.parentName };
    }
  }
  return null;
}

export function Breadcrumbs({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const crumbs: Crumb[] = [{ name: "Home", path: ROUTES.DASHBOARD }];

  if (pathname !== ROUTES.DASHBOARD) {
    const parent = resolveParent(pathname);
    if (parent) {
      crumbs.push({ name: parent.name, path: parent.path });
    }
    const label = resolveLabel(pathname);
    if (label) {
      crumbs.push({ name: label, isCurrent: true });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.name}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRightIcon
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              {crumb.isCurrent || isLast || !crumb.path ? (
                <Typography
                  as="span"
                  variant="body-sm"
                  className="font-medium text-foreground"
                >
                  {crumb.name}
                </Typography>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Typography as="span" variant="body-sm" color="inherit">
                    {crumb.name}
                  </Typography>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import { BellIcon } from "lucide-react";

import { EmptyState } from "@/components/common/LoadingStates";
import { PageHeader } from "@/components/common/NavigationCommon";
import {
  SCROLL_PAGE,
  SIDEBAR_PAGE_PADDING,
} from "@/components/layout/pageLayout";
import { cn } from "@/lib/utils";

// Invite-by-email flow paused for now.
// The previous invite list / accept / decline UI lived here and can be restored
// with useInviteNotifications + team-invites hooks when invites are re-enabled.

export default function NotificationsPage() {
  return (
    <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING, "gap-5")}>
      <PageHeader
        title="Notifications"
        description="Team invite notifications are temporarily unavailable."
      />
      <EmptyState
        icon={BellIcon}
        title="Invites paused"
        description="Co-drivers are now added by the driver from the Teams page. Invite notifications will return when that flow is re-enabled."
      />
    </div>
  );
}

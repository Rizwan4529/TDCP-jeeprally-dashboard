import { Link } from "react-router-dom";
import { FileQuestionIcon, LayoutDashboardIcon } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-4 py-10">
      <div className="w-full max-w-xl">
        <EmptyState
          icon={FileQuestionIcon}
          title="Page not found"
          description="The page you're looking for doesn't exist or may have been moved."
          size="page"
          action={
            <Button
              asChild
              className="h-11 rounded-[10px] bg-[#3FA565] px-6 text-[14px] font-semibold hover:bg-[#369A5D]"
            >
              <Link to={ROUTES.DASHBOARD}>
                <LayoutDashboardIcon className="size-4" />
                Back to dashboard
              </Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}

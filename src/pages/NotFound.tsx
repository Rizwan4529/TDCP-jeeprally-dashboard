import { Link } from "react-router-dom"

import { Typography } from "@/components/common/Typography"

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-16">
      <Typography as="h2" variant="h4">
        Page not found
      </Typography>
      <Typography color="muted">
        The page you're looking for doesn't exist.
      </Typography>
      <div>
        <Link to="/dashboard" className="text-primary underline underline-offset-4">
          <Typography as="span" variant="body" color="inherit">
            Go back to Dashboard
          </Typography>
        </Link>
      </div>
    </div>
  )
}

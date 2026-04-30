import { Typography } from "@/components/common/Typography"

export default function DashboardPage() {
  return (
    <div className="space-y-2">
      <Typography as="h2" variant="h5">
        Dashboard
      </Typography>
      <Typography color="muted">Welcome to the dashboard.</Typography>
    </div>
  )
}

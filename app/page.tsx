import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SystemStatus } from "@/components/dashboard/system-status"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Leave Management Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your professional leave management system. Monitor, manage, and track employee leave requests
          efficiently.
        </p>
      </div>

      {/* Key Statistics */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActions />
        </div>

        {/* Right Column - System Status */}
        <div>
          <SystemStatus />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}

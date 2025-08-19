"use client"

import { useState } from "react"
import { PendingLeaveRequests } from "@/components/leaves/pending-leave-requests"
import { RecentLeaveActions } from "@/components/leaves/recent-leave-actions"

export default function PendingLeavesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUpdate = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Approvals</h1>
          <p className="text-muted-foreground">Review and manage pending leave requests</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PendingLeaveRequests refreshTrigger={refreshTrigger} onUpdate={handleUpdate} />
        </div>
        <div>
          <RecentLeaveActions refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}

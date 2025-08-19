"use client"

import { useState } from "react"
import { ApplyLeaveForm } from "@/components/leaves/apply-leave-form"
import { EmployeeLeaveHistory } from "@/components/leaves/employee-leave-history"

export default function ApplyLeavePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleLeaveApplied = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Application</h1>
          <p className="text-muted-foreground">Apply for leave and view application history</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplyLeaveForm onSuccess={handleLeaveApplied} />
        <EmployeeLeaveHistory refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}

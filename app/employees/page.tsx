"use client"

import { useState } from "react"
import { AddEmployeeForm } from "@/components/employees/add-employee-form"
import { EmployeeList } from "@/components/employees/employee-list"

export default function EmployeesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEmployeeAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
          <p className="text-muted-foreground">Add and manage employees in the system</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddEmployeeForm onSuccess={handleEmployeeAdded} />
        <EmployeeList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}

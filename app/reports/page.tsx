import { AllEmployeesBalance } from "@/components/balance/all-employees-balance"

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Balance Reports</h1>
          <p className="text-muted-foreground">Overview of leave balance utilization across all employees</p>
        </div>
      </div>

      <AllEmployeesBalance />
    </div>
  )
}

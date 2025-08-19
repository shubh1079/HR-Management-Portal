import { type NextRequest, NextResponse } from "next/server"
import { LeaveService } from "@/lib/services/leaveService"
import { EmployeeService } from "@/lib/services/employeeService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employee = await EmployeeService.getEmployeeById(params.id)
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const balance = await LeaveService.getLeaveBalance(params.id)
    const leaves = await LeaveService.getEmployeeLeaves(params.id)

    return NextResponse.json({
      employee: {
        name: employee.name,
        email: employee.email,
        department: employee.department,
      },
      balance,
      leaves,
    })
  } catch (error) {
    console.error("Error fetching employee balance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

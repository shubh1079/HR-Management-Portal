import { type NextRequest, NextResponse } from "next/server"
import { EmployeeService } from "@/lib/services/employeeService"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await EmployeeService.createEmployee(data)

    if (!result.success) {
      return NextResponse.json({ errors: result.errors }, { status: 400 })
    }

    return NextResponse.json({ employee: result.employee }, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const employees = await EmployeeService.getAllEmployees()
    return NextResponse.json({ employees })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

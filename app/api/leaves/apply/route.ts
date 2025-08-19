import { type NextRequest, NextResponse } from "next/server"
import { LeaveService } from "@/lib/services/leaveService"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await LeaveService.applyLeave(data)

    if (!result.success) {
      return NextResponse.json({ errors: result.errors }, { status: 400 })
    }

    return NextResponse.json({ leave: result.leave }, { status: 201 })
  } catch (error) {
    console.error("Error applying for leave:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

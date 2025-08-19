import { type NextRequest, NextResponse } from "next/server"
import { LeaveService } from "@/lib/services/leaveService"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await LeaveService.rejectLeave(params.id)

    if (!result.success) {
      return NextResponse.json({ errors: result.errors }, { status: 400 })
    }

    return NextResponse.json({ message: "Leave rejected successfully" })
  } catch (error) {
    console.error("Error rejecting leave:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

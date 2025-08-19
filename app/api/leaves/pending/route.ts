import { NextResponse } from "next/server"
import { LeaveService } from "@/lib/services/leaveService"

export async function GET() {
  try {
    const pendingLeaves = await LeaveService.getPendingLeaves()
    return NextResponse.json({ leaves: pendingLeaves })
  } catch (error) {
    console.error("Error fetching pending leaves:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import clientPromise from "../mongodb"
import {
  type Leave,
  type CreateLeaveData,
  validateLeave,
  calculateLeaveDays,
  type LeaveWithEmployee,
} from "../models/Leave"
import { EmployeeService } from "./employeeService"
import { ObjectId } from "mongodb"

export class LeaveService {
  private static async getCollection() {
    const client = await clientPromise
    return client.db("leave_management").collection<Leave>("leaves")
  }

  static async applyLeave(data: CreateLeaveData): Promise<{ success: boolean; leave?: Leave; errors?: string[] }> {
    // Get employee details for validation
    const employee = await EmployeeService.getEmployeeById(data.employeeId)
    if (!employee) {
      return { success: false, errors: ["Employee not found"] }
    }

    const errors = validateLeave(data, employee.joiningDate)
    if (errors.length > 0) {
      return { success: false, errors }
    }

    const collection = await this.getCollection()
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const days = calculateLeaveDays(startDate, endDate)

    // Check for overlapping leaves
    const overlappingLeave = await collection.findOne({
      employeeId: new ObjectId(data.employeeId),
      status: { $in: ["PENDING", "APPROVED"] },
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    })

    if (overlappingLeave) {
      return { success: false, errors: ["You have overlapping leave requests"] }
    }

    // Check leave balance
    const balance = await this.getLeaveBalance(data.employeeId)
    if (balance.remaining < days) {
      return {
        success: false,
        errors: [`Insufficient leave balance. Available: ${balance.remaining} days, Requested: ${days} days`],
      }
    }

    const leave: Leave = {
      employeeId: new ObjectId(data.employeeId),
      startDate,
      endDate,
      reason: data.reason,
      status: "PENDING",
      appliedAt: new Date(),
      days,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(leave)
    const createdLeave = await collection.findOne({ _id: result.insertedId })

    return { success: true, leave: createdLeave! }
  }

  static async getPendingLeaves(): Promise<LeaveWithEmployee[]> {
    const client = await clientPromise
    const db = client.db("leave_management")

    const leaves = await db
      .collection("leaves")
      .aggregate([
        { $match: { status: "PENDING" } },
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        {
          $project: {
            _id: 1,
            employeeId: 1,
            startDate: 1,
            endDate: 1,
            reason: 1,
            status: 1,
            appliedAt: 1,
            days: 1,
            "employee.name": 1,
            "employee.email": 1,
            "employee.department": 1,
          },
        },
        { $sort: { appliedAt: -1 } },
      ])
      .toArray()

    return leaves as LeaveWithEmployee[]
  }

  static async approveLeave(leaveId: string, reviewerId?: string): Promise<{ success: boolean; errors?: string[] }> {
    const collection = await this.getCollection()
    const leave = await collection.findOne({ _id: new ObjectId(leaveId) })

    if (!leave) {
      return { success: false, errors: ["Leave request not found"] }
    }

    if (leave.status !== "PENDING") {
      return { success: false, errors: ["Only pending leaves can be approved"] }
    }

    // Re-check balance and overlaps to avoid race conditions
    const balance = await this.getLeaveBalance(leave.employeeId.toString())
    if (balance.remaining < leave.days) {
      return { success: false, errors: ["Insufficient leave balance"] }
    }

    const updateData: any = {
      status: "APPROVED",
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }

    if (reviewerId) {
      updateData.reviewedBy = new ObjectId(reviewerId)
    }

    await collection.updateOne({ _id: new ObjectId(leaveId) }, { $set: updateData })

    return { success: true }
  }

  static async rejectLeave(leaveId: string, reviewerId?: string): Promise<{ success: boolean; errors?: string[] }> {
    const collection = await this.getCollection()
    const leave = await collection.findOne({ _id: new ObjectId(leaveId) })

    if (!leave) {
      return { success: false, errors: ["Leave request not found"] }
    }

    if (leave.status !== "PENDING") {
      return { success: false, errors: ["Only pending leaves can be rejected"] }
    }

    const updateData: any = {
      status: "REJECTED",
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }

    if (reviewerId) {
      updateData.reviewedBy = new ObjectId(reviewerId)
    }

    await collection.updateOne({ _id: new ObjectId(leaveId) }, { $set: updateData })

    return { success: true }
  }

  static async getLeaveBalance(employeeId: string): Promise<{ allowance: number; used: number; remaining: number }> {
    const employee = await EmployeeService.getEmployeeById(employeeId)
    if (!employee) {
      return { allowance: 0, used: 0, remaining: 0 }
    }

    const collection = await this.getCollection()
    const approvedLeaves = await collection
      .find({
        employeeId: new ObjectId(employeeId),
        status: "APPROVED",
      })
      .toArray()

    const usedDays = approvedLeaves.reduce((total, leave) => total + leave.days, 0)
    const remaining = employee.annualLeaveAllowance - usedDays

    return {
      allowance: employee.annualLeaveAllowance,
      used: usedDays,
      remaining: Math.max(0, remaining),
    }
  }

  static async getEmployeeLeaves(employeeId: string): Promise<Leave[]> {
    const collection = await this.getCollection()
    return await collection
      .find({ employeeId: new ObjectId(employeeId) })
      .sort({ appliedAt: -1 })
      .toArray()
  }
}

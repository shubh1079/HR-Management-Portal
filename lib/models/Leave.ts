import type { ObjectId } from "mongodb"

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface Leave {
  _id?: ObjectId
  employeeId: ObjectId
  startDate: Date
  endDate: Date
  reason?: string
  status: LeaveStatus
  appliedAt: Date
  reviewedAt?: Date
  reviewedBy?: ObjectId
  days: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateLeaveData {
  employeeId: string
  startDate: Date
  endDate: Date
  reason?: string
}

export interface LeaveWithEmployee extends Leave {
  employee: {
    name: string
    email: string
    department: string
  }
}

export const calculateLeaveDays = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}

export const validateLeave = (data: CreateLeaveData, joiningDate: Date): string[] => {
  const errors: string[] = []

  if (!data.employeeId) {
    errors.push("Employee ID is required")
  }

  if (!data.startDate) {
    errors.push("Start date is required")
  }

  if (!data.endDate) {
    errors.push("End date is required")
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)

    if (start > end) {
      errors.push("End date must be after start date")
    }

    if (start < new Date(joiningDate)) {
      errors.push("Leave start date cannot be before joining date")
    }

    const days = calculateLeaveDays(start, end)
    if (days < 1) {
      errors.push("Leave must be at least 1 day")
    }
  }

  return errors
}

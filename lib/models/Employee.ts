import type { ObjectId } from "mongodb"

export interface Employee {
  _id?: ObjectId
  name: string
  email: string
  department: string
  joiningDate: Date
  annualLeaveAllowance: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateEmployeeData {
  name: string
  email: string
  department: string
  joiningDate: Date
  annualLeaveAllowance?: number
}

export const validateEmployee = (data: CreateEmployeeData): string[] => {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Valid email is required")
  }

  if (!data.department || data.department.trim().length < 2) {
    errors.push("Department is required")
  }

  if (!data.joiningDate) {
    errors.push("Joining date is required")
  } else if (new Date(data.joiningDate) > new Date()) {
    errors.push("Joining date cannot be in the future")
  }

  return errors
}

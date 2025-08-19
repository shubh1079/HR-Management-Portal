import clientPromise from "../mongodb"
import { type Employee, type CreateEmployeeData, validateEmployee } from "../models/Employee"
import { ObjectId } from "mongodb"

export class EmployeeService {
  private static async getCollection() {
    const client = await clientPromise
    return client.db("leave_management").collection<Employee>("employees")
  }

  static async createEmployee(
    data: CreateEmployeeData,
  ): Promise<{ success: boolean; employee?: Employee; errors?: string[] }> {
    const errors = validateEmployee(data)
    if (errors.length > 0) {
      return { success: false, errors }
    }

    const collection = await this.getCollection()

    // Check if email already exists
    const existingEmployee = await collection.findOne({ email: data.email })
    if (existingEmployee) {
      return { success: false, errors: ["Email already exists"] }
    }

    const employee: Employee = {
      ...data,
      annualLeaveAllowance: data.annualLeaveAllowance || 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(employee)
    const createdEmployee = await collection.findOne({ _id: result.insertedId })

    return { success: true, employee: createdEmployee! }
  }

  static async getAllEmployees(): Promise<Employee[]> {
    const collection = await this.getCollection()
    return await collection.find({}).sort({ createdAt: -1 }).toArray()
  }

  static async getEmployeeById(id: string): Promise<Employee | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }
}

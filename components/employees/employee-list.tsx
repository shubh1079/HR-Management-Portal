"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Mail, Building, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import type { Employee } from "@/lib/models/Employee"

interface EmployeeListProps {
  refreshTrigger?: number
}

export function EmployeeList({ refreshTrigger }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/employees")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch employees")
      }

      setEmployees(data.employees)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employees")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [refreshTrigger])

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          All Employees ({employees.length})
        </CardTitle>
        <CardDescription>Manage and view all employees in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No employees found</p>
            <p className="text-sm text-muted-foreground">Add your first employee to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => (
              <div
                key={employee._id?.toString()}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{employee.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {employee.annualLeaveAllowance} days/year
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {employee.department}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(employee.joiningDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/employees/${employee._id}/balance`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Balance
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

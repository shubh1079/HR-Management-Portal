"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, TrendingUp, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Employee } from "@/lib/models/Employee"

interface EmployeeWithBalance extends Employee {
  balance: {
    allowance: number
    used: number
    remaining: number
    utilizationPercentage: number
  }
}

export function AllEmployeesBalance() {
  const [employees, setEmployees] = useState<EmployeeWithBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllEmployeesBalance()
  }, [])

  const fetchAllEmployeesBalance = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First get all employees
      const employeesResponse = await fetch("/api/employees")
      const employeesData = await employeesResponse.json()

      if (!employeesResponse.ok) {
        throw new Error(employeesData.error || "Failed to fetch employees")
      }

      // Then get balance for each employee
      const employeesWithBalance = await Promise.all(
        employeesData.employees.map(async (employee: Employee) => {
          try {
            const balanceResponse = await fetch(`/api/employees/${employee._id}/balance`)
            const balanceData = await balanceResponse.json()

            if (balanceResponse.ok) {
              const utilizationPercentage = (balanceData.balance.used / balanceData.balance.allowance) * 100
              return {
                ...employee,
                balance: {
                  ...balanceData.balance,
                  utilizationPercentage,
                },
              }
            } else {
              // If balance fetch fails, return employee with default balance
              return {
                ...employee,
                balance: {
                  allowance: employee.annualLeaveAllowance,
                  used: 0,
                  remaining: employee.annualLeaveAllowance,
                  utilizationPercentage: 0,
                },
              }
            }
          } catch (error) {
            // If individual balance fetch fails, return employee with default balance
            return {
              ...employee,
              balance: {
                allowance: employee.annualLeaveAllowance,
                used: 0,
                remaining: employee.annualLeaveAllowance,
                utilizationPercentage: 0,
              },
            }
          }
        }),
      )

      setEmployees(employeesWithBalance)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employee balances")
    } finally {
      setIsLoading(false)
    }
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive"
    if (percentage >= 70) return "text-orange-500"
    return "text-primary"
  }

  const getUtilizationBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: "destructive" as const, label: "High Usage" }
    if (percentage >= 70) return { variant: "secondary" as const, label: "Moderate Usage" }
    return { variant: "default" as const, label: "Low Usage" }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate summary statistics
  const totalEmployees = employees.length
  const totalAllowance = employees.reduce((sum, emp) => sum + emp.balance.allowance, 0)
  const totalUsed = employees.reduce((sum, emp) => sum + emp.balance.used, 0)
  const totalRemaining = employees.reduce((sum, emp) => sum + emp.balance.remaining, 0)
  const averageUtilization = totalEmployees > 0 ? (totalUsed / totalAllowance) * 100 : 0

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading employee balances...</p>
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
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Employees</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Used Days</span>
            </div>
            <p className="text-3xl font-bold text-primary">{totalUsed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Total Remaining</span>
            </div>
            <p className="text-3xl font-bold text-accent">{totalRemaining}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Avg. Utilization</span>
            </div>
            <p className={`text-3xl font-bold ${getUtilizationColor(averageUtilization)}`}>
              {Math.round(averageUtilization)}%
            </p>
            <Progress value={averageUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Employee Balance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Leave Balances ({employees.length})
          </CardTitle>
          <CardDescription>Overview of leave balance utilization for all employees</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No employees found</p>
              <p className="text-sm text-muted-foreground">Add employees to view their leave balances</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => {
                const utilizationBadge = getUtilizationBadge(employee.balance.utilizationPercentage)
                return (
                  <div
                    key={employee._id?.toString()}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {employee.department} • Joined {formatDate(employee.joiningDate)}
                          </p>
                        </div>
                        <Badge variant={utilizationBadge.variant}>{utilizationBadge.label}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Allowance:</span>
                          <p className="font-medium">{employee.balance.allowance} days</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Used:</span>
                          <p className="font-medium text-primary">{employee.balance.used} days</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Remaining:</span>
                          <p className="font-medium text-accent">{employee.balance.remaining} days</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Utilization:</span>
                          <p className={`font-medium ${getUtilizationColor(employee.balance.utilizationPercentage)}`}>
                            {Math.round(employee.balance.utilizationPercentage)}%
                          </p>
                        </div>
                      </div>

                      <Progress value={employee.balance.utilizationPercentage} className="h-2" />
                    </div>

                    <div className="ml-4">
                      <Link href={`/employees/${employee._id}/balance`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

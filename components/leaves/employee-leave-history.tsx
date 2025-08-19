"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { History, Calendar, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { Leave } from "@/lib/models/Leave"
import type { Employee } from "@/lib/models/Employee"

interface EmployeeLeaveHistoryProps {
  refreshTrigger?: number
}

export function EmployeeLeaveHistory({ refreshTrigger }: EmployeeLeaveHistoryProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [balance, setBalance] = useState<{ allowance: number; used: number; remaining: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeLeaves()
    }
  }, [selectedEmployeeId, refreshTrigger])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      if (response.ok) {
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const fetchEmployeeLeaves = async () => {
    if (!selectedEmployeeId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/employees/${selectedEmployeeId}/balance`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch employee data")
      }

      setLeaves(data.leaves)
      setBalance(data.balance)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employee data")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "APPROVED":
        return "default"
      case "REJECTED":
        return "destructive"
      case "PENDING":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Leave History & Balance
        </CardTitle>
        <CardDescription>View leave history and current balance for any employee</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Employee</label>
          {isLoadingEmployees ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading employees...
            </div>
          ) : (
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee to view history" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee._id?.toString()} value={employee._id?.toString() || ""}>
                    {employee.name} - {employee.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {balance && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3">Leave Balance</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{balance.allowance}</p>
                <p className="text-sm text-muted-foreground">Total Allowance</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{balance.used}</p>
                <p className="text-sm text-muted-foreground">Used Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{balance.remaining}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && selectedEmployeeId && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading leave history...</p>
            </div>
          </div>
        )}

        {!isLoading && selectedEmployeeId && leaves.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leave applications found</p>
            <p className="text-sm text-muted-foreground">This employee hasn't applied for any leave yet</p>
          </div>
        )}

        {!isLoading && leaves.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Leave Applications ({leaves.length})</h4>
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div
                  key={leave._id?.toString()}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(leave.status)}
                        <span className="font-medium text-foreground">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </span>
                      </div>
                      <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
                      <Badge variant="outline">
                        {leave.days} day{leave.days !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {leave.reason && <p className="text-sm text-muted-foreground">Reason: {leave.reason}</p>}
                    <p className="text-xs text-muted-foreground">
                      Applied on {formatDate(leave.appliedAt)}
                      {leave.reviewedAt && ` • Reviewed on ${formatDate(leave.reviewedAt)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

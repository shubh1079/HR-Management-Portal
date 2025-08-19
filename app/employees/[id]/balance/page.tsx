"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Leave } from "@/lib/models/Leave"

interface EmployeeBalanceData {
  employee: {
    name: string
    email: string
    department: string
  }
  balance: {
    allowance: number
    used: number
    remaining: number
  }
  leaves: Leave[]
}

export default function EmployeeBalancePage() {
  const params = useParams()
  const employeeId = params.id as string

  const [data, setData] = useState<EmployeeBalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeBalance()
    }
  }, [employeeId])

  const fetchEmployeeBalance = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/employees/${employeeId}/balance`)
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to fetch employee balance")
      }

      setData(responseData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employee balance")
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

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive"
    if (percentage >= 70) return "text-orange-500"
    return "text-primary"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading employee balance...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/employees">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Employee not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const utilizationPercentage = (data.balance.used / data.balance.allowance) * 100
  const approvedLeaves = data.leaves.filter((leave) => leave.status === "APPROVED")
  const pendingLeaves = data.leaves.filter((leave) => leave.status === "PENDING")
  const rejectedLeaves = data.leaves.filter((leave) => leave.status === "REJECTED")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Leave Balance</h1>
          <p className="text-muted-foreground">Detailed leave balance and history</p>
        </div>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-semibold text-foreground">{data.employee.name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p className="font-semibold text-foreground">{data.employee.email}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Department</span>
              <p className="font-semibold text-foreground">{data.employee.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Allowance</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{data.balance.allowance}</p>
            <p className="text-sm text-muted-foreground">days per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Used Days</span>
            </div>
            <p className="text-3xl font-bold text-primary">{data.balance.used}</p>
            <p className="text-sm text-muted-foreground">approved leaves</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Remaining</span>
            </div>
            <p className="text-3xl font-bold text-accent">{data.balance.remaining}</p>
            <p className="text-sm text-muted-foreground">days available</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Utilization</span>
            </div>
            <p className={`text-3xl font-bold ${getUtilizationColor(utilizationPercentage)}`}>
              {Math.round(utilizationPercentage)}%
            </p>
            <Progress value={utilizationPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Leave Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approved Leaves</CardTitle>
            <CardDescription>Successfully approved applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{approvedLeaves.length}</p>
              <p className="text-sm text-muted-foreground">applications</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Leaves</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{pendingLeaves.length}</p>
              <p className="text-sm text-muted-foreground">applications</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejected Leaves</CardTitle>
            <CardDescription>Declined applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{rejectedLeaves.length}</p>
              <p className="text-sm text-muted-foreground">applications</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Complete history of all leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          {data.leaves.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leave applications found</p>
              <p className="text-sm text-muted-foreground">This employee hasn't applied for any leave yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.leaves.map((leave) => (
                <div
                  key={leave._id?.toString()}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

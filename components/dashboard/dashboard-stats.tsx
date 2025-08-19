"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Calendar, Clock, CheckCircle, TrendingUp, Loader2 } from "lucide-react"

interface DashboardStats {
  totalEmployees: number
  pendingLeaves: number
  approvedLeavesToday: number
  totalLeaveDays: number
  averageUtilization: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch employees
      const employeesResponse = await fetch("/api/employees")
      const employeesData = await employeesResponse.json()

      // Fetch pending leaves
      const pendingResponse = await fetch("/api/leaves/pending")
      const pendingData = await pendingResponse.json()

      if (!employeesResponse.ok || !pendingResponse.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      // Calculate stats from available data
      const totalEmployees = employeesData.employees?.length || 0
      const pendingLeaves = pendingData.leaves?.length || 0

      // For demo purposes, we'll calculate some basic stats
      // In a real app, you'd have dedicated endpoints for these metrics
      let totalLeaveDays = 0
      let totalUtilization = 0

      if (totalEmployees > 0) {
        // Fetch balance for a few employees to estimate totals
        const sampleSize = Math.min(5, totalEmployees)
        const sampleEmployees = employeesData.employees.slice(0, sampleSize)

        let sampleUsedDays = 0
        let sampleAllowance = 0

        for (const employee of sampleEmployees) {
          try {
            const balanceResponse = await fetch(`/api/employees/${employee._id}/balance`)
            const balanceData = await balanceResponse.json()
            if (balanceResponse.ok) {
              sampleUsedDays += balanceData.balance.used
              sampleAllowance += balanceData.balance.allowance
            }
          } catch (error) {
            // Skip failed requests
          }
        }

        // Estimate totals based on sample
        if (sampleSize > 0) {
          totalLeaveDays = Math.round((sampleUsedDays / sampleSize) * totalEmployees)
          totalUtilization = sampleAllowance > 0 ? (sampleUsedDays / sampleAllowance) * 100 : 0
        }
      }

      setStats({
        totalEmployees,
        pendingLeaves,
        approvedLeavesToday: 0, // Would need a dedicated endpoint
        totalLeaveDays,
        averageUtilization: totalUtilization,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard stats")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats) return null

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return "text-destructive"
    if (percentage >= 60) return "text-orange-500"
    return "text-primary"
  }

  const getUtilizationBadge = (percentage: number) => {
    if (percentage >= 80) return { variant: "destructive" as const, label: "High" }
    if (percentage >= 60) return { variant: "secondary" as const, label: "Moderate" }
    return { variant: "default" as const, label: "Healthy" }
  }

  const utilizationBadge = getUtilizationBadge(stats.averageUtilization)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total Employees</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalEmployees}</p>
          <p className="text-sm text-muted-foreground">registered in system</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">Pending Requests</span>
          </div>
          <p className="text-3xl font-bold text-orange-500">{stats.pendingLeaves}</p>
          <p className="text-sm text-muted-foreground">awaiting approval</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Approved Today</span>
          </div>
          <p className="text-3xl font-bold text-primary">{stats.approvedLeavesToday}</p>
          <p className="text-sm text-muted-foreground">processed requests</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Total Leave Days</span>
          </div>
          <p className="text-3xl font-bold text-accent">{stats.totalLeaveDays}</p>
          <p className="text-sm text-muted-foreground">used this year</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Avg. Utilization</span>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${getUtilizationColor(stats.averageUtilization)}`}>
              {Math.round(stats.averageUtilization)}%
            </p>
            <Badge variant={utilizationBadge.variant} className="text-xs">
              {utilizationBadge.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">leave usage rate</p>
        </CardContent>
      </Card>
    </div>
  )
}

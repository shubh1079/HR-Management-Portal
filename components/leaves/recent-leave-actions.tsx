"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, History, User, Calendar, Loader2 } from "lucide-react"
import type { LeaveWithEmployee } from "@/lib/models/Leave"

interface RecentLeaveActionsProps {
  refreshTrigger?: number
}

export function RecentLeaveActions({ refreshTrigger }: RecentLeaveActionsProps) {
  const [recentLeaves, setRecentLeaves] = useState<LeaveWithEmployee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentActions()
  }, [refreshTrigger])

  const fetchRecentActions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // For now, we'll fetch all leaves and filter for recent approved/rejected ones
      // In a real app, you'd have a dedicated endpoint for this
      const response = await fetch("/api/leaves/pending")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recent actions")
      }

      // This is a placeholder - in reality you'd fetch recent approved/rejected leaves
      // For demo purposes, we'll show an empty state or mock some data
      setRecentLeaves([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recent actions")
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

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string): "default" | "destructive" => {
    return status === "APPROVED" ? "default" : "destructive"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading recent actions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Actions
        </CardTitle>
        <CardDescription>Recently approved or rejected leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recentLeaves.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent actions</p>
            <p className="text-sm text-muted-foreground">Approved or rejected leave requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLeaves.map((leave) => (
              <div
                key={leave._id?.toString()}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(leave.status)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{leave.employee.name}</span>
                      <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </div>
                      <span>({leave.days} days)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {leave.reviewedAt ? formatDateTime(leave.reviewedAt) : "Just now"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

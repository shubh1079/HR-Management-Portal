"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, User, Calendar, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { LeaveWithEmployee } from "@/lib/models/Leave"

export function RecentActivity() {
  const [activities, setActivities] = useState<LeaveWithEmployee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch pending leaves as recent activity
      const response = await fetch("/api/leaves/pending")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recent activity")
      }

      // Show only the most recent 5 activities
      setActivities(data.leaves.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recent activity")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest leave applications and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest leave applications and updates</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground">Leave applications will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity._id?.toString()}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <div className="mt-0.5">{getActivityIcon(activity.status)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{activity.employee.name}</span>
                    <Badge variant={getStatusVariant(activity.status)} className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applied for {activity.days} day{activity.days !== 1 ? "s" : ""} leave
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{activity.employee.department}</span>
                    <span>{formatDate(activity.appliedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

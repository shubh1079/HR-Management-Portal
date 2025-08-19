"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Clock, CheckCircle, XCircle, User, Building, Calendar, Loader2 } from "lucide-react"
import type { LeaveWithEmployee } from "@/lib/models/Leave"

interface PendingLeaveRequestsProps {
  refreshTrigger?: number
  onUpdate?: () => void
}

export function PendingLeaveRequests({ refreshTrigger, onUpdate }: PendingLeaveRequestsProps) {
  const [pendingLeaves, setPendingLeaves] = useState<LeaveWithEmployee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingLeaves()
  }, [refreshTrigger])

  const fetchPendingLeaves = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/leaves/pending")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch pending leaves")
      }

      setPendingLeaves(data.leaves)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pending leaves")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (leaveId: string, employeeName: string) => {
    try {
      setProcessingId(leaveId)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/leaves/${leaveId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.errors?.[0] || "Failed to approve leave")
      }

      setSuccess(`Leave request for ${employeeName} has been approved successfully`)
      await fetchPendingLeaves()
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve leave")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (leaveId: string, employeeName: string) => {
    try {
      setProcessingId(leaveId)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/leaves/${leaveId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.errors?.[0] || "Failed to reject leave")
      }

      setSuccess(`Leave request for ${employeeName} has been rejected`)
      await fetchPendingLeaves()
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject leave")
    } finally {
      setProcessingId(null)
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading pending requests...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Leave Requests ({pendingLeaves.length})
        </CardTitle>
        <CardDescription>Review and approve or reject employee leave applications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-primary bg-primary/5">
            <AlertDescription className="text-primary">{success}</AlertDescription>
          </Alert>
        )}

        {pendingLeaves.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending leave requests</p>
            <p className="text-sm text-muted-foreground">All leave applications have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLeaves.map((leave) => (
              <div
                key={leave._id?.toString()}
                className="border border-border rounded-lg p-6 space-y-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{leave.employee.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{leave.employee.department}</span>
                      </div>
                      <Badge variant="secondary">PENDING</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Leave Period</span>
                        </div>
                        <p className="text-sm text-foreground">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        <Badge variant="outline">
                          {leave.days} day{leave.days !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Applied On</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDateTime(leave.appliedAt)}</p>
                      </div>
                    </div>

                    {leave.reason && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Reason:</span>
                        <p className="text-sm text-muted-foreground bg-muted/50 rounded p-3">{leave.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={processingId === leave._id?.toString()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {processingId === leave._id?.toString() ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve the leave request for <strong>{leave.employee.name}</strong>{" "}
                          from {formatDate(leave.startDate)} to {formatDate(leave.endDate)} ({leave.days} days)?
                          <br />
                          <br />
                          This will deduct {leave.days} day{leave.days !== 1 ? "s" : ""} from their leave balance.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleApprove(leave._id?.toString() || "", leave.employee.name)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Approve Leave
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={processingId === leave._id?.toString()}>
                        {processingId === leave._id?.toString() ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject the leave request for <strong>{leave.employee.name}</strong>{" "}
                          from {formatDate(leave.startDate)} to {formatDate(leave.endDate)}?
                          <br />
                          <br />
                          This action cannot be undone, but the employee can submit a new request if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleReject(leave._id?.toString() || "", leave.employee.name)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Reject Leave
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                    <span>Employee:</span>
                    <span className="font-medium">{leave.employee.email}</span>
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

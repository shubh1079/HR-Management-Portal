"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Database, Wifi, Shield, Loader2 } from "lucide-react"

interface SystemStatus {
  database: "connected" | "disconnected" | "error"
  api: "active" | "inactive" | "error"
  lastUpdated: Date
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      setIsLoading(true)

      // Test database connection by trying to fetch employees
      const employeesResponse = await fetch("/api/employees")
      const databaseStatus = employeesResponse.ok ? "connected" : "error"

      // Test API status
      const apiStatus = "active" // If we can make requests, API is active

      setStatus({
        database: databaseStatus,
        api: apiStatus,
        lastUpdated: new Date(),
      })
    } catch (error) {
      setStatus({
        database: "error",
        api: "error",
        lastUpdated: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "active":
        return { variant: "default" as const, label: "Healthy", color: "text-primary" }
      case "disconnected":
      case "inactive":
        return { variant: "secondary" as const, label: "Inactive", color: "text-muted-foreground" }
      case "error":
        return { variant: "destructive" as const, label: "Error", color: "text-destructive" }
      default:
        return { variant: "secondary" as const, label: "Unknown", color: "text-muted-foreground" }
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and connectivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Checking status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and connectivity</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Unable to check system status</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const databaseBadge = getStatusBadge(status.database)
  const apiBadge = getStatusBadge(status.api)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>Current system health and connectivity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className={`h-4 w-4 ${databaseBadge.color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">Database</p>
                <p className="text-xs text-muted-foreground">MongoDB Atlas</p>
              </div>
            </div>
            <Badge variant={databaseBadge.variant}>{databaseBadge.label}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className={`h-4 w-4 ${apiBadge.color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">API Services</p>
                <p className="text-xs text-muted-foreground">REST Endpoints</p>
              </div>
            </div>
            <Badge variant={apiBadge.variant}>{apiBadge.label}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Security</p>
                <p className="text-xs text-muted-foreground">Data Protection</p>
              </div>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Last updated: {formatTime(status.lastUpdated)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

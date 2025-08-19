"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Calendar, Clock, BarChart3, Users, FileText } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Add Employee",
      description: "Register a new employee in the system",
      icon: UserPlus,
      href: "/employees",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Apply for Leave",
      description: "Submit a new leave application",
      icon: Calendar,
      href: "/leaves/apply",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Review Requests",
      description: "Approve or reject pending leave requests",
      icon: Clock,
      href: "/leaves/pending",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "View Reports",
      description: "Check leave balance reports and analytics",
      icon: BarChart3,
      href: "/reports",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Manage Employees",
      description: "View and manage all employees",
      icon: Users,
      href: "/employees",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "System Overview",
      description: "View system status and configuration",
      icon: FileText,
      href: "/",
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and frequently used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="group p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

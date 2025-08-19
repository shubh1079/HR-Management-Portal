"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus } from "lucide-react"

interface AddEmployeeFormProps {
  onSuccess?: () => void
}

export function AddEmployeeForm({ onSuccess }: AddEmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    joiningDate: "",
    annualLeaveAllowance: "20",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])
    setSuccess(false)

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          joiningDate: new Date(formData.joiningDate),
          annualLeaveAllowance: Number.parseInt(formData.annualLeaveAllowance),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors(data.errors || ["Failed to create employee"])
        return
      }

      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        department: "",
        joiningDate: "",
        annualLeaveAllowance: "20",
      })
      onSuccess?.()
    } catch (error) {
      setErrors(["Network error. Please try again."])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Employee
        </CardTitle>
        <CardDescription>Enter employee details to add them to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-primary bg-primary/5">
              <AlertDescription className="text-primary">Employee added successfully!</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Engineering"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input
                id="joiningDate"
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualLeaveAllowance">Annual Leave Allowance (Days)</Label>
              <Input
                id="annualLeaveAllowance"
                name="annualLeaveAllowance"
                type="number"
                min="1"
                max="365"
                value={formData.annualLeaveAllowance}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Employee...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

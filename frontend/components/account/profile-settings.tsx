"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import { User, Lock, Save } from "lucide-react"

export function ProfileSettings() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    // Mock API call - replace with actual API
    updateUser({ ...user!, ...profileData })

    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    // Mock API call - replace with actual API
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters long</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit">
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and membership information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Account Type</span>
              <span className="text-sm text-muted-foreground capitalize">
                {user?.role?.toLowerCase() || "Customer"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm text-muted-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Account Status</span>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

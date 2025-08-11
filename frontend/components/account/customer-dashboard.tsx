"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderHistory } from "./order-history"
import { ProfileSettings } from "./profile-settings"
import { AddressBook } from "./address-book"
import { AccountOverview } from "./account-overview"
import { User, Package, MapPin, Settings } from "lucide-react"

export function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and view your order history</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AccountOverview />
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="addresses">
            <AddressBook />
          </TabsContent>

          <TabsContent value="settings">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

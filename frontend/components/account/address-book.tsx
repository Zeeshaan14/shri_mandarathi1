"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Plus, Edit, Trash2, Phone, User } from "lucide-react"

interface Address {
  id: string
  label?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    // Mock data - replace with actual API call
    setAddresses([
      {
        id: "1",
        label: "Home",
        fullName: "John Doe",
        phone: "+91 9876543210",
        line1: "123 Main Street",
        line2: "Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
        isDefault: true,
      },
      {
        id: "2",
        label: "Office",
        fullName: "John Doe",
        phone: "+91 9876543210",
        line1: "456 Business Park",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400002",
        country: "India",
        isDefault: false,
      },
    ])
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAddress) {
      // Update existing address
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? { ...formData, id: editingAddress.id }
            : formData.isDefault
              ? { ...addr, isDefault: false }
              : addr,
        ),
      )
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      })
      setEditingAddress(null)
    } else {
      // Add new address
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
      }

      setAddresses((prev) => {
        if (formData.isDefault) {
          return [...prev.map((addr) => ({ ...addr, isDefault: false })), newAddress]
        }
        return [...prev, newAddress]
      })

      toast({
        title: "Address added",
        description: "Your new address has been saved successfully.",
      })
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData(address)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (addressId: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId))
    toast({
      title: "Address deleted",
      description: "The address has been removed from your address book.",
    })
  }

  const handleSetDefault = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    )
    toast({
      title: "Default address updated",
      description: "Your default address has been changed.",
    })
  }

  const resetForm = () => {
    setFormData({
      label: "",
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    })
    setEditingAddress(null)
  }

  const handleDialogClose = () => {
    setIsAddDialogOpen(false)
    resetForm()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Address Book</CardTitle>
            <CardDescription>Manage your saved delivery addresses</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAddress(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                <DialogDescription>
                  {editingAddress ? "Update your address details" : "Add a new delivery address to your account"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="label">Address Label (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Home, Office"
                    value={formData.label}
                    onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="line1">Address Line 1 *</Label>
                  <Input
                    id="line1"
                    required
                    placeholder="Street address"
                    value={formData.line1}
                    onChange={(e) => setFormData((prev) => ({ ...prev, line1: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="line2">Address Line 2</Label>
                  <Input
                    id="line2"
                    placeholder="Apartment, suite, etc."
                    value={formData.line2}
                    onChange={(e) => setFormData((prev) => ({ ...prev, line2: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isDefault: checked }))}
                  />
                  <Label htmlFor="isDefault">Set as default address</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingAddress ? "Update Address" : "Save Address"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                <p className="text-gray-500 mb-4">Add your first delivery address to get started.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            ) : (
              addresses.map((address) => (
                <Card key={address.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {address.label && <Badge variant="secondary">{address.label}</Badge>}
                        {address.isDefault && <Badge className="bg-amber-100 text-amber-800">Default</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(address)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address.id)}
                          disabled={address.isDefault}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{address.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{address.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <p>{address.line1}</p>
                          {address.line2 && <p>{address.line2}</p>}
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                    </div>

                    {!address.isDefault && (
                      <div className="mt-4 pt-3 border-t">
                        <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>
                          Set as Default
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

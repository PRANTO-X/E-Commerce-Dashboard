import { useState } from "react"
import { Save, Bell, Store, ShieldCheck, Cog } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

import { SettingToggle } from "@/components/common/SettingToggle"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { updateSettings, resetSettings } from "@/features/system/slices/settingsSlice"
import { defaultStoreSettings } from "@/assets/Data"

interface SettingTab {
  value: string
  label: string
  icon: LucideIcon
  component: React.ReactNode
}

const Settings = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(settings)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      dispatch(updateSettings(form))
      setIsSaving(false)
      toast.success("Settings saved successfully!")
    }, 400)
  }

  const generalFields: Array<{
    id: keyof Omit<typeof settings, "notifications" | "maintenanceMode">
    label: string
    type: "input" | "textarea"
    fullWidth?: boolean
  }> = [
    { id: "storeName", label: "Store Name", type: "input" },
    { id: "supportEmail", label: "Support Email", type: "input" },
    { id: "storeAddress", label: "Store Address", type: "textarea", fullWidth: true },
    { id: "storePhone", label: "Phone Number", type: "input" },
    { id: "vatId", label: "VAT/Tax ID", type: "input" },
  ]

  const GeneralSettings = (
    <Card>
      <CardHeader>
        <CardTitle>Store Information</CardTitle>
        <CardDescription>
          This information will be displayed on your store and invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generalFields.map((field) => (
            <div
              key={field.id}
              className={`space-y-2 ${field.fullWidth ? "md:col-span-2" : ""}`}
            >
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.label}
                  value={form[field.id]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.id]: e.target.value }))}
                />
              ) : (
                <Input
                  id={field.id}
                  value={form[field.id]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t p-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {!isSaving && <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )

  const notificationItems = [
    { key: "orderUpdates", label: "Order Updates", desc: "Receive email when a new order is placed." },
    { key: "inventoryAlerts", label: "Inventory Alerts", desc: "Receive email when products are low on stock." },
    { key: "customerReviews", label: "Customer Reviews", desc: "Receive email when a customer leaves a review." },
  ] as const

  const NotificationsSettings = (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>
          Choose what notifications you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationItems.map((item, index) => (
          <div key={item.key}>
            <SettingToggle
              label={item.label}
              description={item.desc}
              checked={form.notifications[item.key]}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, [item.key]: checked },
                }))
              }
            />
            {index < notificationItems.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end border-t p-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {!isSaving && <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )

  const SecuritySettings = (
    <Card>
      <CardHeader>
        <CardTitle>Security Preferences</CardTitle>
        <CardDescription>
          Manage your account security and authentication settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input id="current-password" type="password" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account.
            </p>
          </div>
          <Button variant="outline" onClick={() => toast.info("Configure 2FA methods from Authentication Settings.")}>
            Enable
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t p-4">
        <Button onClick={() => toast.success("Password updated")} disabled={isSaving}>
          Update Security
        </Button>
      </CardFooter>
    </Card>
  )

  const AdvancedSettings = (
    <Card>
      <CardHeader>
        <CardTitle>System Maintenance</CardTitle>
        <CardDescription>
          Advanced settings for store maintenance and data management.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingToggle
          label="Maintenance Mode"
          description="Disable the storefront for customers while making changes."
          checked={form.maintenanceMode}
          onCheckedChange={(checked) => setForm((prev) => ({ ...prev, maintenanceMode: checked }))}
        />
        <Separator />
        <div className="space-y-2">
          <Label className="text-destructive font-semibold">Danger Zone</Label>
          <div className="flex flex-col gap-4 p-4 border border-destructive/20 rounded-md bg-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear System Cache</p>
                <p className="text-sm text-muted-foreground">
                  Delete all temporary files and cached data.
                </p>
              </div>
              <Button variant="outline" onClick={() => toast.success("Cache cleared")}>Clear Cache</Button>
            </div>
            <Separator className="bg-destructive/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Factory Reset</p>
                <p className="text-sm text-muted-foreground">
                  Reset all settings to their original values. This action
                  cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!window.confirm("Reset all settings to their defaults?")) return
                  dispatch(resetSettings())
                  setForm(defaultStoreSettings)
                  toast.success("Settings reset to defaults")
                }}
              >
                Reset All
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const SETTING_TABS: SettingTab[] = [
    {
      value: "general",
      label: "General",
      icon: Store,
      component: GeneralSettings,
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: Bell,
      component: NotificationsSettings,
    },
    {
      value: "security",
      label: "Security",
      icon: ShieldCheck,
      component: SecuritySettings,
    },
    {
      value: "advanced",
      label: "Advanced",
      icon: Cog,
      component: AdvancedSettings,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store configurations and system preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4 ">
        <TabsList className="w-full md:w-fit bg-muted p-1">
          {SETTING_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 gap-2"
            >
              <tab.icon className="size-5 md:size-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SETTING_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Settings

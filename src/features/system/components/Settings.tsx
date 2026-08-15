import { useState, useMemo } from "react"
import {
  Save,
  Bell,
  Store,
  ShieldCheck,
  Cog,
  MessageCircle,
  Share2,
  Globe,
  Loader2,
} from "lucide-react"
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
import { ImageUploader, type UploadedImageItem } from "@/components/common/ImageUploader"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { updateSettings, resetSettings } from "@/features/system/slices/settingsSlice"
import { defaultStoreSettings, type StoreSettings } from "@/assets/Data"

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
  const [form, setForm] = useState<StoreSettings>(settings)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      dispatch(updateSettings(form))
      setIsSaving(false)
      toast.success("Settings saved successfully!")
    }, 400)
  }

  const logoImages: UploadedImageItem[] = useMemo(() => {
    return form.storeLogo
      ? [
          {
            id: "store-logo-preview",
            url: form.storeLogo,
            alt: form.storeName || "Store Logo",
            isPrimary: true,
          },
        ]
      : []
  }, [form.storeLogo, form.storeName])

  const GeneralSettings = (
    <div className="space-y-6">
      {/* 1. Store Identity & Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Store Identity & Brand Logo
          </CardTitle>
          <CardDescription>
            Upload your storefront logo and configure your business name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                placeholder="e.g. My Awesome Store"
                value={form.storeName}
                onChange={(e) => setForm((prev) => ({ ...prev, storeName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatId">VAT / Tax ID</Label>
              <Input
                id="vatId"
                placeholder="e.g. US123456789"
                value={form.vatId}
                onChange={(e) => setForm((prev) => ({ ...prev, vatId: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Store Brand Logo</Label>
            <ImageUploader
              singleMode
              images={logoImages}
              onImagesChange={(imgs) => {
                setForm((prev) => ({
                  ...prev,
                  storeLogo: imgs.length > 0 ? imgs[0].url : "",
                }))
              }}
              onAddImage={(url) => {
                setForm((prev) => ({ ...prev, storeLogo: url }))
              }}
              label="Upload Store Logo"
              description="Drag & drop your store logo image, browse from device, or enter a logo URL"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Contact Details & WhatsApp Number */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Contact Information & WhatsApp Support
          </CardTitle>
          <CardDescription>
            Customer support email, business phone, and direct WhatsApp communication line.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@mystore.com"
                value={form.supportEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, supportEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone">Phone Number</Label>
              <Input
                id="storePhone"
                placeholder="+1 (555) 000-0000"
                value={form.storePhone}
                onChange={(e) => setForm((prev) => ({ ...prev, storePhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Number
              </Label>
              <Input
                id="whatsappNumber"
                placeholder="+1 (555) 987-6543"
                value={form.whatsappNumber ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeAddress">Store Physical Address</Label>
            <Textarea
              id="storeAddress"
              rows={2}
              placeholder="123 Commerce St, Tech City, 54321, US"
              value={form.storeAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, storeAddress: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Social Media Platform Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Social Media Platform Links
          </CardTitle>
          <CardDescription>
            Connect your storefront header and footer with your official social media channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookLink" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Facebook Page URL
              </Label>
              <Input
                id="facebookLink"
                placeholder="https://facebook.com/yourstore"
                value={form.socialLinks?.facebook ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramLink" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-pink-600" />
                Instagram Profile URL
              </Label>
              <Input
                id="instagramLink"
                placeholder="https://instagram.com/yourstore"
                value={form.socialLinks?.instagram ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterLink" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-sky-500" />
                Twitter / X Profile URL
              </Label>
              <Input
                id="twitterLink"
                placeholder="https://x.com/yourstore"
                value={form.socialLinks?.twitter ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeLink" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-red-600" />
                YouTube Channel URL
              </Label>
              <Input
                id="youtubeLink"
                placeholder="https://youtube.com/@yourstore"
                value={form.socialLinks?.youtube ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, youtube: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinLink" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-700" />
                LinkedIn Company URL
              </Label>
              <Input
                id="linkedinLink"
                placeholder="https://linkedin.com/company/yourstore"
                value={form.socialLinks?.linkedin ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktokLink" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-foreground" />
                TikTok Profile URL
              </Label>
              <Input
                id="tiktokLink"
                placeholder="https://tiktok.com/@yourstore"
                value={form.socialLinks?.tiktok ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, tiktok: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t p-4">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? "Saving..." : "Save General Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
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
          {!isSaving && <Save className="h-4 w-4 mr-2" />}
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
    <div className="section-container space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your store branding, WhatsApp line, social links, and system preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
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

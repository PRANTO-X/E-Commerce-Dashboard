import { useState } from "react"
import { Shield, Key, Mail, Fingerprint, Save } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { SettingToggle } from "@/components/common/SettingToggle"
import { useAppData } from "@/store/AppDataProvider"

interface LoginMethodMeta {
  id: "email" | "google" | "apple"
  label: string
  description: string
  icon: LucideIcon
  disabled?: boolean
}

const Authentication = () => {
  const { authSettings, updateAuthSettings } = useAppData()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Authentication settings saved!")
    }, 400)
  }

  const loginMethods: LoginMethodMeta[] = [
    { id: "email", label: "Email & Password", description: "Traditional sign in", icon: Mail },
    { id: "google", label: "Google Social Login", description: "Allow sign in with Google accounts", icon: Fingerprint },
    { id: "apple", label: "Apple ID", description: "Coming soon", icon: Shield, disabled: true },
  ]

  const passwordPolicies = [
    { id: "special" as const, label: "Require Special Characters", description: "Require @, #, $, etc." },
    { id: "numbers" as const, label: "Require Numbers", description: "Require at least one digit" },
    { id: "uppercase" as const, label: "Require Uppercase", description: "Require at least one uppercase letter" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Authentication Settings</h1>
        <p className="text-muted-foreground">
          Configure how users and staff members authenticate to the system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOGIN METHODS */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Login Methods</CardTitle>
            </div>
            <CardDescription>
              Enable or disable different ways users can sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginMethods.map((method, index) => (
              <div key={method.id}>
                <div className={`flex items-center justify-between ${method.disabled ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <method.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label>{method.label}</Label>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={authSettings.loginMethods[method.id]}
                    disabled={method.disabled}
                    onCheckedChange={(checked) =>
                      updateAuthSettings({
                        loginMethods: { ...authSettings.loginMethods, [method.id]: checked },
                      })
                    }
                  />
                </div>
                {index < loginMethods.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PASSWORD POLICY */}
        <Card>
          <CardHeader>
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>
              Set requirements for user passwords to enhance security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-length">Minimum Password Length</Label>
              <Select
                value={authSettings.minPasswordLength}
                onValueChange={(value) => updateAuthSettings({ minPasswordLength: value })}
              >
                <SelectTrigger id="min-length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["6", "8", "12", "16"].map((val) => (
                    <SelectItem key={val} value={val}>{val} characters</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {passwordPolicies.map((policy) => (
              <SettingToggle
                key={policy.id}
                label={policy.label}
                description={policy.description}
                checked={authSettings.passwordPolicies[policy.id]}
                onCheckedChange={(checked) =>
                  updateAuthSettings({
                    passwordPolicies: { ...authSettings.passwordPolicies, [policy.id]: checked },
                  })
                }
              />
            ))}
          </CardContent>
        </Card>

        {/* SESSION MANAGEMENT */}
        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>
              Control how long users stay logged in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Idle Session Timeout</Label>
              <Select
                value={authSettings.sessionTimeout}
                onValueChange={(value) => updateAuthSettings({ sessionTimeout: value })}
              >
                <SelectTrigger id="session-timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { label: "1 Hour", value: "1h" },
                    { label: "8 Hours", value: "8h" },
                    { label: "24 Hours", value: "24h" },
                    { label: "7 Days", value: "7d" },
                    { label: "30 Days", value: "30d" },
                  ].map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SettingToggle
              label="Multi-device Login"
              description="Allow login from multiple devices simultaneously"
              checked={authSettings.multiDeviceLogin}
              onCheckedChange={(checked) => updateAuthSettings({ multiDeviceLogin: checked })}
            />
          </CardContent>
        </Card>

        {/* TWO-FACTOR CONFIG */}
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
            <CardDescription>
              Global settings for multi-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingToggle
              label="Force 2FA for Admins"
              description="Mandatory for all staff with admin roles"
              checked={authSettings.force2FA}
              onCheckedChange={(checked) => updateAuthSettings({ force2FA: checked })}
            />
            <div className="space-y-2">
              <Label>Primary 2FA Method</Label>
              <Select
                value={authSettings.primary2FAMethod}
                onValueChange={(value) => updateAuthSettings({ primary2FAMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { label: "Authenticator App (TOTP)", value: "app" },
                    { label: "SMS / Text Message", value: "sms" },
                    { label: "Email Code", value: "email" },
                  ].map((method) => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t p-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {!isSaving && <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Authentication

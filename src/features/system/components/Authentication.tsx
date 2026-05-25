import { useState } from "react"
import { Shield, Key, Mail, Fingerprint, Save } from "lucide-react"
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

interface LoginMethod {
  id: string
  label: string
  description: string
  icon: LucideIcon
  enabled: boolean
  disabled?: boolean
  comingSoon?: boolean
}

interface PasswordPolicyItem {
  id: string
  label: string
  description: string
  defaultChecked: boolean
}

const Authentication = () => {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("Authentication settings saved!")
    }, 1000)
  }

  const loginMethods: LoginMethod[] = [
    {
      id: "email",
      label: "Email & Password",
      description: "Traditional sign in",
      icon: Mail,
      enabled: true,
    },
    {
      id: "google",
      label: "Google Social Login",
      description: "Allow sign in with Google accounts",
      icon: Fingerprint,
      enabled: true,
    },
    {
      id: "apple",
      label: "Apple ID",
      description: "Coming soon",
      icon: Shield,
      enabled: false,
      disabled: true,
      comingSoon: true,
    },
  ]

  const passwordPolicies: PasswordPolicyItem[] = [
    { id: "special", label: "Require Special Characters", description: "Require @, #, $, etc.", defaultChecked: true },
    { id: "numbers", label: "Require Numbers", description: "Require at least one digit", defaultChecked: true },
    { id: "uppercase", label: "Require Uppercase", description: "Require at least one uppercase letter", defaultChecked: true },
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
                  <Switch defaultChecked={method.enabled} disabled={method.disabled} />
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
              <Select defaultValue="8">
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
                defaultChecked={policy.defaultChecked}
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
              <Select defaultValue="24h">
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
              defaultChecked
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
            />
            <div className="space-y-2">
              <Label>Primary 2FA Method</Label>
              <Select defaultValue="app">
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
              {isSaving ? "Saving..." : "Save All Changes"}
              {!isSaving && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Authentication

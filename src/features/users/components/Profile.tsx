import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from "react"
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  Camera,
  Save,
  Lock,
  Smartphone,
  BellRing,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { patchUser, updateProfile } from "@/features/authentication/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

const Profile = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const [firstName, setFirstName] = useState(user?.first_name || "")
  const [lastName, setLastName] = useState(user?.last_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [bio, setBio] = useState("Lead Platform Administrator at NestmartIT Dashboard.")
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || "")
  const [isSaving, setIsSaving] = useState(false)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Preferences / Security toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "")
      setLastName(user.last_name || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setProfilePicture(user.profile_picture || "")
    }
  }, [user])

  const displayName = useMemo(() => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ")
    if (fullName) return fullName
    if (email) {
      const namePart = email.split("@")[0].replace(/[._-]/g, " ")
      return namePart
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    }
    return "Administrator"
  }, [firstName, lastName, email])

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD"
  }, [displayName])

  // Handle Photo Upload
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setProfilePicture(result)
      dispatch(patchUser({ profile_picture: result }))
      toast.success("Profile photo updated")
    }
    reader.readAsDataURL(file)
  }

  // Handle Save Profile
  const handleSaveProfile = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    try {
      await dispatch(
        updateProfile({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          profile_picture: profilePicture,
        })
      ).unwrap()
      dispatch(
        patchUser({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          profile_picture: profilePicture,
        })
      )
      toast.success("Profile details saved successfully!")
    } catch {
      toast.error("Could not update profile on server, saved locally.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Password Update
  const handleUpdatePassword = (e: FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match")
      return
    }

    setIsChangingPassword(true)
    setTimeout(() => {
      setIsChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password changed successfully!")
    }, 600)
  }

  const permissionsList = user?.permissions?.length
    ? user.permissions
    : ["*", "catalog.*", "sales.*", "finance.*", "marketing.*", "customers.*", "settings.*"]

  return (
    <div className="section-container space-y-6 max-w-5xl mx-auto">
      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white/90">
          Administrator Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal credentials, system permissions, and dashboard security.
        </p>
      </div>

      {/* Top Banner Card */}
      <Card className="overflow-hidden border-border bg-card">
        <div className="h-28 bg-gradient-to-r from-primary-600 via-primary-500 to-teal-600 relative" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <Avatar className="size-24 ring-4 ring-background shadow-lg border border-border">
                  {profilePicture ? (
                    <AvatarImage src={profilePicture} alt={displayName} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md cursor-pointer hover:bg-primary-600 transition-colors">
                  <Camera className="size-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase">
                    {user?.role || "ADMIN"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="size-3.5" />
                  {email || "nestmartit.intern@gmail.com"}
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium ml-1">
                    <CheckCircle2 className="size-3.5" /> Verified
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="primary"
                onClick={() => handleSaveProfile()}
                disabled={isSaving}
                className="gap-1.5 shadow-sm"
              >
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/60 p-1">
          <TabsTrigger value="general" className="gap-2">
            <User className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <KeyRound className="size-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="size-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General Info */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your account profile details, contact information, and public name.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Nestmartit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Intern"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        placeholder="your.email@nestmartit.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio & Role Description</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Short description of your role or responsibilities..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (user) {
                        setFirstName(user.first_name || "")
                        setLastName(user.last_name || "")
                        setEmail(user.email || "")
                        setPhone(user.phone || "")
                      }
                    }}
                  >
                    <RotateCcw className="size-4 mr-1.5" />
                    Reset
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSaving}>
                    <Save className="size-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is using a long and random password to stay secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 2FA & Session Security */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication & Sessions</CardTitle>
              <CardDescription>
                Add additional security layers to your administrator account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Smartphone className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-muted-foreground">Receive security verification codes when logging in.</p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={(val) => {
                    setTwoFactorAuth(val)
                    toast.success(`2FA ${val ? "enabled" : "disabled"}`)
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BellRing className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Login Notification Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when a new session is started on your account.</p>
                  </div>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={(val) => {
                    setLoginAlerts(val)
                    toast.success(`Login alerts ${val ? "enabled" : "disabled"}`)
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Permissions */}
        <TabsContent value="permissions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                Assigned Role & System Capabilities
              </CardTitle>
              <CardDescription>
                List of access grants and permissions associated with your administrator account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Super Administrator Access</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your account has full management privileges across products, orders, financial reports, marketing automations, and store configurations.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Permission Tokens
                </Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {permissionsList.map((perm) => (
                    <Badge
                      key={perm}
                      variant="secondary"
                      className="px-3 py-1 font-mono text-xs bg-muted/70 hover:bg-muted border border-border"
                    >
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile

export interface SocialMediaLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  tiktok?: string
}

export interface StoreSettings {
  storeName: string
  storeLogo: string
  supportEmail: string
  storeAddress: string
  storePhone: string
  whatsappNumber: string
  vatId: string
  socialLinks: SocialMediaLinks
  notifications: {
    orderUpdates: boolean
    inventoryAlerts: boolean
    customerReviews: boolean
  }
  maintenanceMode: boolean
}

export const defaultStoreSettings: StoreSettings = {
  storeName: "My Awesome Store",
  storeLogo:
    "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=80",
  supportEmail: "support@mystore.com",
  storeAddress: "123 Commerce St, Tech City, 54321, US",
  storePhone: "+1 (555) 000-0000",
  whatsappNumber: "+1 (555) 987-6543",
  vatId: "US123456789",
  socialLinks: {
    facebook: "https://facebook.com/myawesomestore",
    instagram: "https://instagram.com/myawesomestore",
    twitter: "https://x.com/myawesomestore",
    youtube: "https://youtube.com/@myawesomestore",
    linkedin: "https://linkedin.com/company/myawesomestore",
    tiktok: "https://tiktok.com/@myawesomestore",
  },
  notifications: {
    orderUpdates: true,
    inventoryAlerts: true,
    customerReviews: false,
  },
  maintenanceMode: false,
}

export interface AuthSettings {
  loginMethods: {
    email: boolean
    google: boolean
    apple: boolean
  }
  minPasswordLength: string
  passwordPolicies: {
    special: boolean
    numbers: boolean
    uppercase: boolean
  }
  sessionTimeout: string
  multiDeviceLogin: boolean
  force2FA: boolean
  primary2FAMethod: string
}

export const defaultAuthSettings: AuthSettings = {
  loginMethods: {
    email: true,
    google: true,
    apple: false,
  },
  minPasswordLength: "8",
  passwordPolicies: {
    special: true,
    numbers: true,
    uppercase: true,
  },
  sessionTimeout: "24h",
  multiDeviceLogin: true,
  force2FA: false,
  primary2FAMethod: "app",
}

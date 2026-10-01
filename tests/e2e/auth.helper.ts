import { type Page, expect } from "@playwright/test"

// Credentials come from the environment (never commit them). Set E2E_EMAIL and
// E2E_PASSWORD in your shell or a git-ignored .env.local before running Playwright.
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name}: set it in the environment before running e2e tests`)
  }
  return value
}

export const USER_CREDENTIALS = {
  get email() {
    return requireEnv("E2E_EMAIL")
  },
  get password() {
    return requireEnv("E2E_PASSWORD")
  },
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  
  if (page.url().includes("/login")) {
    await page.locator("#email").fill(USER_CREDENTIALS.email)
    await page.locator("#password").fill(USER_CREDENTIALS.password)
    const submitBtn = page.getByRole("button", { name: /sign in/i })
    await submitBtn.click()

    try {
      await expect(page).not.toHaveURL(/\/login/, { timeout: 12000 })
    } catch {
      if (page.url().includes("/login")) {
        await submitBtn.click().catch(() => {})
        await expect(page).not.toHaveURL(/\/login/, { timeout: 25000 })
      }
    }
    await page.waitForLoadState("domcontentloaded")
  }
}

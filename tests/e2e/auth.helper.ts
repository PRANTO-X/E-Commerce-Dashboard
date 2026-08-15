import { type Page, expect } from "@playwright/test"

export const USER_CREDENTIALS = {
  email: "nestmartit.intern@gmail.com",
  password: "O7onopui2ABEa8YyjqpV",
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

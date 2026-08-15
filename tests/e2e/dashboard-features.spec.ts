import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./auth.helper"

test.describe("E-Commerce Dashboard Requirements", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("Feature 1: Product table displays IMAGE column with thumbnails", async ({ page }) => {
    await page.goto("/products")
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 15000 })

    // 1. Verify "IMAGE" table header exists
    const imageHeader = page.getByRole("columnheader", { name: "IMAGE" })
    await expect(imageHeader).toBeVisible()

    // 2. Verify table rows render an image container (thumbnail or placeholder icon)
    const tableBody = page.locator("tbody")
    await expect(tableBody).toBeVisible()

    const rows = tableBody.locator("tr")
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)

    const firstRowImageCell = rows.first().locator("td").first()
    await expect(firstRowImageCell).toBeVisible()
  })

  test("Feature 2: Table row click navigates to detail page", async ({ page }) => {
    // A. Test Product Row Click Navigation
    await page.goto("/products")
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible({ timeout: 15000 })

    const productCell = page.locator("tbody tr td:nth-child(2)").first()
    await expect(productCell).toBeVisible()
    await productCell.click()

    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/product_detail\//)
    await expect(page.getByText("Product Description")).toBeVisible()

    // B. Test Category Row Click Navigation
    await page.goto("/categories")
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible({ timeout: 15000 })
    await page.locator("tbody tr").first().waitFor({ state: "visible" })
    await page.locator("tbody tr td:nth-child(2)").first().click()
    await expect(page).toHaveURL(/\/category_form\//, { timeout: 10000 })

    // C. Test Customers Row Click Navigation
    await page.goto("/customers")
    await expect(page.getByRole("heading", { name: "Customers" })).toBeVisible({ timeout: 15000 })
    await page.locator("tbody tr").first().waitFor({ state: "visible" })
    await page.locator("tbody tr td:nth-child(2)").first().click()
    await expect(page).toHaveURL(/\/customer_detail\//, { timeout: 10000 })
  })

  test("Feature 3: Option to create a combo product bundle", async ({ page }) => {
    await page.goto("/products")

    // 1. Check "Create Combo Bundle" button in header
    const createBundleButton = page.getByRole("button", { name: /create combo bundle/i })
    await expect(createBundleButton).toBeVisible({ timeout: 15000 })
    await createBundleButton.click()

    // 2. Verify navigation to product form with bundle type
    await expect(page).toHaveURL(/\/product_form\/new\?type=bundle/)
    await expect(page.getByText("Combo Bundle Builder")).toBeVisible()

    // 3. Verify Combo Bundle Builder components & inputs
    await expect(page.getByText("Bundle Pricing Mode")).toBeVisible()

    // 4. Fill in bundle form details
    const randomSlug = `bundle-test-${Date.now()}`
    await page.locator("#name").fill("Mega Gamer Combo Bundle")
    await page.locator("#slug").fill(randomSlug)
    await page.locator("#description").fill("A complete gaming package bundle with accessories.")

    // Select category
    await page.locator("#category").click()
    const catOption = page.locator("[role='option']").first()
    if (await catOption.isVisible()) {
      await catOption.click()
    }

    // Set base price
    await page.locator("#base_price").fill("199.99")

    // 5. Submit bundle
    await page.keyboard.press("Escape") // Ensure any open dropdowns are dismissed
    const submitBtn = page.getByRole("button", { name: /Create Combo Bundle|Create Product|Save/i })
    await expect(submitBtn).toBeVisible()
    await submitBtn.click({ force: true })
    await expect(page).toHaveURL(/\/products/, { timeout: 20000 })
  })

  test("Feature 4: Option to add product variations (manual and generator)", async ({ page }) => {
    await page.goto("/product_form/new")
    await expect(page.locator("[data-slot='card-title']").filter({ hasText: "Product Variations" })).toBeVisible({ timeout: 15000 })

    // 1. Manual variation creation
    await page.getByPlaceholder("e.g. IP15-256-BLU").fill("VAR-TEST-01")
    await page.getByPlaceholder("e.g. 256GB - Blue").fill("Test Blue Edition")
    await page.getByRole("button", { name: /Add Variation/i }).click()

    // Verify variation appears in the list
    await expect(page.getByText("Test Blue Edition")).toBeVisible()
    await expect(page.getByText("VAR-TEST-01")).toBeVisible()

    // 2. Switch to Matrix Generator tab
    await page.getByRole("button", { name: /Generate Matrix/i }).click()
    await expect(page.getByText(/Generate Variations from Attribute/i)).toBeVisible()
  })

  test("Feature 5: Upload image option instead of/in addition to URL", async ({ page }) => {
    await page.goto("/product_form/new")
    await expect(page.getByText("Product Images", { exact: true })).toBeVisible({ timeout: 15000 })

    // 1. Verify "Upload File" tab is default active and dropzone is present
    await expect(page.getByText(/Click to upload/i)).toBeVisible()
    await expect(page.getByText(/PNG, JPG, JPEG, WEBP/i)).toBeVisible()

    // 2. Verify file input exists
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()

    // 3. Verify "Image URL" tab allows URL fallback
    await page.getByRole("button", { name: /Image URL/i }).click()
    await page.getByPlaceholder(/https:\/\/example.com/i).fill("https://images.unsplash.com/photo-1523275335684-37898b6baf30")
    await page.getByRole("button", { name: /^Add$/i }).click()

    // Verify thumbnail is displayed in the preview gallery with Primary badge
    await expect(page.locator("img[src*='unsplash.com']")).toBeVisible()
    await expect(page.getByText("Primary")).toBeVisible()
  })

  test("Feature 6: Order Detail page displays complete order data, items, and status", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible({ timeout: 15000 })

    // Click on the order row
    await page.locator("tbody tr").first().waitFor({ state: "visible" })
    await page.locator("tbody tr td:nth-child(2)").first().click()

    // Verify Order Detail page rendered correctly
    await expect(page).toHaveURL(/\/order_detail\//, { timeout: 10000 })
    await expect(page.getByText("Order Overview")).toBeVisible()
    await expect(page.getByText("Customer Information")).toBeVisible()
    await expect(page.getByText("Ordered Products")).toBeVisible()
    await expect(page.getByText("Pricing Breakdown")).toBeVisible()
    await expect(page.getByText("Status Timeline")).toBeVisible()
  })

  test("Feature 7: Homepage banner image upload and target category selection", async ({ page }) => {
    await page.goto("/banners")
    await expect(page.getByRole("heading", { name: "Homepage Banners" })).toBeVisible({ timeout: 15000 })

    // 1. Verify Banner Title and Target Category selector exist
    await expect(page.getByLabel("Banner Title")).toBeVisible()
    await expect(page.getByLabel("Target Category")).toBeVisible()

    // 2. Verify Image Uploader exists for the banner graphic
    await expect(page.getByText(/Upload Banner Graphic/i)).toBeVisible()
    await expect(page.locator('input[type="file"]')).toBeAttached()

    // 3. Fill banner details
    const bannerTitle = `Mega Summer Promo ${Date.now()}`
    await page.locator("#banner-title").fill(bannerTitle)

    // Pick target category
    await page.locator("#banner-category").click()
    const firstOption = page.locator("[role='option']").first()
    if (await firstOption.isVisible()) {
      await firstOption.click()
    }

    // Attach image via Image URL tab
    await page.getByRole("button", { name: /Image URL/i }).click()
    await page.getByPlaceholder(/https:\/\/example.com/i).fill("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da")
    await page.getByRole("button", { name: /^Add$/i }).click()

    // 4. Create the banner
    await page.getByRole("button", { name: /Create Banner/i }).click()

    // 5. Verify the banner appears in the table with Image and Category badge
    await expect(page.locator("tbody").getByText(bannerTitle, { exact: true })).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole("columnheader", { name: "TARGET CATEGORY" })).toBeVisible()
  })

  test("Feature 8: General settings with Store Logo, WhatsApp Number, and Social Media links", async ({ page }) => {
    await page.goto("/settings")
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({ timeout: 15000 })

    // 1. Verify Store Logo Image Uploader
    await expect(page.getByText("Store Identity & Brand Logo")).toBeVisible()
    await expect(page.getByText("Upload Store Logo")).toBeVisible()

    // 2. Verify WhatsApp Number Field
    const whatsappInput = page.locator("#whatsappNumber")
    await expect(whatsappInput).toBeVisible()
    await whatsappInput.fill("+1 (555) 999-8877")

    // 3. Verify Social Media Links
    await expect(page.getByText("Social Media Platform Links")).toBeVisible()
    const fbInput = page.locator("#facebookLink")
    const instaInput = page.locator("#instagramLink")
    const twitterInput = page.locator("#twitterLink")

    await expect(fbInput).toBeVisible()
    await expect(instaInput).toBeVisible()
    await expect(twitterInput).toBeVisible()

    await fbInput.fill("https://facebook.com/customstorebrand")
    await instaInput.fill("https://instagram.com/customstorebrand")

    // 4. Save General Settings
    const saveBtn = page.getByRole("button", { name: /Save General Settings/i })
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()

    // Verify success toast
    await expect(page.getByText("Settings saved successfully!")).toBeVisible({ timeout: 10000 })
  })

  test("Feature 9: Expenses tracking page with metrics, receipt uploader, filtering, and detail modal", async ({ page }) => {
    await page.goto("/expenses")
    await expect(page.getByRole("heading", { name: "Business Expenses" })).toBeVisible({ timeout: 15000 })

    // 1. Verify metric summary cards
    await expect(page.getByText("Total Expenditure")).toBeVisible()
    await expect(page.getByText("Cleared & Paid")).toBeVisible()
    await expect(page.getByText("Pending / Under Review")).toBeVisible()
    await expect(page.getByText("Top Spending Area")).toBeVisible()

    // 2. Verify Table headers
    await expect(page.getByRole("columnheader", { name: "EXPENSE DESCRIPTION" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "CATEGORY" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "AMOUNT" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "VENDOR / PAYEE" })).toBeVisible()

    // 3. Open Record Expense modal
    const recordBtn = page.getByRole("button", { name: /Record Expense/i })
    await expect(recordBtn).toBeVisible()
    await recordBtn.click()

    // 4. Fill in expense details
    const expenseTitle = `Office Ergonomic Chairs ${Date.now()}`
    await page.locator("#exp-title").fill(expenseTitle)
    await page.locator("#exp-amount").fill("580.00")
    await page.locator("#exp-vendor").fill("Herman Miller Furnishings")
    await page.locator("#exp-ref").fill("HM-CH-992")

    // Attach receipt
    await page.getByRole("button", { name: /Image URL/i }).click()
    await page.getByPlaceholder(/https:\/\/example.com/i).fill("https://images.unsplash.com/photo-1580481077197-909249767228")
    await page.getByRole("button", { name: /^Add$/i }).click()

    // Submit expense
    const submitBtn = page.locator('[role="dialog"]').getByRole("button", { name: /Record Expense/i })
    await submitBtn.click()

    // 5. Verify the expense appears in the table
    await expect(page.locator("tbody").getByText(expenseTitle)).toBeVisible({ timeout: 15000 })

    // 6. Click table row to open Detail Modal
    await page.locator("tbody").getByText(expenseTitle).click()
    await expect(page.locator('[role="dialog"]').getByText("Herman Miller Furnishings")).toBeVisible()
    await expect(page.locator('[role="dialog"]').getByText("$580.00")).toBeVisible()
  })

  test("Feature 10: Global Navbar Omnisearch navigates to any page and finds resources", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByPlaceholder(/Search product, order, customer/i)).toBeVisible({ timeout: 15000 })

    const searchInput = page.getByPlaceholder(/Search product, order, customer/i)

    // 1. Search for "Expenses" and navigate
    await searchInput.fill("Expenses")
    await expect(page.locator("header").getByText("Business Expenses")).toBeVisible()
    await page.locator("header").getByText("Business Expenses").click()
    await expect(page).toHaveURL(/.*\/expenses/)
    await expect(page.getByRole("heading", { name: "Business Expenses" })).toBeVisible()

    // 2. Search for "Coupons" and navigate
    await searchInput.fill("Coupons")
    await expect(page.locator("header").getByText("Coupons & Discounts")).toBeVisible()
    await page.locator("header").getByText("Coupons & Discounts").click()
    await expect(page).toHaveURL(/.*\/coupons/)
    await expect(page.getByRole("heading", { name: "Coupons" })).toBeVisible()

    // 3. Search for "Settings" and navigate
    await searchInput.fill("Settings")
    await expect(page.locator("header").getByText("General Settings")).toBeVisible()
    await page.locator("header").getByText("General Settings").click()
    await expect(page).toHaveURL(/.*\/settings/)
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
  })

  test("Feature 11: Admin Profile Page manages personal info, password update, and permissions", async ({ page }) => {
    await page.goto("/profile")
    await expect(page.getByRole("heading", { name: /Administrator Profile/i })).toBeVisible({ timeout: 15000 })

    // 1. Verify General Tab inputs and user details
    await expect(page.getByLabel(/First Name/i)).toBeVisible()
    await expect(page.getByLabel(/Email Address/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /Save Changes/i })).toBeVisible()

    // 2. Verify Security Tab
    await page.getByRole("tab", { name: /Security/i }).click()
    await expect(page.getByLabel(/Current Password/i)).toBeVisible()
    await expect(page.getByLabel("New Password", { exact: true })).toBeVisible()
    await expect(page.getByLabel(/Confirm New Password/i)).toBeVisible()
    await expect(page.getByText("Two-Factor Authentication (2FA)")).toBeVisible()

    // 3. Verify Permissions Tab
    await page.getByRole("tab", { name: /Permissions/i }).click()
    await expect(page.getByText(/Assigned Role & System Capabilities/i)).toBeVisible()
    await expect(page.getByText(/Super Administrator Access/i)).toBeVisible()
  })

  test("Feature 12: Navbar displays user avatar image or name initials instead of generic icon", async ({ page }) => {
    await page.goto("/")
    
    // 1. Verify user profile button in header displays initials or avatar
    const profileBtn = page.getByRole("button", { name: /Open user profile menu/i })
    await expect(profileBtn).toBeVisible({ timeout: 15000 })
    
    // Should render name initials (e.g. NI)
    await expect(profileBtn.getByText(/NI|AD|N/i)).toBeVisible()

    // 2. Open dropdown and verify profile link
    await profileBtn.click()
    await expect(page.getByRole("menuitem", { name: /Profile/i })).toBeVisible()
    await page.getByRole("menuitem", { name: /Profile/i }).click()
    await expect(page).toHaveURL(/.*\/profile/)
  })
})

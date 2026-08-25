# UI Audit — Remaining Work (Batches 6–10)

Handoff for the work left from the UI Consistency & Responsiveness Audit. Batches 1–5
(token/z-index foundation, scroll-restoration fix, StatusBadge consolidation, DataTable
loading/error states, PageHeading consolidation) are done — see commit `4c27f0a`
("Fix UI audit findings: tokens, status badges, loading states, page headers").

Each batch below is independent of the others unless noted. Effort/risk are rough estimates.
Finding IDs (`F-`, `CC-`, `TOK-`, `RESP-`, `A11Y-`, `CG-`, `FW-`) refer to the original audit
report; they're included so you can cross-reference specifics if this doc's summary isn't enough.

---

## Batch 6 — Slice-factory migration (cleanup, no visible bug)

**Effort:** M (1–2 days) · **Risk:** Low · **Deps:** none

13 of 31 Redux slices hand-roll `createSlice` instead of using the shared `sliceFactory`
(`src/utils/sliceFactory.ts`). Field shapes happen to match today (`isLoading`/`error`/`data`
all line up), so there's no runtime bug — but any future fix to error normalization or loading
semantics in `sliceFactory.ts` won't propagate to these 13, and they're pure duplicated
boilerplate.

**Files:** `authSlice.ts`, `analyticsSlice.ts`, `notificationSlice.ts`, `staffSlice.ts`,
`customerSlice.ts`, `reviewSlice.ts`, `couponSlice.ts`, `shippingSlice.ts`, `returnSlice.ts`,
`paymentSlice.ts`, `inventorySlice.ts`, `authSettingsSlice.ts`, `settingsSlice.ts`

**What to do:** For each, check whether its domain fits `sliceFactory`'s `{name, endpoint}`
contract (most will — `shippingSlice`/`inventorySlice` have some bespoke action-heavy thunks
like `fetchReservations`/`fetchCouriers`/`adjustStock` that may need to stay hand-rolled
alongside a factory-backed `fetchAll`/`fetchSingle`/etc.). Migrate the ones that fit;
leave a comment on ones that don't and why.

**Verify:** run the existing test suite + a manual pass on each migrated domain's
list/create/edit/delete flow. Nothing should look different — this is a pure refactor.

---

## Batch 7 — Mobile & touch-target pass

**Effort:** L (2–3 days) · **Risk:** Low–Medium · **Deps:** none, but touches `data-table.tsx`
and `TableActions.tsx` which batch 6 doesn't — fine to run either order

This is the batch with actual open **design decisions** — see below before starting the two
items that need them.

### Mechanical (no decision needed)

- **Touch targets too small** (`F-04`): `TableActions.tsx` row actions and `data-table.tsx`
  pagination buttons are 32px (`size-8`/`h-7 w-7`); `ui/button.tsx`'s `icon` size variants
  (`size-8`, `size-7`, `size-6`) are all under the 44×44px minimum. Raise via padding, not
  visual icon size (don't just make icons bigger).
- **Missing accessible names on icon-only buttons** (`A11Y-01`, `A11Y-02`): pagination
  buttons in `data-table.tsx` (~line 246+) and row-action buttons in `TableActions.tsx` have
  no `aria-label` — only a Tooltip, which sets `aria-describedby`, not an accessible name.
  Add `aria-label="First page"` / `"Previous page"` / etc., and `aria-label="View {item}"` /
  `"Edit {item}"` / `"Delete {item}"` to row actions.
  - Note: `Navbar.tsx`'s bell button and the avatar's focus-visible ring were already fixed
    as drive-by changes in batch 1 — don't redo those.
- **Hover-only controls invisible on touch** (`RESP-005`): `ImageUploader.tsx` (~line 275)
  gates "Set primary"/"Remove" behind `group-hover:opacity-100` with no fallback affordance.
  Always show a visible (if subtle) control instead of gating on hover.
- **Keyboard-inaccessible clickable divs** (`A11Y-06`, `A11Y-07`, `A11Y-08`): three files use
  `<div onClick>` with no `role`, `tabIndex`, or keyboard handler —
  `Attributes.tsx` (~line 133, attribute row select), `FlashSales.tsx` (~line 140, sale row
  select), `Expenses.tsx` (~line 330, receipt viewer trigger). Convert to real `<button>`s
  or add `role="button" tabIndex={0}` + an Enter/Space `onKeyDown`.
- **GlobalSearch missing listbox semantics** (`A11Y-14`): `GlobalSearch.tsx` (~line 604) has
  custom arrow-key navigation but no `role="listbox"` on the results container, no
  `role="option"`/`aria-selected` on each result, and no `aria-activedescendant` on the input.
- **FilterToolBar search input has no label** (`A11Y-15`): `FilterToolBar.tsx` (~line 29) —
  add `aria-label={searchPlaceholder}`.

### Needs a design decision first

1. **Mobile table strategy** (blocks the real fix for `RESP-001`/part of `F-04`): every
   `DataTable` still hardcodes pixel `columnWidths` that sum past 375px width, forcing
   horizontal scroll on every list page in all 13 domains, with no mobile fallback. Options:
   a card/stacked layout under `sm:`, horizontal-scroll-only (current behavior, just
   acknowledged as intentional), or column-priority reflow (hide low-priority columns below a
   breakpoint). **Ask:** which one, and does it need to be configurable per-table or can one
   strategy work for all 24 `DataTable` call sites?
2. **Mobile global search entry point** (`RESP-002`): `Navbar.tsx` (~line 109) hides
   `GlobalSearch` entirely below 640px (`hidden sm:flex`) with no replacement. **Ask:**
   icon-trigger opening a full-screen sheet, or an inline collapse?

**Verify:** full-route sweep at 375px in devtools; tab through a list page keyboard-only and
confirm every control is reachable and named; a quick VoiceOver/NVDA pass on 2–3 pages.

---

## Batch 8 — Heading structure & remaining a11y cleanup

**Effort:** M (1–2 days) · **Risk:** Low · **Deps:** none

- **`CardTitle` isn't a real heading** (`A11Y-03`): `ui/card.tsx` (~line 36) renders
  `<div data-slot="card-title">`, not `<h2>`/`<h3>`/etc., so no "section title" inside any
  `Card` app-wide participates in the document outline. Give it an `as`/`level` prop (default
  to something reasonable, e.g. `h3`) so call sites can opt into the right level.
- **Clickable table rows have no keyboard support** (`A11Y-04`): `data-table.tsx` (~line 179)
  — rows with `onRowClick`/`getRowLink` have no `role="button"`, `tabIndex`, or `onKeyDown`.
- **Heading level skips**: `CustomerDetail.tsx` (~lines 135, 161, 175) goes `h1` → `h3` with no
  `h2` (`A11Y-11`); `ProductForm.tsx` (~lines 720, 1014, 1165, 1235) goes `h1` → `h4` with no
  `h2`/`h3` (`A11Y-12`). Fix once `CardTitle`'s level prop exists above, if these use Card.
- **Placeholder-only form labels** (`A11Y-13`): `ProductForm.tsx`'s inline variant-edit row
  (~line 1301, SKU/Name/Price/Stock inputs) has no `<Label>`/`aria-label`, just placeholder text.
- **Low-contrast placeholder text** (`A11Y-09`): `index.css` — light-mode
  `--field-placeholder: #9ca3af` on `--field-bg: #f9fafb` is ~2.3–2.5:1, under WCAG AA. Darken
  toward the `#6b7280` range and spot-check it doesn't look too dark against dark-mode fields.

**Verify:** run an automated a11y scan (axe) on a sample of list/detail/form pages; visually
confirm no `Card` usage shifted layout from the div→heading change (headings can carry
different default browser margins).

---

## Batch 9 — Filter-toolbar & row-action rollout audit

**Effort:** M (1–2 days) · **Risk:** Low–Medium · **Deps:** none

`CC-03`: despite the commits that standardized `FilterToolBar` on some pages ("Match products
filter layout with other pages", "Redesign filter toolbar layout", "Add collapsible filter
button on mobile"), only ~10 of ~24 list pages were confirmed using it. Verify and migrate the
rest onto `FilterToolBar` and `TableActions` where they're still bespoke:

Payments, Returns, Shipments, Couriers, Warehouses, Reservations, Banners, BlogPosts, Pages,
Notifications, Attributes, AuditLogs, GroupBuys, FlashSales, Automations

(Some of these may already be fine — this list is "unconfirmed as of the original audit pass",
not "confirmed broken". Check each before changing it.)

Also worth doing in the same pass, lower priority:

- **Three competing "panel" idioms for the same concept** (`CC-02`): dashboard components
  hardcode hex borders/backgrounds for cards, catalog/audit use
  `bg-card/70 backdrop-blur-sm`, everything else uses the plain `Card` primitive. **Open
  question:** which becomes canonical? (Recommend: plain `Card` on tokens — simplest, already
  used most places.)
- **`TableActions` duplicates `Button` styling instead of composing it** (`CC-04`):
  `TableActions.tsx` (~line 20) hand-builds three near-identical class strings instead of
  `buttonVariants({variant:"ghost", size:"icon"})`. Low risk, makes future `Button` changes
  propagate automatically.

**Verify:** for each migrated page, confirm search/filter/mobile-collapse behavior is
unchanged from before.

---

## Batch 10 — Cleanup, polish & SPA odds and ends

**Effort:** S (~1 day) · **Risk:** Low · **Deps:** none — good first batch if you want a quick win

All independent, small items:

- **Dead Vite scaffold assets** (`CG-03`): delete `src/assets/react.svg`, `src/assets/vite.svg`
  — unreferenced anywhere.
- **`lib`/`utils`/`utility` directory sprawl** (`CG-02`): `src/lib/utils.ts`,
  `src/utils/sliceFactory.ts`, `src/utility/ExportToCsv.ts` — three top-level dirs for
  unrelated single-purpose helpers. Consolidate into one (recommend `src/lib/`). Touches
  import paths broadly — run a full build/typecheck after.
- **Leftover mock data** (`CG-06`): `src/assets/Data.ts` still has `example.com` mock seed
  data from before the real backend integration. Confirm no live feature still imports from
  it (should be safe post-integration), then delete.
- **Named-export inconsistency** (`CG-04`): 9 files (`AnalyticsSummary.tsx`,
  `OrderStatusChart.tsx`, `PaymentMethodChart.tsx`, `RevenueOrdersChart.tsx`,
  `SalesByCategoryChart.tsx`, `PriceRangeFilter.tsx`, `AreaChart.tsx`, `ProgressBar.tsx`,
  `DatePicker.tsx`) use named exports vs. ~84 files using `export default`. **Open question:**
  normalize to default, or document the exception for chart/utility subcomponents? Low stakes
  either way.
- **Missing `loading="lazy"` on below-the-fold images** (`FW-06`): `Expenses.tsx` (~line 338),
  `Staffs.tsx` (~line 42), `CampaignDetail.tsx` (~line 67, the campaign banner — clearest
  candidate), `Customers.tsx` (~line 54).
- **Suspense fallback uses a magic-number height** (`FW-05`): `Loader.tsx` (~line 5) —
  `h-[calc(100vh-200px)]` guesses the navbar+padding height instead of filling its actual flex
  parent. Use `h-full w-full`.
- **No per-route document titles** (`FW-03`): `index.html` sets one static `<title>`; nothing
  in `src/` ever touches `document.title`, so all 41 routes show the same browser tab title.
  Add a small `useDocumentTitle(title)` hook, call once per top-level page.
- **Font-loading strategy** (`FW-02`) — **open question:** `index.css` line 1 loads DM Sans via
  a render-blocking Google Fonts `@import` (no preconnect); `@fontsource-variable/geist` is an
  installed dependency that's never imported anywhere. Which is the intended brand font? Once
  decided: either self-host via the installed Geist package, or keep DM Sans but move loading
  to a preconnected `<link>` in `index.html` — and remove whichever strategy loses.
- **Shell corner radius mismatch** (`TOK-11`) — **open question:** `DashboardLayout.tsx`'s
  main panel uses `rounded-2xl` while nearly every card uses `rounded-xl`. Intentional, or
  should they match?
- **Modal-vs-routed-form has no documented rule** (`FW-04`) — **open question:** `Inventory.tsx`
  and `Expenses.tsx` use an inline `Dialog` for add/edit; everything else (Products, Categories,
  Staffs, Coupons, Campaigns, Pages) uses a dedicated routed form. What decides which pattern a
  new feature should use? Document it (e.g. "single-section/quick edit → Dialog, multi-section
  entity → routed page") — doesn't require changing existing pages, just writing the rule down.
- **A few responsive polish items**, all low severity, fine to batch with the above:
  - `RESP-006`: 4-card KPI grids collapse at different breakpoints in different features
    (`InventoryStatsCards.tsx` uses `sm:`→`xl:grid-cols-4`, `Dashboard.tsx`/`AnalyticsSummary.tsx`
    use `sm:`→`lg:grid-cols-4`). Standardize on one (recommend `lg:`).
  - `RESP-007`: `Profile.tsx` (~line 231) 3-column `TabsList` has no responsive fallback,
    label clipping risk at 375px.
  - `RESP-009`/`RESP-010`: a couple of ungated `grid-cols-2` in `ProductDetail.tsx` (~line 183)
    and `Expenses.tsx` (~line 815) — low risk (short labels) but breaks the app's otherwise-
    consistent "always pair `grid-cols` with a responsive prefix" convention.
  - `RESP-012`: `Navbar.tsx` notification dropdown (~line 161) is a fixed `w-80` (320px)
    against a 375px viewport — tight, unverified against safe-area insets.
  - `RESP-013`: `CampaignDetail.tsx` (~line 67) banner image uses fixed `h-64` regardless of
    viewport instead of `aspect-video` or a responsive height.

---

## Open design questions, collected

These block specific items above — answer before starting that item, everything else can
proceed without them:

1. Mobile table strategy (card/stacked vs. scroll-only vs. column reflow) — blocks batch 7 item 1
2. Mobile global search entry point (sheet vs. inline collapse) — blocks batch 7 item 2
3. Canonical "panel" idiom (Card vs. hex-hardcoded vs. backdrop-blur) — batch 9, optional
4. Font strategy (DM Sans vs. Geist) — batch 10, optional
5. Shell corner radius (match cards or stay distinct) — batch 10, optional
6. Modal vs. routed form criterion — batch 10, optional (just needs documenting, not code)
7. Named-export normalization for chart components — batch 10, optional, low stakes

## Suggested order

Batches 6, 9, and 10 have no open questions and no dependency on each other — do those first
in whatever order is convenient. Batch 7 needs decisions 1–2 before its two blocked items, but
its mechanical items (touch targets, aria-labels, keyboard handlers) can start immediately.
Batch 8 has no dependencies but shares `Card`/`CardTitle` with batch 7's mechanical items —
sequencing after 7 avoids two people touching `ui/card.tsx` at once.

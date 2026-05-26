import { expect, test, type Page } from '@playwright/test'
import { loginAsAdmin, loginAsClient } from './utils/auth'

async function clickSidebarLink(page: Page, name: RegExp) {
  await page
    .getByRole('navigation', { name: /sidebar/i })
    .getByRole('link', { name })
    .click()
}

test.describe('navigation smoke flows', () => {
  test('allows admin to navigate dashboard sections', async ({ page }) => {
    await loginAsAdmin(page)

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

    await clickSidebarLink(page, /^Members$/i)
    await expect(page).toHaveURL(/\/dashboard\/members$/)
    await expect(page.getByRole('heading', { name: /^Members$/i })).toBeVisible()

    await clickSidebarLink(page, /^Trainers$/i)
    await expect(page).toHaveURL(/\/dashboard\/trainers$/)
    await expect(page.getByRole('heading', { name: /^Trainers$/i })).toBeVisible()

    await clickSidebarLink(page, /^Plans$/i)
    await expect(page).toHaveURL(/\/dashboard\/plans$/)
    await expect(page.getByRole('heading', { name: /membership plans/i })).toBeVisible()

    await clickSidebarLink(page, /^Sessions$/i)
    await expect(page).toHaveURL(/\/dashboard\/sessions$/)
    await expect(page.getByRole('heading', { name: /^Sessions$/i })).toBeVisible()

    await clickSidebarLink(page, /^Bookings$/i)
    await expect(page).toHaveURL(/\/dashboard\/bookings$/)
    await expect(page.getByRole('heading', { name: /^Bookings$/i })).toBeVisible()
  })

  test('allows client to navigate cabinet sections', async ({ page }) => {
    await loginAsClient(page)

    await expect(page).toHaveURL(/\/cabinet/)
    await expect(page.getByText(/personal information/i)).toBeVisible()

    await clickSidebarLink(page, /^Bookings$/i)
    await expect(page).toHaveURL(/\/cabinet\/bookings$/)
    await expect(
      page.getByRole('heading', { name: 'Upcoming bookings', exact: true }),
    ).toBeVisible()

    await clickSidebarLink(page, /^Overview$/i)
    await expect(page).toHaveURL(/\/cabinet$/)
    await expect(page.getByText(/personal information/i)).toBeVisible()
  })
})

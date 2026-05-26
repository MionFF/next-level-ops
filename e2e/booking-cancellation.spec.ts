import { expect, test, type Page } from '@playwright/test'
import { getRequiredEnv, loginAsAdmin, loginAsClient } from './utils/auth'
import { createE2ERunId } from './utils/test-data'
import {
  createE2EBooking,
  createE2EMember,
  createE2ESession,
  createE2ETrainer,
} from './utils/entities'

function bookingFilterUrl(member: string, session: string) {
  return `/dashboard/bookings?member=${encodeURIComponent(member)}&session=${encodeURIComponent(
    session,
  )}`
}

function bookingItem(page: Page, sessionTitle: string) {
  return page.locator('tr, li').filter({ hasText: sessionTitle })
}

test.describe('booking cancellation flows', () => {
  test('allows admin to cancel a confirmed booking', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createE2ETrainer(page, runId)
    const { memberName, memberEmail } = await createE2EMember(page, runId)
    const { sessionTitle } = await createE2ESession(page, runId, trainerName)

    await createE2EBooking(page, sessionTitle, memberName)

    await page.goto(bookingFilterUrl(memberEmail, sessionTitle), { waitUntil: 'domcontentloaded' })

    const targetBooking = bookingItem(page, sessionTitle).filter({ hasText: memberName })

    await expect(targetBooking.first()).toBeVisible()
    await expect(targetBooking.filter({ hasText: 'Confirmed' }).first()).toBeVisible()

    await targetBooking
      .getByRole('button', { name: /^Cancel$/ })
      .first()
      .click()

    await page.waitForLoadState('networkidle')
    await page.reload({ waitUntil: 'domcontentloaded' })

    const cancelledBooking = bookingItem(page, sessionTitle).filter({ hasText: memberName })

    await expect(cancelledBooking.filter({ hasText: 'Cancelled' }).first()).toBeVisible()
    await expect(cancelledBooking.getByRole('button', { name: /^Cancel$/ })).toHaveCount(0)
  })

  test('allows client to cancel own upcoming booking', async ({ browser }) => {
    const runId = createE2ERunId()
    const clientEmail = getRequiredEnv('E2E_CLIENT_EMAIL')

    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()

    await loginAsAdmin(adminPage)

    const { trainerName } = await createE2ETrainer(adminPage, runId)
    const { sessionTitle } = await createE2ESession(adminPage, runId, trainerName)

    await createE2EBooking(adminPage, sessionTitle, clientEmail)

    await adminContext.close()

    const clientContext = await browser.newContext()
    const clientPage = await clientContext.newPage()

    await loginAsClient(clientPage)

    await clientPage.goto('/cabinet/bookings', { waitUntil: 'domcontentloaded' })

    const targetUpcomingBooking = bookingItem(clientPage, sessionTitle)

    await expect(clientPage.getByRole('heading', { name: /upcoming bookings/i })).toBeVisible()
    await expect(targetUpcomingBooking.first()).toBeVisible()
    await expect(targetUpcomingBooking.filter({ hasText: 'Confirmed' }).first()).toBeVisible()

    await targetUpcomingBooking
      .getByRole('button', { name: /^Cancel$/ })
      .first()
      .click()

    await clientPage.waitForLoadState('networkidle')
    await clientPage.reload({ waitUntil: 'domcontentloaded' })

    await expect(bookingItem(clientPage, sessionTitle)).toHaveCount(0)

    await clientContext.close()
  })
})

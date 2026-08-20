import { expect, test, type Page } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2ERunId } from './utils/test-data'
import {
  createE2EBooking,
  createE2EMember,
  createE2ESession,
  createE2ETrainer,
} from './utils/entities'
import { selectOptionByText, waitForAppReady } from './utils/forms'
import { gotoAppPage } from './utils/navigation'

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    )
    .toEqual({
      clientWidth: 360,
      scrollWidth: 360,
    })
}

test.describe('admin session and booking flow', () => {
  test('creates trainer, member, session, and booking', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createE2ETrainer(page, runId)
    const { memberName, memberEmail } = await createE2EMember(page, runId)
    const { sessionTitle } = await createE2ESession(page, runId, trainerName)

    await createE2EBooking(page, sessionTitle, memberName)

    const bookingCard = page
      .locator('li')
      .filter({ hasText: sessionTitle })
      .filter({ hasText: memberName })

    await expect(bookingCard.first()).toBeVisible()
    await expect(bookingCard.first()).toContainText(memberEmail)
    await expect(bookingCard.first()).toContainText(trainerName)
    await expect(bookingCard.first()).toContainText('Confirmed')
  })

  test('keeps booking selects within the mobile viewport', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createE2ETrainer(page, runId)
    const { memberName } = await createE2EMember(page, runId)
    const { sessionTitle } = await createE2ESession(page, runId, trainerName)

    await page.setViewportSize({ width: 360, height: 780 })
    await gotoAppPage(page, '/dashboard/bookings/new')
    await waitForAppReady(page)

    await selectOptionByText(page, 'Session', sessionTitle)
    await selectOptionByText(page, 'Member', memberName)
    await expectNoHorizontalOverflow(page)

    const sessionTrigger = page.getByRole('button', { name: /^Session:/ })
    const selectedSession = sessionTrigger.locator('span').first()

    await expect
      .poll(() =>
        selectedSession.evaluate(element => element.scrollWidth > element.clientWidth),
      )
      .toBe(true)

    await sessionTrigger.click()
    await expect(sessionTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect
      .poll(() =>
        page
          .getByRole('radiogroup', { name: 'Session options' })
          .evaluate(element => getComputedStyle(element).position),
      )
      .toBe('static')
    await expectNoHorizontalOverflow(page)
    await page.keyboard.press('Escape')

    const memberTrigger = page.getByRole('button', { name: /^Member:/ })

    await memberTrigger.click()
    await expect(memberTrigger).toHaveAttribute('aria-expanded', 'true')
    await expectNoHorizontalOverflow(page)
  })
})

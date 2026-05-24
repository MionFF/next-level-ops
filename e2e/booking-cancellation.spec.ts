import { expect, test, type Page } from '@playwright/test'
import { getRequiredEnv, loginAsAdmin, loginAsClient } from './utils/auth'
import { createFutureSessionDateTimes } from './utils/date-time'
import { selectOptionByText } from './utils/forms'
import { createE2EEmail, createE2EName, createE2ERunId } from './utils/test-data'

async function createTrainer(page: Page, runId: string) {
  const trainerName = createE2EName('Trainer', runId)
  const trainerEmail = createE2EEmail('trainer', runId)

  await page.goto('/dashboard/trainers/new', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /add trainer/i })).toBeVisible()

  await page.getByLabel('Full name').fill(trainerName)
  await page.getByLabel('Email').fill(trainerEmail)
  await page.getByLabel('Phone').fill('+1 555 0202')
  await page.getByLabel('Specialty').fill('Strength')
  await page.getByLabel('Status').selectOption('active')
  await page.getByRole('button', { name: /create trainer/i }).click()

  await expect(page).toHaveURL(/\/dashboard\/trainers$/)
  await expect(page.getByText(trainerName).first()).toBeVisible()

  return { trainerName, trainerEmail }
}

async function createMember(page: Page, runId: string) {
  const memberName = createE2EName('Member', runId)
  const memberEmail = createE2EEmail('member', runId)

  await page.goto('/dashboard/members/new', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

  await page.getByLabel('Full name').fill(memberName)
  await page.getByLabel('Email').fill(memberEmail)
  await page.getByLabel('Phone').fill('+1 555 0101')
  await page.getByLabel('Status').selectOption('active')
  await page.getByRole('button', { name: /create member/i }).click()

  await expect(page).toHaveURL(/\/dashboard\/members$/)
  await expect(page.getByText(memberName).first()).toBeVisible()

  return { memberName, memberEmail }
}

async function createSession(page: Page, runId: string, trainerName: string) {
  const sessionTitle = createE2EName('Session', runId)
  const { startsAt, endsAt } = createFutureSessionDateTimes()

  await page.goto('/dashboard/sessions/new', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /add session/i })).toBeVisible()

  await page.getByLabel('Title').fill(sessionTitle)
  await selectOptionByText(page, 'Trainer', trainerName)
  await page.getByLabel('Starts at').fill(startsAt)
  await page.getByLabel('Ends at').fill(endsAt)
  await page.getByLabel('Capacity').fill('10')
  await page.getByLabel('Status').selectOption('scheduled')
  await page.getByRole('button', { name: /create session/i }).click()

  await expect(page).toHaveURL(/\/dashboard\/sessions$/)
  await expect(page.getByText(sessionTitle).first()).toBeAttached()

  return { sessionTitle }
}

async function createBooking(page: Page, sessionTitle: string, memberSearchText: string) {
  await page.goto('/dashboard/bookings/new', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /add booking/i })).toBeVisible()

  await selectOptionByText(page, 'Session', sessionTitle)
  await selectOptionByText(page, 'Member', memberSearchText)
  await page.getByRole('button', { name: /create booking/i }).click()

  await expect(page).toHaveURL(/\/dashboard\/bookings$/)
  await expect(page.getByText(sessionTitle).first()).toBeVisible()
  await expect(page.getByText('Confirmed').first()).toBeVisible()
}

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

    const { trainerName } = await createTrainer(page, runId)
    const { memberName, memberEmail } = await createMember(page, runId)
    const { sessionTitle } = await createSession(page, runId, trainerName)

    await createBooking(page, sessionTitle, memberName)

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

    const { trainerName } = await createTrainer(adminPage, runId)
    const { sessionTitle } = await createSession(adminPage, runId, trainerName)

    await createBooking(adminPage, sessionTitle, clientEmail)

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

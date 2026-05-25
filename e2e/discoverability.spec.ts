import { expect, test, type Page } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createFutureSessionDateTimes } from './utils/date-time'
import { selectOptionByText } from './utils/forms'
import { gotoAppPage } from './utils/navigation'
import { createE2EEmail, createE2EName, createE2ERunId } from './utils/test-data'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function getComboboxOptionValueByText(page: Page, text: string) {
  const option = page
    .getByRole('combobox')
    .getByRole('option', { name: new RegExp(escapeRegExp(text)) })

  await expect(option).toBeAttached({ timeout: 5_000 })

  const value = await option.getAttribute('value')

  if (!value) {
    throw new Error(`Could not find option value for "${text}"`)
  }

  return value
}

async function createTrainer(page: Page, runId: string) {
  const trainerName = createE2EName('Trainer', runId)
  const trainerEmail = createE2EEmail('trainer', runId)

  await gotoAppPage(page, '/dashboard/trainers/new')
  await expect(page.getByRole('heading', { name: /add trainer/i })).toBeVisible()

  await page.getByLabel('Full name').fill(trainerName)
  await page.getByLabel('Email').fill(trainerEmail)
  await page.getByLabel('Phone').fill('+1 555 0202')
  await page.getByLabel('Specialty').fill('Strength')
  await page.getByLabel('Status').selectOption('active')

  await Promise.all([
    page.waitForURL(/\/dashboard\/trainers\/?$/, { timeout: 15_000 }),
    page.getByRole('button', { name: /create trainer/i }).click(),
  ])

  await expect(page.getByText(trainerName).first()).toBeVisible()

  return { trainerName, trainerEmail }
}

async function createMember(page: Page, runId: string) {
  const memberName = createE2EName('Member', runId)
  const memberEmail = createE2EEmail('member', runId)

  await gotoAppPage(page, '/dashboard/members/new')
  await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

  await page.getByLabel('Full name').fill(memberName)
  await page.getByLabel('Email').fill(memberEmail)
  await page.getByLabel('Phone').fill('+1 555 0101')
  await page.getByLabel('Status').selectOption('active')

  await Promise.all([
    page.waitForURL(/\/dashboard\/members\/?$/, { timeout: 15_000 }),
    page.getByRole('button', { name: /create member/i }).click(),
  ])

  await expect(page.getByText(memberName).first()).toBeVisible()

  return { memberName, memberEmail }
}

async function createSession(page: Page, runId: string, trainerName: string) {
  const sessionTitle = createE2EName('Session', runId)
  const { startsAt, endsAt } = createFutureSessionDateTimes()

  await gotoAppPage(page, '/dashboard/sessions/new')
  await expect(page.getByRole('heading', { name: /add session/i })).toBeVisible()

  await page.getByLabel('Title').fill(sessionTitle)
  await selectOptionByText(page, 'Trainer', trainerName)
  await page.getByLabel('Starts at').fill(startsAt)
  await page.getByLabel('Ends at').fill(endsAt)
  await page.getByLabel('Capacity').fill('10')
  await page.getByLabel('Status').selectOption('scheduled')

  await Promise.all([
    page.waitForURL(/\/dashboard\/sessions\/?$/, { timeout: 15_000 }),
    page.getByRole('button', { name: /create session/i }).click(),
  ])

  await expect(page.getByText(sessionTitle).first()).toBeAttached()

  return { sessionTitle }
}

async function createBooking(page: Page, sessionTitle: string, memberSearchText: string) {
  await gotoAppPage(page, '/dashboard/bookings/new')
  await expect(page.getByRole('heading', { name: /add booking/i })).toBeVisible()

  await selectOptionByText(page, 'Session', sessionTitle)
  await selectOptionByText(page, 'Member', memberSearchText)

  await Promise.all([
    page.waitForURL(/\/dashboard\/bookings\/?$/, { timeout: 15_000 }),
    page.getByRole('button', { name: /create booking/i }).click(),
  ])

  await expect(page.getByText(sessionTitle).first()).toBeVisible()
  await expect(page.getByText('Confirmed').first()).toBeVisible()
}

test.describe('discoverability flows', () => {
  test('filters sessions through URL search params', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createTrainer(page, runId)
    const { sessionTitle } = await createSession(page, runId, trainerName)

    await gotoAppPage(page, '/dashboard/sessions')

    const trainerId = await getComboboxOptionValueByText(page, trainerName)

    await gotoAppPage(
      page,
      `/dashboard/sessions?trainer=${encodeURIComponent(trainerId)}&statuses=scheduled`,
    )

    await expect(page).toHaveURL(/\/dashboard\/sessions\?/)
    await expect(page).toHaveURL(/trainer=/)
    await expect(page).toHaveURL(/statuses=scheduled/)
    await expect(page.getByRole('combobox')).toHaveValue(trainerId)
    await expect(page.getByRole('button', { name: /status 1 selected/i })).toBeVisible()
    await expect(page.getByText(sessionTitle).first()).toBeAttached()
    await expect(page.getByText(trainerName).first()).toBeAttached()

    await gotoAppPage(page, '/dashboard/sessions')

    await expect(page).toHaveURL(/\/dashboard\/sessions$/)
    await expect(page.getByRole('combobox')).toHaveValue('')
    await expect(page.getByRole('button', { name: /status all/i })).toBeVisible()
  })

  test('filters bookings through URL search params', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createTrainer(page, runId)
    const { memberName, memberEmail } = await createMember(page, runId)
    const { sessionTitle } = await createSession(page, runId, trainerName)

    await createBooking(page, sessionTitle, memberName)

    await gotoAppPage(
      page,
      `/dashboard/bookings?member=${encodeURIComponent(memberEmail)}&session=${encodeURIComponent(
        sessionTitle,
      )}&statuses=confirmed`,
    )

    await expect(page).toHaveURL(/\/dashboard\/bookings\?/)
    await expect(page).toHaveURL(/member=/)
    await expect(page).toHaveURL(/session=/)
    await expect(page).toHaveURL(/statuses=confirmed/)
    await expect(page.getByPlaceholder(/member name or email/i)).toHaveValue(memberEmail)
    await expect(page.getByPlaceholder(/session title/i)).toHaveValue(sessionTitle)
    await expect(page.getByRole('button', { name: /status 1 selected/i })).toBeVisible()
    await expect(page.getByText(memberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()
    await expect(page.getByText(sessionTitle).first()).toBeVisible()
    await expect(page.getByText('Confirmed').first()).toBeVisible()

    await gotoAppPage(page, '/dashboard/bookings')

    await expect(page).toHaveURL(/\/dashboard\/bookings$/)
    await expect(page.getByPlaceholder(/member name or email/i)).toHaveValue('')
    await expect(page.getByPlaceholder(/session title/i)).toHaveValue('')
    await expect(page.getByRole('button', { name: /status all/i })).toBeVisible()
  })
})

import { expect, type Page, test } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2EEmail, createE2EName, createE2ERunId } from './utils/test-data'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function selectOptionByText(page: Page, label: string, text: string) {
  const select = page.getByLabel(label)
  const option = select.getByRole('option', { name: new RegExp(escapeRegExp(text)) })
  const value = await option.getAttribute('value')

  if (!value) {
    throw new Error(`Could not find option value for "${text}" in "${label}" select`)
  }

  await select.selectOption(value)
}

function toDatetimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function createFutureSessionDateTimes() {
  const starts = new Date()

  starts.setDate(starts.getDate() + 14)
  starts.setHours(10, 0, 0, 0)

  const ends = new Date(starts)
  ends.setHours(11, 0, 0, 0)

  return {
    startsAt: toDatetimeLocalValue(starts),
    endsAt: toDatetimeLocalValue(ends),
  }
}

test.describe('admin session and booking flow', () => {
  test('creates trainer, member, session, and booking', async ({ page }) => {
    const runId = createE2ERunId()

    const trainerName = createE2EName('Trainer', runId)
    const trainerEmail = createE2EEmail('trainer', runId)

    const memberName = createE2EName('Member', runId)
    const memberEmail = createE2EEmail('member', runId)

    const sessionTitle = createE2EName('Session', runId)

    const { startsAt, endsAt } = createFutureSessionDateTimes()

    await loginAsAdmin(page)

    await page.goto('/dashboard/trainers/new')

    await expect(page.getByRole('heading', { name: /add trainer/i })).toBeVisible()

    await page.getByLabel('Full name').fill(trainerName)
    await page.getByLabel('Email').fill(trainerEmail)
    await page.getByLabel('Phone').fill('+1 555 0202')
    await page.getByLabel('Specialty').fill('Strength')
    await page.getByLabel('Status').selectOption('active')
    await page.getByRole('button', { name: /create trainer/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/trainers/)
    await expect(page.getByText(trainerName).first()).toBeVisible()
    await expect(page.getByText(trainerEmail).first()).toBeVisible()

    await page.goto('/dashboard/members/new')

    await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email').fill(memberEmail)
    await page.getByLabel('Phone').fill('+1 555 0101')
    await page.getByLabel('Status').selectOption('active')
    await page.getByRole('button', { name: /create member/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members/)
    await expect(page.getByText(memberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()

    await page.goto('/dashboard/sessions/new')

    await expect(page.getByRole('heading', { name: /add session/i })).toBeVisible()

    await page.getByLabel('Title').fill(sessionTitle)
    await selectOptionByText(page, 'Trainer', trainerName)
    await page.getByLabel('Starts at').fill(startsAt)
    await page.getByLabel('Ends at').fill(endsAt)
    await page.getByLabel('Capacity').fill('10')
    await page.getByLabel('Status').selectOption('scheduled')
    await page.getByRole('button', { name: /create session/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/sessions/)
    await expect(page.getByText(sessionTitle).first()).toBeAttached()
    await expect(page.getByText(trainerName).first()).toBeAttached()
    await expect(page.getByText(/scheduled/i).first()).toBeVisible()

    await page.goto('/dashboard/bookings/new')

    await expect(page.getByRole('heading', { name: /add booking/i })).toBeVisible()

    await selectOptionByText(page, 'Session', sessionTitle)
    await selectOptionByText(page, 'Member', memberName)
    await page.getByRole('button', { name: /create booking/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/bookings/)
    await expect(page.getByText(memberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()
    await expect(page.getByText(sessionTitle).first()).toBeVisible()
    await expect(page.getByText(trainerName).first()).toBeVisible()
    await expect(page.getByText('Confirmed').first()).toBeVisible()
  })
})

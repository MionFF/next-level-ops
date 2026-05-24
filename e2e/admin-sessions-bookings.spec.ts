import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2EEmail, createE2EName, createE2ERunId } from './utils/test-data'
import { selectOptionByText } from './utils/forms'
import { createFutureSessionDateTimes } from './utils/date-time'
import { gotoAppPage } from './utils/navigation'

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

    await gotoAppPage(page, '/dashboard/trainers/new')

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

    await gotoAppPage(page, '/dashboard/members/new')

    await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email').fill(memberEmail)
    await page.getByLabel('Phone').fill('+1 555 0101')
    await page.getByLabel('Status').selectOption('active')
    await page.getByRole('button', { name: /create member/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members/)
    await expect(page.getByText(memberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()

    await gotoAppPage(page, '/dashboard/sessions/new')

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

    await gotoAppPage(page, '/dashboard/bookings/new')

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

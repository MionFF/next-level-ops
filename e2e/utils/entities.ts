import { expect, type Page } from '@playwright/test'
import { createFutureSessionDateTimes } from './date-time'
import { selectOptionByText, waitForAppReady } from './forms'
import { gotoAppPage } from './navigation'
import { createE2EEmail, createE2EName } from './test-data'

export async function createE2ETrainer(page: Page, runId: string) {
  const trainerName = createE2EName('Trainer', runId)
  const trainerEmail = createE2EEmail('trainer', runId)

  await gotoAppPage(page, '/dashboard/trainers/new')
  await expect(page.getByRole('heading', { name: /add trainer/i })).toBeVisible()

  await page.getByLabel('Full name').fill(trainerName)
  await page.getByLabel('Email').fill(trainerEmail)
  await page.getByLabel('Phone').fill('+1 555 0202')
  await page.getByLabel('Specialty').fill('Strength')
  await page.getByLabel('Status').selectOption('active')

  await waitForAppReady(page)

  await Promise.all([
    page.waitForURL(/\/dashboard\/trainers\/?$/, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByRole('button', { name: /create trainer/i }).click(),
  ])

  await expect(page.getByText(trainerName).first()).toBeVisible()

  return { trainerName, trainerEmail }
}

export async function createE2EMember(page: Page, runId: string) {
  const memberName = createE2EName('Member', runId)
  const memberEmail = createE2EEmail('member', runId)

  await gotoAppPage(page, '/dashboard/members/new')
  await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

  await page.getByLabel('Full name').fill(memberName)
  await page.getByLabel('Email').fill(memberEmail)
  await page.getByLabel('Phone').fill('+1 555 0101')
  await page.getByLabel('Status').selectOption('active')

  await waitForAppReady(page)

  await Promise.all([
    page.waitForURL(/\/dashboard\/members\/?$/, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByRole('button', { name: /create member/i }).click(),
  ])

  await expect(
    page
      .getByRole('link', {
        name: memberName,
        exact: true,
      })
      .filter({ visible: true })
      .first(),
  ).toBeVisible()

  return { memberName, memberEmail }
}

export async function createE2ESession(page: Page, runId: string, trainerName: string) {
  const sessionTitle = createE2EName('Session', runId)
  const { startsAt, endsAt } = createFutureSessionDateTimes()

  await gotoAppPage(page, '/dashboard/sessions/new')
  await expect(page.getByRole('heading', { name: /add session/i })).toBeVisible()

  await page.getByLabel('Title').fill(sessionTitle)
  const trainerId = await selectOptionByText(page, 'Trainer', trainerName)
  await page.getByLabel('Starts at').fill(startsAt)
  await page.getByLabel('Ends at').fill(endsAt)
  await page.getByLabel('Capacity').fill('10')
  await page.getByLabel('Status').selectOption('scheduled')

  await waitForAppReady(page)

  await Promise.all([
    page.waitForURL(/\/dashboard\/sessions\/?$/, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByRole('button', { name: /create session/i }).click(),
  ])

  return { sessionTitle, startsAt, endsAt, trainerId }
}

export async function createE2EBooking(page: Page, sessionTitle: string, memberSearchText: string) {
  await gotoAppPage(page, '/dashboard/bookings/new')
  await expect(page.getByRole('heading', { name: /add booking/i })).toBeVisible()

  await selectOptionByText(page, 'Session', sessionTitle)
  await selectOptionByText(page, 'Member', memberSearchText)

  await waitForAppReady(page)

  await Promise.all([
    page.waitForURL(/\/dashboard\/bookings\/?$/, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByRole('button', { name: /create booking/i }).click(),
  ])

  await expect(page.getByText(sessionTitle).first()).toBeVisible()
  await expect(page.getByText('Confirmed').first()).toBeVisible()
}

export async function createE2EClient(page: Page, runId: string) {
  const clientName = createE2EName('Client', runId)
  const clientEmail = createE2EEmail('client', runId)
  const clientPassword = 'Password123!'

  await page.goto('/sign-up')
  await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible()

  await page.getByLabel('Full name', { exact: true }).fill(clientName)
  await page.getByLabel('Email', { exact: true }).fill(clientEmail)
  await page.getByLabel('Password', { exact: true }).fill(clientPassword)
  await page.getByLabel('Confirm password', { exact: true }).fill(clientPassword)

  await waitForAppReady(page)

  await Promise.all([
    page.waitForURL(/\/cabinet\/?$/, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByRole('button', { name: /sign up/i }).click(),
  ])

  return { clientName, clientEmail, clientPassword }
}

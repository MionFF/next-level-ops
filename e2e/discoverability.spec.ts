import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { waitForAppReady } from './utils/forms'
import { gotoAppPage } from './utils/navigation'
import { createE2ERunId } from './utils/test-data'
import {
  createE2EBooking,
  createE2EMember,
  createE2ESession,
  createE2ETrainer,
} from './utils/entities'

test.describe('discoverability flows', () => {
  test('filters sessions through URL search params', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createE2ETrainer(page, runId)
    const { sessionTitle, startsAt, trainerId } = await createE2ESession(page, runId, trainerName)
    const sessionDate = startsAt.slice(0, 10)

    await gotoAppPage(page, `/dashboard/sessions?trainer=${encodeURIComponent(trainerId)}`)
    await waitForAppReady(page)

    const sessionsFilters = page.locator('form').filter({ has: page.getByLabel('Search') })

    await sessionsFilters.getByLabel('Search').fill(sessionTitle)
    await expect(
      sessionsFilters.getByRole('button', { name: `Trainer: ${trainerName}` }),
    ).toBeVisible()

    await sessionsFilters.getByRole('button', { name: 'Session status: All' }).click()
    await sessionsFilters.getByLabel('Session status: Scheduled').click()
    await sessionsFilters.getByRole('button', { name: 'Session status: Scheduled' }).click()

    await sessionsFilters.getByLabel('From', { exact: true }).fill('2026-07-08')
    await sessionsFilters.getByLabel('To', { exact: true }).fill('2026-07-01')

    await expect(sessionsFilters.getByText('From date must be on or before To date.')).toBeVisible()

    await expect(sessionsFilters.getByRole('button', { name: 'Apply filters' })).toBeDisabled()

    await sessionsFilters.getByLabel('From', { exact: true }).fill(sessionDate)
    await sessionsFilters.getByLabel('To', { exact: true }).fill(sessionDate)

    await expect(
      sessionsFilters.getByText('From date must be on or before To date.'),
    ).not.toBeVisible()

    await expect(sessionsFilters.getByRole('button', { name: 'Apply filters' })).toBeEnabled()

    await sessionsFilters.getByRole('button', { name: 'Sort: Upcoming first' }).click()
    await sessionsFilters.locator('label').filter({ hasText: 'Latest first' }).click()

    await sessionsFilters.getByRole('button', { name: 'Apply filters' }).click()

    await expect(page).toHaveURL(/\/dashboard\/sessions\?search=/)

    const appliedUrl = new URL(page.url())
    const expectedParams = new URLSearchParams()
    expectedParams.set('search', sessionTitle)
    expectedParams.set('trainer', trainerId)
    expectedParams.append('statuses', 'scheduled')
    expectedParams.set('from', sessionDate)
    expectedParams.set('to', sessionDate)
    expectedParams.set('sort', 'latest')

    expect(`${appliedUrl.pathname}${appliedUrl.search}`).toBe(
      `/dashboard/sessions?${expectedParams.toString()}`,
    )

    await expect(page.getByLabel('Search')).toHaveValue(sessionTitle)
    await expect(page.getByRole('button', { name: `Trainer: ${trainerName}` })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Session status: Scheduled' })).toBeVisible()
    await expect(page.getByLabel('From', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByLabel('To', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByRole('button', { name: 'Sort: Latest first' })).toBeVisible()
    await expect(page.getByText(sessionTitle).first()).toBeAttached()
    await expect(page.getByText(trainerName).first()).toBeAttached()

    await page.reload()

    await expect(page.getByLabel('Search')).toHaveValue(sessionTitle)
    await expect(page.getByRole('button', { name: `Trainer: ${trainerName}` })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Session status: Scheduled' })).toBeVisible()
    await expect(page.getByLabel('From', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByLabel('To', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByRole('button', { name: 'Sort: Latest first' })).toBeVisible()

    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(page).toHaveURL(/\/dashboard\/sessions$/)
    await expect(page.getByLabel('Search')).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Trainer: All trainers' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Session status: All' })).toBeVisible()
    await expect(page.getByLabel('From', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('To', { exact: true })).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Sort: Upcoming first' })).toBeVisible()
  })

  test('filters bookings through URL search params', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createE2ETrainer(page, runId)
    const { memberName, memberEmail } = await createE2EMember(page, runId)
    const { sessionTitle, startsAt, trainerId } = await createE2ESession(page, runId, trainerName)
    const sessionDate = startsAt.slice(0, 10)

    await createE2EBooking(page, sessionTitle, memberName)

    await gotoAppPage(page, '/dashboard/bookings')
    await waitForAppReady(page)

    const bookingsFilters = page.locator('form').filter({ has: page.getByLabel('Member search') })

    await bookingsFilters.getByLabel('Member search').fill(memberEmail)
    await bookingsFilters.getByLabel('Session search').fill(sessionTitle)

    await bookingsFilters.getByRole('button', { name: 'Trainer: All trainers' }).click()
    const trainerOption = bookingsFilters.locator('label').filter({ hasText: trainerName })
    await trainerOption.scrollIntoViewIfNeeded()
    await trainerOption.click()

    await bookingsFilters.getByRole('button', { name: 'Booking status: All' }).click()
    await bookingsFilters.getByLabel('Booking status: Confirmed').click()
    await bookingsFilters.getByRole('button', { name: 'Booking status: Confirmed' }).click()

    await bookingsFilters.getByLabel('From', { exact: true }).fill(sessionDate)
    await bookingsFilters.getByLabel('To', { exact: true }).fill(sessionDate)

    await bookingsFilters.getByRole('button', { name: 'Sort: Upcoming first' }).click()
    await bookingsFilters.locator('label').filter({ hasText: 'Latest first' }).click()

    await bookingsFilters.getByRole('button', { name: 'Apply filters' }).click()

    const expectedParams = new URLSearchParams()
    expectedParams.set('member', memberEmail)
    expectedParams.set('session', sessionTitle)
    expectedParams.set('trainer', trainerId)
    expectedParams.append('statuses', 'confirmed')
    expectedParams.set('from', sessionDate)
    expectedParams.set('to', sessionDate)
    expectedParams.set('sort', 'latest')

    await expect(page).toHaveURL(`/dashboard/bookings?${expectedParams.toString()}`)

    await expect(page.getByLabel('Member search')).toHaveValue(memberEmail)
    await expect(page.getByLabel('Session search')).toHaveValue(sessionTitle)
    await expect(page.getByRole('button', { name: `Trainer: ${trainerName}` })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Booking status: Confirmed' })).toBeVisible()
    await expect(page.getByLabel('From', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByLabel('To', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByRole('button', { name: 'Sort: Latest first' })).toBeVisible()

    const bookingCard = page
      .locator('li')
      .filter({ hasText: sessionTitle })
      .filter({ hasText: memberName })

    await expect(bookingCard.first()).toBeVisible()
    await expect(bookingCard.first()).toContainText(memberEmail)
    await expect(bookingCard.first()).toContainText(trainerName)
    await expect(bookingCard.first()).toContainText('Confirmed')

    await page.reload()

    await expect(page.getByLabel('Member search')).toHaveValue(memberEmail)
    await expect(page.getByLabel('Session search')).toHaveValue(sessionTitle)
    await expect(page.getByRole('button', { name: `Trainer: ${trainerName}` })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Booking status: Confirmed' })).toBeVisible()
    await expect(page.getByLabel('From', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByLabel('To', { exact: true })).toHaveValue(sessionDate)
    await expect(page.getByRole('button', { name: 'Sort: Latest first' })).toBeVisible()
    await expect(bookingCard.first()).toBeVisible()

    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(page).toHaveURL(/\/dashboard\/bookings$/)
    await expect(page.getByLabel('Member search')).toHaveValue('')
    await expect(page.getByLabel('Session search')).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Trainer: All trainers' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Booking status: All' })).toBeVisible()
    await expect(page.getByLabel('From', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('To', { exact: true })).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Sort: Upcoming first' })).toBeVisible()
  })
})

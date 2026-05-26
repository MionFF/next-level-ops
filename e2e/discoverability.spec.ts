import { expect, test, type Page } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { gotoAppPage } from './utils/navigation'
import { createE2ERunId } from './utils/test-data'
import {
  createE2EBooking,
  createE2EMember,
  createE2ESession,
  createE2ETrainer,
} from './utils/entities'

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

test.describe('discoverability flows', () => {
  test('filters sessions through URL search params', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createE2ETrainer(page, runId)
    const { sessionTitle } = await createE2ESession(page, runId, trainerName)

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

    const { trainerName } = await createE2ETrainer(page, runId)
    const { memberName, memberEmail } = await createE2EMember(page, runId)
    const { sessionTitle } = await createE2ESession(page, runId, trainerName)

    await createE2EBooking(page, sessionTitle, memberName)

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

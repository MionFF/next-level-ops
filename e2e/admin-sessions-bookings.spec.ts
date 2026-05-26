import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2ERunId } from './utils/test-data'
import {
  createE2EBooking,
  createE2EMember,
  createE2ESession,
  createE2ETrainer,
} from './utils/entities'

test.describe('admin session and booking flow', () => {
  test('creates trainer, member, session, and booking', async ({ page }) => {
    const runId = createE2ERunId()

    await loginAsAdmin(page)

    const { trainerName } = await createE2ETrainer(page, runId)
    const { memberName, memberEmail } = await createE2EMember(page, runId)
    const { sessionTitle } = await createE2ESession(page, runId, trainerName)

    await createE2EBooking(page, sessionTitle, memberName)

    await expect(page.getByText(memberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()
    await expect(page.getByText(sessionTitle).first()).toBeVisible()
    await expect(page.getByText(trainerName).first()).toBeVisible()
    await expect(page.getByText('Confirmed').first()).toBeVisible()
  })
})

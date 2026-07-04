import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2EClient, createE2EMember } from './utils/entities'
import { selectOptionByText } from './utils/forms'
import { gotoAppPage } from './utils/navigation'
import { createE2ERunId } from './utils/test-data'

test.describe('admin profile links flow', () => {
  test('links and unlinks a client profile to a member', async ({ browser }) => {
    test.setTimeout(90_000)

    const runId = createE2ERunId()

    const clientContext = await browser.newContext()
    const adminContext = await browser.newContext()

    const clientPage = await clientContext.newPage()
    const adminPage = await adminContext.newPage()

    try {
      const { clientName } = await createE2EClient(clientPage, runId)

      await loginAsAdmin(adminPage)

      const { memberName, memberEmail } = await createE2EMember(adminPage, runId)

      await gotoAppPage(adminPage, '/dashboard/profile-links')
      await expect(adminPage.getByRole('heading', { name: /profile links/i })).toBeVisible()

      await selectOptionByText(adminPage, 'Client profile', clientName)
      await selectOptionByText(adminPage, 'Available member', memberName)

      await adminPage.getByRole('button', { name: /^link profile$/i }).click()

      const linkedRow = adminPage.locator('tr').filter({ hasText: memberEmail })

      await expect(linkedRow).toBeVisible({ timeout: 15_000 })
      await expect(linkedRow).toContainText(clientName)
      await expect(linkedRow).toContainText(memberName)
      await expect(linkedRow).toContainText(memberEmail)

      await clientPage.goto('/cabinet')
      await expect(clientPage).toHaveURL(/\/cabinet/, { timeout: 15_000 })
      await expect(clientPage.getByText(memberName).first()).toBeVisible()
      await expect(clientPage.getByText(memberEmail).first()).toBeVisible()

      await gotoAppPage(adminPage, '/dashboard/profile-links')

      const linkedRowAfterReload = adminPage.locator('tr').filter({ hasText: memberEmail })

      await expect(linkedRowAfterReload).toBeVisible({ timeout: 15_000 })
      await linkedRowAfterReload.getByRole('button', { name: /unlink/i }).click()

      await expect(adminPage.getByLabel('Client profile')).toContainText(clientName, {
        timeout: 15_000,
      })

      await clientPage.goto('/cabinet')
      await expect(clientPage).toHaveURL(/\/cabinet/, { timeout: 15_000 })
      await expect(
        clientPage.getByRole('heading', { name: 'Membership profile not linked' }),
      ).toBeVisible()
    } finally {
      await adminContext.close()
      await clientContext.close()
    }
  })
})

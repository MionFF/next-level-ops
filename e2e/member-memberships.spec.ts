import { expect, test, type Page } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2EClient, createE2EMember } from './utils/entities'
import { selectOptionByText, waitForAppReady } from './utils/forms'
import { gotoAppPage } from './utils/navigation'
import { createE2ERunId } from './utils/test-data'

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function getSectionByHeading(page: Page, heading: RegExp | string) {
  return page.getByRole('heading', { name: heading }).first().locator('xpath=ancestor::section[1]')
}

function getVisibleMemberLink(page: Page, memberName: string) {
  return page
    .getByRole('link', {
      name: memberName,
      exact: true,
    })
    .filter({ visible: true })
    .first()
}

function getVisibleExactText(page: Page, text: string) {
  return page
    .getByText(text, {
      exact: true,
    })
    .filter({ visible: true })
    .first()
}

async function selectFirstAvailableMembershipPlan(page: Page) {
  await waitForAppReady(page)

  const trigger = page.getByRole('button', { name: /^Plan:/i })

  await expect(trigger).toBeVisible()
  await trigger.click()

  const option = page.getByRole('radio', { name: /^Plan:/i }).first()

  await expect(option).toBeVisible()

  const label = (await option.getAttribute('aria-label'))?.replace(/^Plan:\s*/i, '').trim()

  if (!label) {
    throw new Error('No active membership plan option found')
  }

  await page.getByRole('radiogroup', { name: 'Plan options' }).getByText(label).click()

  return label.split('—')[0].trim()
}

test.describe('member membership flow', () => {
  test('allows admin to assign and cancel a linked member membership', async ({ browser }) => {
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

      await expect(getVisibleExactText(adminPage, memberEmail)).toBeVisible()

      await gotoAppPage(adminPage, '/dashboard/profile-links')
      await expect(adminPage.getByRole('heading', { name: /profile links/i })).toBeVisible()

      await selectOptionByText(adminPage, 'Client profile', clientName)
      await selectOptionByText(adminPage, 'Available member', memberName)

      await waitForAppReady(adminPage)

      await adminPage.getByRole('button', { name: /^link profile$/i }).click()

      const linkedRow = adminPage.locator('tr').filter({ hasText: memberEmail })

      await expect(linkedRow).toBeVisible({ timeout: 15_000 })
      await expect(linkedRow).toContainText(clientName)
      await expect(linkedRow).toContainText(memberName)
      await expect(linkedRow).toContainText(memberEmail)

      await gotoAppPage(adminPage, '/dashboard/members')

      const memberLink = getVisibleMemberLink(adminPage, memberName)

      await expect(memberLink).toBeVisible({
        timeout: 15_000,
      })

      await Promise.all([
        adminPage.waitForURL(/\/dashboard\/members\/[^/]+$/, {
          timeout: 15_000,
          waitUntil: 'domcontentloaded',
        }),
        memberLink.click(),
      ])

      await expect(adminPage.getByRole('heading', { name: memberName })).toBeVisible()
      await expect(adminPage.getByRole('heading', { name: /^membership$/i })).toBeVisible()

      await selectFirstAvailableMembershipPlan(adminPage)

      await adminPage.getByLabel('Start date').fill(getTodayDateInputValue())

      await waitForAppReady(adminPage)

      await adminPage.getByRole('button', { name: /assign membership/i }).click()

      const currentMembershipSection = getSectionByHeading(adminPage, /current membership/i)

      await expect(currentMembershipSection.getByText(/^Active$/).first()).toBeVisible({
        timeout: 15_000,
      })

      await clientPage.goto('/cabinet', { waitUntil: 'domcontentloaded' })

      const activeMembershipSection = getSectionByHeading(clientPage, /^active membership$/i)

      await expect(activeMembershipSection.getByText(/^Active$/).first()).toBeVisible({
        timeout: 15_000,
      })

      await waitForAppReady(adminPage)

      await currentMembershipSection.getByRole('button', { name: /cancel/i }).click()

      await expect(currentMembershipSection.getByText('No active membership.')).toBeVisible({
        timeout: 15_000,
      })

      await clientPage.goto('/cabinet', { waitUntil: 'domcontentloaded' })

      await expect(
        clientPage.getByRole('heading', { name: /^no active membership$/i }),
      ).toBeVisible({ timeout: 15_000 })
    } finally {
      await adminContext.close()
      await clientContext.close()
    }
  })
})

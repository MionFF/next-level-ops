import { expect, test, type Page } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2EClient } from './utils/entities'
import { selectOptionByText, waitForAppReady } from './utils/forms'
import { gotoAppPage } from './utils/navigation'
import { createE2EEmail, createE2EName, createE2ERunId } from './utils/test-data'

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function getSectionByHeading(page: Page, heading: RegExp | string) {
  return page
    .getByRole('heading', { name: heading })
    .first()
    .locator('xpath=ancestor::section[1]')
}

async function createMemberForMembershipFlow(page: Page, runId: string) {
  const memberName = createE2EName('Member', runId)
  const memberEmail = createE2EEmail('member', runId)

  await gotoAppPage(page, '/dashboard/members/new')
  await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

  await page.getByLabel('Full name').fill(memberName)
  await page.getByLabel('Email').fill(memberEmail)
  await page.getByLabel('Phone').fill('+1 555 0101')
  await page.getByLabel('Status').selectOption('active')

  await waitForAppReady(page)

  await page.getByRole('button', { name: /create member/i }).click()

  await expect(page).toHaveURL(/\/dashboard\/members\/?$/, { timeout: 15_000 })
  await expect(page.getByText(memberName).first()).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(memberEmail).first()).toBeVisible()

  return { memberName, memberEmail }
}

async function selectFirstAvailableMembershipPlan(page: Page) {
  const select = page.getByLabel('Plan')

  await expect(select).toBeVisible()

  const options = select.getByRole('option')
  const count = await options.count()

  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index)
    const value = await option.getAttribute('value')
    const label = (await option.textContent())?.trim()

    if (value && label) {
      await select.selectOption(value)

      return label.split('—')[0].trim()
    }
  }

  throw new Error('No active membership plan option found')
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

      const { memberName, memberEmail } = await createMemberForMembershipFlow(adminPage, runId)

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

      await expect(adminPage.getByRole('link', { name: memberName }).first()).toBeVisible({
        timeout: 15_000,
      })

      await Promise.all([
        adminPage.waitForURL(/\/dashboard\/members\/[^/]+$/, {
          timeout: 15_000,
          waitUntil: 'domcontentloaded',
        }),
        adminPage.getByRole('link', { name: memberName }).first().click(),
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

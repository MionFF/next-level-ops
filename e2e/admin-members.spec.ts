import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './utils/auth'
import { createE2EEmail, createE2EName, createE2ERunId } from './utils/test-data'

test.describe('admin member flow', () => {
  test('creates, edits, filters, and resets a member', async ({ page }) => {
    const runId = createE2ERunId()

    const memberName = createE2EName('Member', runId)
    const memberEmail = createE2EEmail('member', runId)
    const memberPhone = '+1 555 0101'

    const updatedMemberName = `${memberName} Updated`
    const updatedMemberPhone = '+1 555 9999'

    await loginAsAdmin(page)

    await page.goto('/dashboard/members')

    await page.getByRole('link', { name: /add member/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members\/new/)
    await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email').fill(memberEmail)
    await page.getByLabel('Phone').fill(memberPhone)
    await page.getByLabel('Status').selectOption('active')

    await page.getByRole('button', { name: /create member/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members/)
    await expect(page.getByRole('heading', { name: /^members$/i })).toBeVisible()
    await expect(page.getByText(memberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()

    await page.getByRole('link', { name: memberName }).first().click()

    await expect(page).toHaveURL(/\/dashboard\/members\/[^/]+$/)
    await expect(page.getByText(memberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()

    await page.getByRole('link', { name: /edit member/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members\/[^/]+\/edit/)
    await expect(page.getByRole('heading', { name: /edit member/i })).toBeVisible()

    await page.getByLabel('Full name').fill(updatedMemberName)
    await page.getByLabel('Phone').fill(updatedMemberPhone)
    await page.getByLabel('Status').selectOption('paused')

    await page.getByRole('button', { name: /save member/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members\/[^/]+$/)
    await expect(page.getByText(updatedMemberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()
    await expect(page.getByText(updatedMemberPhone).first()).toBeVisible()
    await expect(page.getByText(/paused/i).first()).toBeVisible()

    await page.goto('/dashboard/members')

    await page.getByLabel('Search').fill(updatedMemberName)
    await page.getByLabel('Status').selectOption('paused')
    await page.getByRole('button', { name: /apply filters/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members\?.*search=/)
    await expect(page).toHaveURL(/status=paused/)
    await expect(page.getByText(updatedMemberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()

    await page.getByRole('link', { name: /reset/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members$/)
    await expect(page.getByLabel('Search')).toHaveValue('')
    await expect(page.getByLabel('Status')).toHaveValue('all')
  })
})

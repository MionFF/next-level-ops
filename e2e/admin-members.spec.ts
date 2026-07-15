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

    await page.goto('/dashboard/members', {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.getByRole('heading', { name: /^members$/i })).toBeVisible({
      timeout: 15_000,
    })

    await page.getByRole('link', { name: /add member/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/members\/new/)
    await expect(page.getByRole('heading', { name: /add member/i })).toBeVisible()

    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email').fill(memberEmail)
    await page.getByLabel('Phone').fill(memberPhone)
    await page.getByLabel('Status').selectOption('active')

    await Promise.all([
      page.waitForURL(/\/dashboard\/members\/?$/, {
        timeout: 15_000,
      }),
      page.getByRole('button', { name: /create member/i }).click(),
    ])

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

    await expect(page).toHaveURL(/\/dashboard\/members\/[^/]+$/, {
      timeout: 15_000,
    })

    await expect(page.getByText(updatedMemberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()
    await expect(page.getByText(updatedMemberPhone).first()).toBeVisible()
    await expect(page.getByText(/paused/i).first()).toBeVisible()

    await Promise.all([
      page.waitForURL(/\/dashboard\/members\/?$/, {
        waitUntil: 'domcontentloaded',
      }),
      page.getByRole('link', { name: 'Members', exact: true }).click(),
    ])

    const filters = page.locator('form').filter({
      has: page.getByRole('searchbox', { name: 'Search', exact: true }),
    })
    const searchInput = filters.getByRole('searchbox', {
      name: 'Search',
      exact: true,
    })

    await expect(searchInput).toBeVisible({
      timeout: 15_000,
    })

    await searchInput.fill(updatedMemberName)

    const memberStatusTrigger = filters.getByRole('button', {
      name: 'Member status: All',
      exact: true,
    })

    await expect(memberStatusTrigger).toBeVisible()
    await memberStatusTrigger.click()
    await expect(memberStatusTrigger).toHaveAttribute('aria-expanded', 'true')

    const pausedStatus = filters.getByRole('checkbox', {
      name: 'Member status: Paused',
      exact: true,
    })
    const inactiveStatus = filters.getByRole('checkbox', {
      name: 'Member status: Inactive',
      exact: true,
    })

    await expect(pausedStatus).toBeVisible()
    await pausedStatus.check()
    await inactiveStatus.check()

    await filters.getByRole('button', { name: 'Apply filters', exact: true }).click()

    await expect
      .poll(
        () => {
          const url = new URL(page.url())

          return {
            pathname: url.pathname,
            search: url.searchParams.get('search'),
            statuses: url.searchParams.getAll('status').sort(),
          }
        },
        {
          timeout: 15_000,
        },
      )
      .toEqual({
        pathname: '/dashboard/members',
        search: updatedMemberName,
        statuses: ['inactive', 'paused'],
      })

    await expect(page.getByText(updatedMemberName).first()).toBeVisible()
    await expect(page.getByText(memberEmail).first()).toBeVisible()

    await filters.getByRole('button', { name: 'Reset', exact: true }).click()

    await expect
      .poll(
        () => {
          const url = new URL(page.url())

          return {
            pathname: url.pathname,
            search: url.search,
          }
        },
        {
          timeout: 15_000,
        },
      )
      .toEqual({
        pathname: '/dashboard/members',
        search: '',
      })

    await expect(searchInput).toHaveValue('')

    await expect(
      filters.getByRole('button', {
        name: 'Member status: All',
        exact: true,
      }),
    ).toBeVisible()

    await expect(
      filters.getByRole('button', {
        name: 'Profile: All profiles',
        exact: true,
      }),
    ).toBeVisible()

    await expect(
      filters.getByRole('button', {
        name: 'Membership: All',
        exact: true,
      }),
    ).toBeVisible()
  })
})

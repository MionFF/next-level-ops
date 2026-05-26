import { expect, test } from '@playwright/test'
import { loginAsAdmin, loginAsClient } from './utils/auth'

test.describe('auth access flows', () => {
  test('redirects anonymous dashboard visitor to sign-in', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/sign-in/)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('allows admin to sign in and access dashboard', async ({ page }) => {
    await loginAsAdmin(page)

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('allows client to sign in and access cabinet', async ({ page }) => {
    await loginAsClient(page)

    await expect(page).toHaveURL(/\/cabinet/)
    await expect(
      page.getByRole('heading', { name: /client cabinet|overview|cabinet/i }),
    ).toBeVisible()
  })

  test('blocks client from admin dashboard', async ({ page }) => {
    await loginAsClient(page)

    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/forbidden/)
  })

  test('blocks admin from client cabinet', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/cabinet')

    await expect(page).toHaveURL(/\/forbidden/)
  })
})

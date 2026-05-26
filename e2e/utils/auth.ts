import { expect, type Page } from '@playwright/test'

export function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export async function loginAsAdmin(page: Page) {
  await login(page, getRequiredEnv('E2E_ADMIN_EMAIL'), getRequiredEnv('E2E_ADMIN_PASSWORD'))
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
}

export async function loginAsClient(page: Page) {
  await login(page, getRequiredEnv('E2E_CLIENT_EMAIL'), getRequiredEnv('E2E_CLIENT_PASSWORD'))
  await expect(page).toHaveURL(/\/cabinet/, { timeout: 15_000 })
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/sign-in')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

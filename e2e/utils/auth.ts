import { expect, type Page } from '@playwright/test'
import { waitForAppReady } from './forms'

export function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export async function loginAsAdmin(page: Page) {
  await login(
    page,
    getRequiredEnv('E2E_ADMIN_EMAIL'),
    getRequiredEnv('E2E_ADMIN_PASSWORD'),
    /\/dashboard/,
  )
}

export async function loginAsClient(page: Page) {
  await login(
    page,
    getRequiredEnv('E2E_CLIENT_EMAIL'),
    getRequiredEnv('E2E_CLIENT_PASSWORD'),
    /\/cabinet/,
  )
}

async function login(page: Page, email: string, password: string, destination: RegExp) {
  await page.goto('/sign-in', {
    waitUntil: 'domcontentloaded',
  })

  await expect(
    page.getByRole('heading', {
      name: /sign in/i,
    }),
  ).toBeVisible()

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)

  await waitForAppReady(page)

  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(destination, {
    timeout: 20_000,
  })
}

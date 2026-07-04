import { expect, type Page } from '@playwright/test'

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
  await page.goto('/sign-in')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)

  await Promise.all([
    page.waitForURL(destination, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    }),
    page.getByRole('button', { name: 'Sign in' }).click(),
  ])
}

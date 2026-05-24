import { type Page } from '@playwright/test'

export async function gotoAppPage(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
}

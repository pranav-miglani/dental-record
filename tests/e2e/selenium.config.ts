/**
 * Selenium WebDriver Configuration
 * Configuration for E2E testing with Selenium
 */

import { Builder, WebDriver, Capabilities } from 'selenium-webdriver'
import * as chrome from 'selenium-webdriver/chrome'
import * as firefox from 'selenium-webdriver/firefox'

export interface TestConfig {
  baseUrl: string
  timeout: number
  headless: boolean
  browser: 'chrome' | 'firefox' | 'safari'
}

export const defaultConfig: TestConfig = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  timeout: 30000,
  headless: process.env.HEADLESS !== 'false',
  browser: (process.env.BROWSER as any) || 'chrome',
}

/**
 * Create WebDriver instance
 */
export async function createDriver(config: TestConfig = defaultConfig): Promise<WebDriver> {
  let builder = new Builder()

  switch (config.browser) {
    case 'chrome':
      const chromeOptions = new chrome.Options()
      if (config.headless) {
        chromeOptions.addArguments('--headless=new')
      }
      chromeOptions.addArguments('--no-sandbox')
      chromeOptions.addArguments('--disable-dev-shm-usage')
      chromeOptions.addArguments('--disable-gpu')
      builder = builder.forBrowser('chrome').setChromeOptions(chromeOptions)
      break

    case 'firefox':
      const firefoxOptions = new firefox.Options()
      if (config.headless) {
        firefoxOptions.addArguments('--headless')
      }
      builder = builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions)
      break

    case 'safari':
      builder = builder.forBrowser('safari')
      break

    default:
      throw new Error(`Unsupported browser: ${config.browser}`)
  }

  const driver = builder.build()
  driver.manage().setTimeouts({
    implicit: config.timeout,
    pageLoad: config.timeout,
    script: config.timeout,
  })

  return driver
}

/**
 * Cleanup driver
 */
export async function cleanupDriver(driver: WebDriver): Promise<void> {
  try {
    await driver.quit()
  } catch (error) {
    console.error('Error cleaning up driver:', error)
  }
}


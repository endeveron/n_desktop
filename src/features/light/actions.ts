'use server';

import { Page } from 'playwright-core';

import {
  ACTIVE_TABLE_SELECTOR,
  DATE_SPAN_SELECTOR,
  DATE_TAB_ACTIVE_SELECTOR,
  DATE_TAB_INACTIVE_SELECTOR,
  DISCON_FACT_SELECTOR,
  DTEK_WEBPAGE_URL,
  HOUSE_NUM,
  LAST_UPDATE_SELECTOR,
  QUEUE_NUMBER_SELECTOR,
  SCHEDULE_TABLE_SELECTOR,
  STREET,
  TABLE_CELLS_SELECTOR,
} from '@/features/light/constants';
import {
  convertDay,
  fillAddressForm,
  getTimeSlot,
  mapDayNameToEnglish,
  mapStatusClass,
  nukeAllModals,
  prettyLogError,
} from '@/features/light/helpers';
import { HourStatus, LightData, WeekDay } from '@/features/light/types';
import { playwrightBrowser } from '@/features/scraper/lib/browser';
import { ServerActionResult } from '@/types';
import { logWithTime, withTimeLimit } from '@/utils';

const MAX_ATTEMPTS = 5;
const TIME_LIMIT_PAGE_GOTO = 15000;

export const getLightData = async (): Promise<
  ServerActionResult<LightData>
> => {
  logWithTime('getScrapedData: Start');

  let page: Page | null = null;

  try {
    page = await playwrightBrowser.getNewPage();

    if (!page) {
      const errMsg = 'Page is not initialized';
      logWithTime(`getScrapedData ERROR: ${errMsg}`);
      return {
        success: false,
        error: { message: errMsg },
      };
    }

    logWithTime('getScrapedData: Page initialized');

    const browserPage = page;
    let scrapingSuccess = false;
    let scrapedData: LightData | null = null;

    // Retry loop
    for (
      let attempt = 0;
      attempt < MAX_ATTEMPTS && !scrapingSuccess;
      attempt++
    ) {
      logWithTime(
        `getScrapedData: Scraping attempt ${attempt + 1}/${MAX_ATTEMPTS}`
      );

      // Check page load with time limit
      const pageLoaded = await withTimeLimit(async () => {
        await browserPage.goto(DTEK_WEBPAGE_URL, {
          waitUntil: 'domcontentloaded',
          timeout: TIME_LIMIT_PAGE_GOTO,
        });
      }, TIME_LIMIT_PAGE_GOTO);

      if (!pageLoaded) {
        logWithTime('Page load timeout, retrying...');
        continue;
      }

      logWithTime('getScrapedData: URL opened');

      await nukeAllModals(page);
      logWithTime('getScrapedData: Modal closed');

      // Check address form with time limit
      const formFilled = await withTimeLimit(async () => {
        await fillAddressForm(browserPage, STREET, HOUSE_NUM);
      }, 2500);

      if (!formFilled) {
        logWithTime('Address form timeout, retrying...');
        continue;
      }

      logWithTime('getScrapedData: Address form filled');

      // Wait for schedule to load with time limit
      const scheduleVisible = await withTimeLimit(async () => {
        await browserPage.locator(DISCON_FACT_SELECTOR).waitFor({
          state: 'visible',
          timeout: 2500,
        });
      }, 2500);

      if (!scheduleVisible) {
        logWithTime('Schedule visibility timeout, retrying...');
        continue;
      }

      // Extract queue number
      let queueNumber = '';
      try {
        const queueElement = await page.locator(QUEUE_NUMBER_SELECTOR);
        if (await queueElement.isVisible()) {
          const queueText = await queueElement.textContent();
          queueNumber = queueText?.trim() || '';
        }
      } catch {
        logWithTime('getScrapedData: Queue number not found');
      }

      // Extract last update
      const lastUpdateElement = await page.locator(LAST_UPDATE_SELECTOR);
      const lastUpdate = (await lastUpdateElement.textContent())?.trim() || '';
      logWithTime('getScrapedData: Last update data extracted');

      // Extract `today's` data
      // No time limit needed - it's fast (285ms)
      const todayTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
      const todayDate =
        (await todayTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() ||
        '';

      const todayCells = await page
        .locator(ACTIVE_TABLE_SELECTOR)
        .locator(TABLE_CELLS_SELECTOR)
        .all();
      const todayHours: HourStatus[] = await Promise.all(
        todayCells.map(async (cell, index) => ({
          timeSlot: getTimeSlot(index),
          status: mapStatusClass(await cell.getAttribute('class')),
        }))
      );
      logWithTime("getScrapedData: Today's data extracted");

      // Switch to tomorrow tab with time limit (currently 614ms from logs)
      const tomorrowSwitched = await withTimeLimit(async () => {
        await browserPage.locator(DATE_TAB_INACTIVE_SELECTOR).click();
        await browserPage.waitForTimeout(500);
      }, 1000);

      if (!tomorrowSwitched) {
        logWithTime('Tomorrow tab switch timeout, retrying...');
        continue;
      }

      // No time limit needed - it's fast (198ms)
      const tomorrowTab = page.locator(DATE_TAB_ACTIVE_SELECTOR);
      logWithTime('getScrapedData: Switched to tomorrow tab');
      const tomorrowDate =
        (await tomorrowTab.locator(DATE_SPAN_SELECTOR).textContent())?.trim() ||
        '';

      const tomorrowCells = await page
        .locator(ACTIVE_TABLE_SELECTOR)
        .locator(TABLE_CELLS_SELECTOR)
        .all();
      const tomorrowHours: HourStatus[] = await Promise.all(
        tomorrowCells.map(async (cell, index) => ({
          timeSlot: getTimeSlot(index),
          status: mapStatusClass(await cell.getAttribute('class')),
        }))
      );
      logWithTime("getScrapedData: Tomorrow's data extracted");

      // Wait for week table with time limit (1000ms) (current: 10ms)
      const weekTableVisible = await withTimeLimit(async () => {
        await browserPage.locator('#tableRenderElem').waitFor({
          state: 'visible',
          timeout: 1000,
        });
      }, 1000);

      if (!weekTableVisible) {
        logWithTime('Week table visibility timeout, retrying...');
        continue;
      }

      logWithTime('getScrapedData: Week table is visible');

      // Extract week table data with time limit (3000ms)
      const days: WeekDay[] = [];
      const weekDataExtracted = await withTimeLimit(async () => {
        const rows = await browserPage.locator(SCHEDULE_TABLE_SELECTOR).all();

        for (const row of rows) {
          const dayNameElement = await row
            .locator('td[colspan="2"] div')
            .first();
          const dayName = (await dayNameElement.textContent())?.trim() || '';

          const rowClasses = (await row.getAttribute('class')) || '';
          const isYesterday = rowClasses.includes('yesterday-row');

          const firstCell = await row.locator('td[colspan="2"]').first();
          const firstCellClasses =
            (await firstCell.getAttribute('class')) || '';
          const isToday = firstCellClasses.includes('current-day');

          const cells = await row.locator('td:not([colspan])').all();
          const hours: string[] = [];

          for (const cell of cells) {
            const className = await cell.getAttribute('class');
            hours.push(mapStatusClass(className));
          }

          days.push({
            dayName,
            dayNameEn: mapDayNameToEnglish(dayName),
            isToday,
            isYesterday,
            hours,
          });
        }
      }, 3000);

      if (!weekDataExtracted) {
        logWithTime('Week table extraction timeout, retrying...');
        continue;
      }
      logWithTime('getScrapedData: Week table data extracted');

      // All operations succeeded
      scrapingSuccess = true;
      scrapedData = {
        street: STREET,
        houseNumber: HOUSE_NUM,
        queueNumber,
        lastUpdate,
        today: convertDay(todayHours),
        todayDate,
        tomorrow: convertDay(tomorrowHours),
        tomorrowDate,
        weekSchedule: {
          schedule: days,
          timestamp: Date.now(),
        },
      };
    }

    if (!scrapingSuccess || !scrapedData) {
      if (page) {
        await page.close({ runBeforeUnload: false });
      }
      return {
        success: false,
        error: { message: 'Data scraping failed after 3 attempts' },
      };
    }

    logWithTime('getScrapedData: All required ata retrieved');

    await page.close({ runBeforeUnload: false });
    logWithTime('getScrapedData: Page closed');

    return {
      success: true,
      data: scrapedData,
    };
  } catch (err: unknown) {
    logWithTime('getScrapedData: ERROR');

    if (err instanceof Error) {
      prettyLogError(err);
    } else {
      console.error('Unknown error:', err);
    }

    if (page) {
      await page.close({ runBeforeUnload: false });
    }

    return {
      success: false,
      error:
        err instanceof Error
          ? err
          : new Error('getScrapedData: Unknown error occurred'),
    };
  }
};

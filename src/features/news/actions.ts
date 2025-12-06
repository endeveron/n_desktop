'use server';

import {
  HACKERNEWS_FETCH_LIMIT,
  NEWSDATA_API_KEY,
  NEWSDATA_EXCLUDE_DOMAINS,
  NEWSDATA_FETCH_ITERATIONS,
} from '@/features/news/constants';
import {
  HackerNewsArticle,
  NewsDataAPIResponse,
  NewsDataAPIResult,
  NewsDataArticle,
} from '@/features/news/types';
import { ServerActionResult } from '@/types';
import { logWithTime } from '@/utils';
import { handleActionError } from '@/utils/error';

export const getNewsData = async (
  nextPage?: string
): Promise<ServerActionResult<NewsDataAPIResult>> => {
  logWithTime('getNewsData: Start');

  let reqNumber = 1;
  let articles: NewsDataArticle[] = [];
  let currentNextPage: string | undefined = nextPage;

  try {
    while (reqNumber <= NEWSDATA_FETCH_ITERATIONS) {
      logWithTime(
        `getNewsData: Sending GET request (${reqNumber}/${NEWSDATA_FETCH_ITERATIONS})`
      );

      const params = new URLSearchParams({
        apikey: NEWSDATA_API_KEY,
        language: 'en',
        category: 'science,technology,entertainment',
        excludecountry: 'ru,in',
        excludedomain: NEWSDATA_EXCLUDE_DOMAINS.join(','),
        removeduplicate: '1',
      });

      if (currentNextPage) {
        params.set('page', currentNextPage);
      }

      const res = await fetch(
        `https://newsdata.io/api/1/latest?${params.toString()}`
      );

      if (!res.ok) {
        logWithTime(
          `getNewsData Error: Request ${reqNumber}/${NEWSDATA_FETCH_ITERATIONS} failed with status ${res.status}`
        );
        return handleActionError(
          `API request failed with status ${res.status}`
        );
      }

      const data: NewsDataAPIResponse = await res.json().catch(() => {
        return handleActionError(
          'getNewsData: Invalid JSON returned by NewsData API'
        );
      });

      // Validate structure
      if (!data || typeof data !== 'object') {
        return handleActionError('getNewsData: Malformed API response');
      }

      // API-side error
      if (data.status === 'error') {
        return handleActionError(
          data?.results?.message ?? 'getNewsData: API returned an unknown error'
        );
      }

      // Invalid type of `results` field
      if (!Array.isArray(data.results)) {
        return handleActionError(
          'getNewsData: Invalid API response: results is not an array'
        );
      }

      if (data.status !== 'success' || !data.results.length) {
        logWithTime(`getNewsData: No results in request ${reqNumber}`);
        break; // No more data available
      }

      articles = [...articles, ...data.results];
      currentNextPage = data.nextPage;

      logWithTime(
        `getNewsData: Request completed. Retrieved ${data.results.length} articles`
      );

      // If there's no next page, stop fetching
      if (!currentNextPage) {
        break;
      }

      reqNumber++;
    }

    logWithTime(`getNewsData: Completed. Total articles: ${articles.length}`);

    return {
      success: true,
      data: {
        articles,
        nextPage: currentNextPage,
      },
    };
  } catch (err: unknown) {
    logWithTime(
      `getHackerNews Error: ${err instanceof Error ? err.message : 'Unknown'}`
    );
    return handleActionError('getNewsData: Unknown error occurred');
  }
};

export const getHackerNews = async ({
  limit = HACKERNEWS_FETCH_LIMIT,
}: {
  limit?: number;
}): Promise<ServerActionResult<HackerNewsArticle[]>> => {
  logWithTime('getHackerNews: Start');

  try {
    // Fetch new story IDs
    const idsRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/newstories.json'
    );

    if (!idsRes.ok) {
      return handleActionError(
        `getHackerNews: API returned status ${idsRes.status}`
      );
    }

    const idArr = await idsRes.json().catch(() => {
      return handleActionError(`getHackerNews: API returned Invalid JSON`);
    });

    if (!Array.isArray(idArr)) {
      return handleActionError(`getHackerNews: Expected array of IDs`);
    }

    const idArrLength = idArr?.length;
    if (idArrLength) {
      logWithTime(`getHackerNews: Retrieved ${idArrLength} IDs`);
    }

    // Fetch articles
    const articles = await Promise.allSettled(
      idArr.slice(0, limit).map(async (id: number) => {
        const res = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
    );

    // Filter out any invalid articles
    const validArticles: HackerNewsArticle[] = articles
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter((a: HackerNewsArticle) => a && a.url);

    logWithTime(
      `getHackerNews: Request completed. Retrieved ${validArticles.length} articles`
    );

    return {
      success: true,
      data: validArticles,
    };
  } catch (err: unknown) {
    logWithTime(
      `getHackerNews Error: ${err instanceof Error ? err.message : 'Unknown'}`
    );
    return handleActionError('getHackerNews: Unknown error occurred');
  }
};

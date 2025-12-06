import { StateCreator } from 'zustand';

import { getHackerNews, getNewsData } from '@/features/news/actions';
import {
  HACKERNEWS_FETCH_ATTEMPTS,
  NEWSDATA_FETCH_ATTEMPTS,
} from '@/features/news/constants';
import { HackerNewsArticle, NewsDataArticle } from '@/features/news/types';
import { initialState } from '@/store';
import { logWithTime, wait } from '@/utils';

export interface NewsSlice {
  // NewsData.io
  isNewsDataError: boolean;
  isNewsDataFetching: boolean;
  newsDataArticles: NewsDataArticle[] | null;
  newsDataNextPage?: string;
  newsDataTimestamp: number | null;
  fetchNewsData: () => Promise<boolean>;

  // Hacker News
  hackerNewsArticles: HackerNewsArticle[] | null;
  hackerNewsTimestamp: number | null;
  isHackerNewsError: boolean;
  isHackerNewsFetching: boolean;
  fetchHackerNews: () => Promise<boolean>;
}

export const newsSlice: StateCreator<NewsSlice, [], [], NewsSlice> = (
  set,
  get
) => ({
  ...initialState,

  fetchNewsData: async () => {
    const { isNewsDataFetching } = get() as NewsSlice;
    if (isNewsDataFetching) {
      return true;
    }

    set({
      isNewsDataError: false,
      isNewsDataFetching: true,
    });

    const articles: NewsDataArticle[] = [];
    let nextPage = get().newsDataNextPage;

    for (let i = 0; i < NEWSDATA_FETCH_ATTEMPTS; i++) {
      // Add progressive delay
      if (i > 0) await wait(1000 * i);

      const res = await getNewsData(nextPage);

      if (!res.success && res.error) {
        logWithTime(
          `fetchNewsData: ${res.error.message ?? 'Unable to retrieve data'}`
        );
      }

      if (!res.success || !res.data?.articles) {
        continue;
      }

      articles.push(...res.data.articles);
      nextPage = res.data.nextPage;

      // Break early if no more pages available
      if (!nextPage) {
        break;
      }
    }

    if (!articles.length) {
      set({
        isNewsDataError: true,
        isNewsDataFetching: false,
      });
      return false;
    }

    set({
      isNewsDataFetching: false,
      newsDataArticles: articles,
      newsDataNextPage: nextPage,
      newsDataTimestamp: Date.now(),
    });
    return true;
  },

  fetchHackerNews: async () => {
    const { isHackerNewsFetching } = get() as NewsSlice;
    if (isHackerNewsFetching) {
      return true;
    }

    set({
      isHackerNewsError: false,
      isHackerNewsFetching: true,
    });

    try {
      const articles: HackerNewsArticle[] = [];

      for (let i = 0; i < HACKERNEWS_FETCH_ATTEMPTS; i++) {
        // Add progressive delay
        if (i > 0) await wait(1000 * i);

        const res = await getHackerNews({});

        if (!res.success && res.error) {
          logWithTime(
            `fetchHackerNews: ${res.error.message ?? 'Unable to retrieve data'}`
          );
        }

        if (!res.success || !res.data?.length) {
          continue;
        }

        articles.push(...res.data);

        // HackerNews doesn't have pagination, so break after first success
        break;
      }

      // Check if we got any articles after all retries
      if (!articles.length) {
        set({
          isHackerNewsError: true,
          isHackerNewsFetching: false,
        });
        return false;
      }

      set({
        hackerNewsArticles: articles,
        hackerNewsTimestamp: Date.now(),
        isHackerNewsFetching: false,
      });

      return true;
    } catch (error) {
      console.error('fetchHackerNews Error:', error);
      set({
        isHackerNewsError: true,
        isHackerNewsFetching: false,
      });
      return false;
    }
  },
});

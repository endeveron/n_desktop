'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/shared/Card';
import { ContentBox } from '@/components/shared/ContentBox';
import Loading from '@/components/shared/Loading';
import UpdateButton from '@/components/shared/UpdateButton';
import NewsCard from '@/features/news/components/NewsCard';
import { NewsProvider } from '@/features/news/types';
import { useStore } from '@/store';
import { DATA_ERROR } from '@/translations/en';
import { cn } from '@/utils';

const News = () => {
  const isExtraColumn = useStore((state) => state.isExtraColumn);

  const newsDataArticles = useStore((state) => state.newsDataArticles);
  // const newsDataTimestamp = useStore((state) => state.newsDataTimestamp);
  const isNewsDataFetching = useStore((state) => state.isNewsDataFetching);
  const fetchNewsData = useStore((state) => state.fetchNewsData);

  const hackerNewsArticles = useStore((state) => state.hackerNewsArticles);
  // const hackerNewsTimestamp = useStore((state) => state.hackerNewsTimestamp);
  const isHackerNewsFetching = useStore((state) => state.isHackerNewsFetching);
  const fetchHackerNews = useStore((state) => state.fetchHackerNews);

  const newsDataScrollViewportRef = useRef<HTMLDivElement>(null);
  const hackerNewsScrollViewportRef = useRef<HTMLDivElement>(null);

  const newsDataArticlesLength = newsDataArticles?.length;
  const hackerNewsArticlesLength = hackerNewsArticles?.length;

  const [provider, setProvider] = useState<NewsProvider>(
    NewsProvider.HACKER_NEWS
  );

  const isNewsDataArticles = useMemo(() => {
    return provider === NewsProvider.NEWS_DATA && !!newsDataArticlesLength;
  }, [newsDataArticlesLength, provider]);

  const isHackerNewsArticles = useMemo(() => {
    return provider === NewsProvider.HACKER_NEWS && !!hackerNewsArticlesLength;
  }, [hackerNewsArticlesLength, provider]);

  const isUpdBtn = isHackerNewsArticles || isNewsDataArticles;
  const isFetching = isHackerNewsFetching || isNewsDataFetching;

  const toggleProvider = () => {
    const newProvider =
      provider === NewsProvider.NEWS_DATA
        ? NewsProvider.HACKER_NEWS
        : NewsProvider.NEWS_DATA;
    setProvider(newProvider);
  };

  const retrieveNewsData = useCallback(async () => {
    const success = await fetchNewsData();

    if (!success) {
      toast(DATA_ERROR);
    }

    if (success && newsDataScrollViewportRef.current) {
      setTimeout(() => {
        newsDataScrollViewportRef.current!.scrollTo({
          top: 0,
          behavior: 'smooth', // or 'auto' for instant scroll
        });
      }, 50);
    }
  }, [fetchNewsData]);

  const retrieveHackerNews = useCallback(async () => {
    const success = await fetchHackerNews();

    if (!success) {
      toast(DATA_ERROR);
    }

    if (success && hackerNewsScrollViewportRef.current) {
      setTimeout(() => {
        hackerNewsScrollViewportRef.current!.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 50);
    }
  }, [fetchHackerNews]);

  const fetchNews = useCallback(async () => {
    switch (provider) {
      case NewsProvider.NEWS_DATA:
        await retrieveNewsData();
        break;
      case NewsProvider.HACKER_NEWS:
        await retrieveHackerNews();
        break;
      default:
        await retrieveNewsData();
    }
  }, [provider, retrieveHackerNews, retrieveNewsData]);

  // Init HackerNews
  useEffect(() => {
    if (provider === NewsProvider.HACKER_NEWS && !hackerNewsArticlesLength) {
      retrieveHackerNews();
    }
  }, [hackerNewsArticlesLength, provider, retrieveHackerNews]);

  // Init NewsData
  useEffect(() => {
    if (provider === NewsProvider.NEWS_DATA && !newsDataArticlesLength) {
      retrieveNewsData();
    }
  }, [
    hackerNewsArticlesLength,
    newsDataArticlesLength,
    provider,
    retrieveNewsData,
  ]);

  return (
    <div className="size-full flex flex-col gap-2">
      <Card size="xs">
        <div className="w-full px-3 flex items-center justify-between">
          <div
            onClick={toggleProvider}
            className="shrink-0 flex items-center text-xl font-black cursor-pointer"
          >
            <span className="mr-3 -translate-y-px">{provider}</span>
            <span className="text-muted/70 tracking-wider">
              {isHackerNewsArticles ? hackerNewsArticlesLength : null}
              {isNewsDataArticles ? newsDataArticlesLength : null}
            </span>
          </div>

          {isUpdBtn ? (
            <UpdateButton loading={isFetching} onUpdate={fetchNews} />
          ) : isFetching ? (
            <Loading />
          ) : null}
        </div>
      </Card>

      {isNewsDataArticles ? (
        <ContentBox
          className={cn(
            'columns-1 gap-2',
            isExtraColumn ? 'xl:columns-2' : 'lg:columns-2 xl:columns-3'
          )}
          loading={isNewsDataFetching}
          ref={newsDataScrollViewportRef}
        >
          {newsDataArticles?.map((d) => (
            <NewsCard
              title={d.title}
              link={d.link}
              category={d.category}
              description={d.description}
              key={d.article_id}
            />
          ))}
        </ContentBox>
      ) : null}

      {isHackerNewsArticles ? (
        <ContentBox
          className={cn(
            'columns-1 gap-2',
            isExtraColumn ? 'xl:columns-2' : 'lg:columns-2 xl:columns-3'
          )}
          loading={isHackerNewsFetching}
          ref={hackerNewsScrollViewportRef}
        >
          {hackerNewsArticles?.map((d) => (
            <NewsCard title={d.title} link={d.url} key={d.id} />
          ))}
        </ContentBox>
      ) : null}
    </div>
  );
};

export default News;

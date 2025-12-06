'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import RefreshDataCard from '@/components/shared/RefreshDataCard';
import NewsCard from '@/features/news/components/NewsCard';
// import { allowNewsDataArticlesUpdate } from '@/features/scraper/helpers';
import { useStore } from '@/store';

const NewsDataArticles = () => {
  const newsDataArticles = useStore((state) => state.newsDataArticles);
  const fetchNewsData = useStore((state) => state.fetchNewsData);
  // const newsDataNextPage = useStore((state) => state.newsDataNextPage);
  // const newsDataTimestamp = useStore((state) => state.newsDataTimestamp);
  // const isNewsDataFetching = useStore((state) => state.isNewsDataFetching);
  // const isNewsDataError = useStore((state) => state.isNewsDataError);

  const [mounted, setMounted] = useState(false);

  // Prevent multiple calls
  const initializedRef = useRef(false);

  // Wait for client-side mount
  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  // const updateAllowed = allowNewsDataArticlesUpdate(
  //   newsDataArticles,
  //   newsDataTimestamp
  // );
  const updateAllowed = true;

  const fetchData = useCallback(async () => {
    if (!updateAllowed) return;

    const success = await fetchNewsData();
    if (!success) {
      toast('Unable to retrieve news from NewsData.io');
    }
  }, [fetchNewsData, updateAllowed]);

  // Init data on mount
  useEffect(() => {
    if (!mounted || initializedRef.current) return;

    initializedRef.current = true;

    fetchData();
  }, [mounted, fetchData]);

  // useEffect(() => {
  //   console.log('newsDataNextPage', newsDataNextPage);
  // }, [newsDataNextPage]);

  if (!newsDataArticles || !newsDataArticles.length) return null;

  return (
    <>
      <RefreshDataCard
        allowed={updateAllowed}
        onRefresh={fetchData}
        title="Get News from NewsData.io"
      />
      {newsDataArticles.map((d) => (
        <NewsCard
          title={d.title}
          link={d.link}
          category={d.category}
          description={d.description}
          key={d.article_id}
        />
      ))}
    </>
  );
};

export default NewsDataArticles;

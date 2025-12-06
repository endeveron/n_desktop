export enum NewsProvider {
  NEWS_DATA = 'NewsData.io',
  HACKER_NEWS = 'Hacker News',
}

// NewsData

export interface NewsDataArticle {
  article_id: string;
  link: string;
  title: string;
  description?: string;
  content?: string;
  keywords?: string[] | null;
  creator?: string[] | null;
  language?: string;
  country?: string[] | null;
  category?: string[] | null;
  pubDate?: string;
  pubDateTZ?: string;
  image_url?: string | null;
  video_url?: string | null;

  source_id?: string;
  source_name?: string;
  source_priority?: number;
  source_url?: string;
  source_icon?: string | null;

  sentiment?: string;
  sentiment_stats?:
    | string
    | {
        negative: number;
        neutral: number;
        positive: number;
      };

  ai_tag?: string | string[] | null;
  ai_region?: string | string[] | null;
  ai_org?: string | string[] | null;
  ai_summary?: string | null;

  duplicate?: boolean;
}

export interface NewsDataSuccessResponse {
  status: 'success';
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

export interface NewsDataErrorResponse {
  status: 'error';
  results: {
    message: string;
    code: string;
  };
}

export type NewsDataAPIResponse =
  | NewsDataSuccessResponse
  | NewsDataErrorResponse;

export type NewsDataAPIResult = {
  articles: NewsDataArticle[];
  nextPage?: string;
};

// Hacker News

export type HackerNewsArticle = {
  by: string;
  descendants: number;
  id: number;
  kids?: number[];
  score: number;
  time: number;
  title: string;
  type: string;
  url?: string;
  text?: string;
};

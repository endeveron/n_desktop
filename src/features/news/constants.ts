export const NEWS_DESCRIPTION_MAX_LENGTH = 500;

export const GET_NEWS_BTN_LABEL = 'Get News';
export const UPDATE_NEWS_BTN_LABEL = 'Update';

// NewsData API
export const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY as string;
// export const NEWSDATA_UPD_INTERVAL = 5 * MINUTE;
export const NEWSDATA_FETCH_ATTEMPTS = 2; // Attempts if request failed
export const NEWSDATA_FETCH_ITERATIONS = 2; // API allows to retrieve only 20 articles per request
export const NEWSDATA_EXCLUDE_DOMAINS = [
  'buffalonews.com',
  'lacrossetribune.com',
  'dailybreeze.com',
  'nptelegraph.com',
];

// Hacker News API
export const HACKERNEWS_FETCH_LIMIT = 48; // Stories number per request
export const HACKERNEWS_FETCH_ATTEMPTS = 2; // Attempts if request failed

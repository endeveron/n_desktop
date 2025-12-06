const APP_ID = process.env.NEXT_PUBLIC_APP_ID as string;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
const ASSETS_URL = process.env.NEXT_PUBLIC_ASSETS_URL as string;
const STATS_URL = process.env.NEXT_PUBLIC_STATS_URL as string;

const DB_BASE_CONNECTION_STRING = process.env
  .DB_BASE_CONNECTION_STRING as string;
const DB_NOTES_CONNECTION_STRING = process.env
  .DB_NOTES_CONNECTION_STRING as string;

const AUTH_SECRET = process.env.DB_BASE_CONNECTION_STRING as string;
const ENCRYPTION_PASSPHRASE = process.env.ENCRYPTION_PASSPHRASE as string;

const EMAIL_JWT = process.env.EMAIL_JWT as string;
const NODEMAILER_USER = process.env.NODEMAILER_USER as string;
const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD as string;

const STATE_KEY = process.env.NEXT_PUBLIC_STATE_KEY as string;

// Routes
const SIGNIN_REDIRECT = '/signin';
const SIGNUP_REDIRECT = '/signup';
const DEFAULT_REDIRECT = '/'; // after user signed in.

export {
  APP_ID,
  BASE_URL,
  ASSETS_URL,
  STATS_URL,
  DB_BASE_CONNECTION_STRING,
  DB_NOTES_CONNECTION_STRING,
  AUTH_SECRET,
  ENCRYPTION_PASSPHRASE,
  EMAIL_JWT,
  NODEMAILER_USER,
  NODEMAILER_PASSWORD,
  STATE_KEY,
  SIGNIN_REDIRECT,
  SIGNUP_REDIRECT,
  DEFAULT_REDIRECT,
};

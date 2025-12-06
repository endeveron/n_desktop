import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto';
import { twMerge } from 'tailwind-merge';

const alphanumCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const MINUTE = 60 * 1000;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a cryptographically secure random code of a specified length using alphanumeric characters.
 * @param [length=8] - The code length. Default is 8 characters.
 * @returns A randomly generated code.
 */
export function generateCode(length = 8) {
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % alphanumCharset.length;
    code += alphanumCharset[index];
  }
  return code;
}

export function createTypedMap<K extends string, V>(
  entries: readonly (readonly [K, V])[]
): Map<K, V> {
  return new Map(entries);
}

export function defineEntries<const K extends string>(
  entries: readonly (readonly [K, { light: string; dark: string }])[]
) {
  return entries;
}

/**
 * Pauses execution for the given number of milliseconds.
 * @param ms - Number of milliseconds to wait
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns a random string from the provided array.
 * @param arr - An array of string to choose from.
 * @returns A randomly selected item from the array.
 */
export function getRandomString(arr: string[]): string | null {
  if (arr.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

/**
 * Wraps an async operation with a time limit.
 * Returns true if operation completed within limit, false if exceeded.
 */
export async function withTimeLimit<T>(
  fn: () => Promise<T>,
  timeLimit: number
): Promise<boolean> {
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve(false), timeLimit)
  );
  const operation = fn().then(() => true);

  return Promise.race([operation, timeout]) as Promise<boolean>;
}

export function logWithTime(msg: string): void {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const millis = now.getMilliseconds().toString().padStart(3, '0');

  console.log(`${msg} [${hours}:${minutes}:${seconds}.${millis}]`);
}

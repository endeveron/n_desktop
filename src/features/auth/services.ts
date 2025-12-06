import { STATS_URL } from '@/constants';
import { Credentials } from '@/features/auth/types';
import { APIResult } from '@/types';

export const handleStatistics = async ({
  appId,
  credentials,
}: {
  appId: string;
  credentials: Credentials;
}): Promise<APIResult<boolean>> => {
  try {
    const response = await fetch(STATS_URL, {
      method: 'POST',
      body: JSON.stringify({
        appId,
        ...credentials,
      }),
    });
    const statisticsRes = await response.json();
    if (!statisticsRes?.data?.success) {
      return { data: false };
    }

    return { data: true };
  } catch (err: unknown) {
    console.error(err);
    return { data: false };
  }
};

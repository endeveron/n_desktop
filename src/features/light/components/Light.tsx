'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/shadcn/Button';
import AutoCounter from '@/components/shared/AutoCounter';
import { Card } from '@/components/shared/Card';
import Loading from '@/components/shared/Loading';
import UpdateButton from '@/components/shared/UpdateButton';
import LightSchedule from '@/features/light/components/LightSchedule';
import { shouldRefetch } from '@/features/light/helpers';
import { useStore } from '@/store';
import {
  DATA_ERROR,
  FETCHING_DATA_MESSAGE,
  GET_LIGHT_DATA_BTN_LABEL,
  LIGHT_DATA_UPD_AT_MESSAGE,
} from '@/translations/en';
import { cn } from '@/utils';

const Light = () => {
  const lightData = useStore((state) => state.lightData);
  const isLightFetching = useStore((state) => state.isLightFetching);
  const fetchLightData = useStore((state) => state.fetchLightData);
  const lightTimestamp = useStore((state) => state.lightTimestamp);
  const isLightInitialized = useStore((state) => state.isLightInitialized);
  const resetLightDataInitialized = useStore(
    (state) => state.resetLightDataInitialized
  );

  const [mounted, setMounted] = useState(false);

  const lastUpdateRaw = lightData?.lastUpdate;
  const lastUpdate = useMemo(() => {
    if (!lastUpdateRaw) return null;

    const arr = lastUpdateRaw.split(' ');
    if (!arr.length || arr.length !== 2) return null;

    return {
      date: arr[0],
      time: arr[1],
    };
  }, [lastUpdateRaw]);

  // Wait for client-side mount
  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  const retrieveData = useCallback(async () => {
    const success = await fetchLightData();
    if (!success) {
      toast(DATA_ERROR);
    }
  }, [fetchLightData]);

  const shouldUpdate = useMemo(() => {
    const updateNeed = shouldRefetch({ lightData, lightTimestamp });
    if (updateNeed) {
      resetLightDataInitialized();
    }

    return updateNeed;
  }, [lightData, lightTimestamp, resetLightDataInitialized]);

  // Init data on mount
  useEffect(() => {
    if (!mounted || isLightInitialized) return;

    if (shouldUpdate) {
      retrieveData();
    }
  }, [mounted, shouldUpdate, isLightInitialized, retrieveData]);

  if (!lightData) {
    return (
      <Card className="h-168">
        <Loading />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col flex-center py-3 select-none">
      {lightData.weekSchedule ? (
        <div className={cn('trans-o', isLightFetching && 'opacity-20')}>
          <LightSchedule data={lightData.weekSchedule} />
        </div>
      ) : (
        <Card className="h-150">
          <Loading />
        </Card>
      )}

      <div className="h-8 mt-4 w-full px-3 flex items-center justify-between">
        {isLightFetching ? (
          <div className="flex flex-1 items-center gap-2 pl-1 text-xs font-semibold tracking-wider">
            <AutoCounter loading={isLightFetching} />
            <span className="text-muted cursor-default">
              {FETCHING_DATA_MESSAGE}
            </span>
          </div>
        ) : lastUpdate ? (
          <div className="pl-0.5 flex gap-2 text-[10px] text-muted/70 font-bold tracking-wider cursor-default">
            <span className="uppercase">{LIGHT_DATA_UPD_AT_MESSAGE}</span>
            <span>{lastUpdate.date}</span>
            <span>{lastUpdate.time}</span>
          </div>
        ) : null}

        {lightData.weekSchedule ? (
          <UpdateButton loading={isLightFetching} onUpdate={retrieveData} />
        ) : (
          <Button onClick={retrieveData} size="sm" variant="outline">
            {GET_LIGHT_DATA_BTN_LABEL}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Light;

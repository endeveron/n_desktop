'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/shadcn/Button';
import { Card } from '@/components/shared/Card';
import Loading from '@/components/shared/Loading';
import AirQualitySensor from '@/features/air-quality/components/AirQualitySensor';
import { AIR_QUALITY_UPD_INTERVAL } from '@/features/air-quality/constants';
import {
  allowAirQualityUpdate,
  getAirQualityCategoryData,
} from '@/features/air-quality/helpers';
import { useStore } from '@/store';
import { DATA_ERROR, RETRIEVE_DATA } from '@/translations/en';
import { cn } from '@/utils';

const AirQuality = () => {
  const airQualityData = useStore((state) => state.airQualityData);
  const airQualityTimestamp = useStore((state) => state.airQualityTimestamp);
  const isAirQualityFetching = useStore((state) => state.isAirQualityFetching);
  const fetchAirQualityData = useStore((state) => state.fetchAirQualityData);
  const isAirQualityError = useStore((state) => state.isAirQualityError);

  const [mounted, setMounted] = useState(false);

  // Prevent multiple calls
  const initializedRef = useRef(false);

  const updateAllowed = useMemo(
    () => allowAirQualityUpdate(airQualityData, airQualityTimestamp),
    [airQualityData, airQualityTimestamp]
  );

  // Wait for client-side mount
  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  const fetchData = useCallback(async () => {
    if (!updateAllowed) return;

    const success = await fetchAirQualityData();

    if (!success) {
      toast(DATA_ERROR);
    }
  }, [fetchAirQualityData, updateAllowed]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchData();
    }
  };

  // Init data on mount
  useEffect(() => {
    if (
      !mounted || // Component not ready
      initializedRef.current || // Already initialized
      (airQualityData && !updateAllowed) // Data received and stored in the store, Auto-refresh interval not reached
    ) {
      return;
    }

    initializedRef.current = true;
    fetchData();
  }, [airQualityData, fetchData, mounted, updateAllowed]);

  // Auto-refresh interval
  useEffect(() => {
    if (!mounted) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, AIR_QUALITY_UPD_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchData, mounted]);

  if (!airQualityData || isAirQualityFetching) {
    return (
      <Card size="xs">
        <Loading />
      </Card>
    );
  }

  return (
    <Card
      size="xs"
      onKeyDown={handleKeyDown}
      focusByTab
      className={cn(
        'flex-center',
        isAirQualityFetching &&
          'opacity-40 pointer-events-none cursor-not-allowed'
      )}
      aria-label={`Refresh data`}
    >
      {airQualityData ? (
        <div className="anim-fade flex gap-1">
          {airQualityData.overall ? (
            <div
              onClick={fetchData}
              className={cn(
                'flex-center text-xl font-black tracking-wider cursor-default -translate-y-px',
                updateAllowed && 'cursor-pointer'
              )}
              title={updateAllowed ? 'Update' : ''}
            >
              <div
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor: getAirQualityCategoryData(
                    airQualityData.overall.categoryId
                  )!.color,
                }}
              />
              <span className="mr-4 ml-2">{airQualityData.overall.aqi}</span>
            </div>
          ) : null}

          <div className="flex justify-center flex-col">
            {airQualityData.pm25 ? (
              <AirQualitySensor {...airQualityData.pm25} particleSize="2.5" />
            ) : null}

            {airQualityData.pm10 ? (
              <AirQualitySensor {...airQualityData.pm10} particleSize="10" />
            ) : null}

            {/* {airQualityData.overall?.categoryId ? (
              <div className="mt-1.25 text-[10px] uppercase font-semibold">
                {
                  getAirQualityCategoryData(airQualityData.overall.categoryId)
                    .label
                }
              </div>
            ) : null} */}
          </div>
        </div>
      ) : isAirQualityError ? (
        <div className="anim-fade my-8 flex-center">
          <Button onClick={fetchData} variant="outline">
            {RETRIEVE_DATA}
          </Button>
        </div>
      ) : (
        <Loading />
      )}
    </Card>
  );
};

export default AirQuality;

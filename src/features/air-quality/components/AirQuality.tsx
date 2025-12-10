'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/shadcn/Button';
import { Card } from '@/components/shared/Card';
import Loading from '@/components/shared/Loading';
import MainMenu from '@/components/shared/MainMenu';
import AirQualitySensor from '@/features/air-quality/components/AirQualitySensor';
import { AIR_QUALITY_UPD_INTERVAL } from '@/features/air-quality/constants';
import {
  allowAirQualityUpdate,
  getAirQualityCategoryData,
} from '@/features/air-quality/helpers';
import { useStore } from '@/store';
import { DATA_ERROR, RETRIEVE_DATA } from '@/translations/en';
import { cn } from '@/utils';

interface AirQualityProps {
  isMobile?: boolean;
}

const AirQuality = ({ isMobile }: AirQualityProps) => {
  const airQualityData = useStore((state) => state.airQualityData);
  const airQualityTimestamp = useStore((state) => state.airQualityTimestamp);
  const isAirQualityFetching = useStore((state) => state.isAirQualityFetching);
  const fetchAirQualityData = useStore((state) => state.fetchAirQualityData);
  const isAirQualityError = useStore((state) => state.isAirQualityError);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  const fetchData = useCallback(async () => {
    const updateAllowed = allowAirQualityUpdate(
      airQualityData,
      airQualityTimestamp
    );

    if (!updateAllowed || isAirQualityFetching) return;

    const success = await fetchAirQualityData();
    if (!success) {
      toast(DATA_ERROR);
    }
  }, [
    fetchAirQualityData,
    airQualityData,
    airQualityTimestamp,
    isAirQualityFetching,
  ]);

  const handleUpdate = () => {
    fetchData();
  };

  // Init data on mount - schedule fetch after render
  useEffect(() => {
    if (!mounted) return;

    // Fetch if no data exists OR if update is allowed
    if (!airQualityData) {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, airQualityData]);

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
      onClick={handleUpdate}
      className={cn(
        'flex items-center gustify-between',
        isAirQualityFetching && 'opacity-40 pointer-events-none cursor-progress'
      )}
      aria-label={`Refresh data`}
    >
      {isMobile ? (
        <div className="ml-2 shrink-0">
          <MainMenu />
        </div>
      ) : null}

      <div className="flex-center flex-1">
        {airQualityData ? (
          <div className="anim-fade flex gap-1">
            {airQualityData.overall ? (
              <div
                onClick={fetchData}
                className={cn(
                  'flex-center text-xl font-black tracking-wider cursor-default'
                )}
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
      </div>
    </Card>
  );
};

export default AirQuality;

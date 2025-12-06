'use server';

import { calculateAQIFromSensorData } from '@/features/air-quality/helpers';
import {
  AirQualityApiItem,
  AirQualityData,
  SensorData,
} from '@/features/air-quality/types';
import { ServerActionResult } from '@/types';

const AIR_QUALITY_API =
  'https://data.sensor.community/airrohr/v1/sensor/58978/';

export const getSensorData = async (): Promise<
  ServerActionResult<SensorData>
> => {
  try {
    const res = await fetch(AIR_QUALITY_API, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return {
        success: false,
        error: new Error(`API responded with status ${res.status}`),
      };
    }

    const json: AirQualityApiItem[] = await res.json();

    if (json.length === 0) {
      return {
        success: false,
        error: new Error('API returned empty array'),
      };
    }

    const latest = json[0];

    const pm10Entry = latest.sensordatavalues.find(
      (v) => v.value_type === 'P1'
    );
    const pm25Entry = latest.sensordatavalues.find(
      (v) => v.value_type === 'P2'
    );

    if (!pm10Entry || !pm25Entry) {
      return {
        success: false,
        error: new Error('Missing PM entries in data'),
      };
    }

    const data: SensorData = {
      pm10: Number(pm10Entry.value),
      pm25: Number(pm25Entry.value),
      timestamp: latest.timestamp,
    };

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Unknown error'),
    };
  }
};

export const getAirQuality = async (): Promise<
  ServerActionResult<AirQualityData>
> => {
  const apiRes = await getSensorData();
  if (!apiRes.success) {
    return {
      success: false,
      error: apiRes.error,
    };
  }

  if (!apiRes.data) {
    return {
      success: false,
      error: { message: 'Unable to retrieve air sensor data' },
    };
  }

  const data = calculateAQIFromSensorData(apiRes.data);

  return {
    success: true,
    data,
  };
};

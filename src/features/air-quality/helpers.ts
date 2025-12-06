import { AIR_QUALITY_UPD_INTERVAL } from '@/features/air-quality/constants';
import { AirQualityData, SensorData } from '@/features/air-quality/types';

export interface AQIBreakpoint {
  aqiLow: number;
  aqiHigh: number;
  concLow: number;
  concHigh: number;
  category: string;
}

// EPA AQI Breakpoints for PM2.5 (µg/m³)
const PM25_BREAKPOINTS: AQIBreakpoint[] = [
  { aqiLow: 0, aqiHigh: 50, concLow: 0.0, concHigh: 9.0, category: 'Good' },
  {
    aqiLow: 51,
    aqiHigh: 100,
    concLow: 9.1,
    concHigh: 35.4,
    category: 'Moderate',
  },
  {
    aqiLow: 101,
    aqiHigh: 150,
    concLow: 35.5,
    concHigh: 55.4,
    category: 'Unhealthy for Sensitive Groups',
  },
  {
    aqiLow: 151,
    aqiHigh: 200,
    concLow: 55.5,
    concHigh: 125.4,
    category: 'Unhealthy',
  },
  {
    aqiLow: 201,
    aqiHigh: 300,
    concLow: 125.5,
    concHigh: 225.4,
    category: 'Very Unhealthy',
  },
  {
    aqiLow: 301,
    aqiHigh: 500,
    concLow: 225.5,
    concHigh: 325.4,
    category: 'Hazardous',
  },
];

// EPA AQI Breakpoints for PM10 (µg/m³)
const PM10_BREAKPOINTS: AQIBreakpoint[] = [
  { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 54, category: 'Good' },
  {
    aqiLow: 51,
    aqiHigh: 100,
    concLow: 55,
    concHigh: 154,
    category: 'Moderate',
  },
  {
    aqiLow: 101,
    aqiHigh: 150,
    concLow: 155,
    concHigh: 254,
    category: 'Unhealthy for Sensitive Groups',
  },
  {
    aqiLow: 151,
    aqiHigh: 200,
    concLow: 255,
    concHigh: 354,
    category: 'Unhealthy',
  },
  {
    aqiLow: 201,
    aqiHigh: 300,
    concLow: 355,
    concHigh: 424,
    category: 'Very Unhealthy',
  },
  {
    aqiLow: 301,
    aqiHigh: 500,
    concLow: 425,
    concHigh: 604,
    category: 'Hazardous',
  },
];

/**
 * Truncates PM concentration to one decimal place (EPA guidance)
 */
function truncateConcentration(value: number): number {
  return Math.floor(value * 10) / 10;
}

/**
 * Calculates AQI using EPA linear interpolation formula
 */
function calculateAQI(
  concentration: number,
  breakpoints: AQIBreakpoint[]
): number {
  const truncated = truncateConcentration(concentration);

  // Find the appropriate breakpoint
  const breakpoint = breakpoints.find(
    (bp) => truncated >= bp.concLow && truncated <= bp.concHigh
  );

  if (!breakpoint) {
    // If concentration exceeds highest breakpoint, use hazardous range
    const lastBreakpoint = breakpoints[breakpoints.length - 1];
    if (truncated > lastBreakpoint.concHigh) {
      return 500; // Maximum AQI
    }
    return 0; // Below lowest breakpoint
  }

  const { aqiLow, aqiHigh, concLow, concHigh } = breakpoint;

  // EPA AQI Formula: Linear interpolation
  const aqi =
    ((aqiHigh - aqiLow) / (concHigh - concLow)) * (truncated - concLow) +
    aqiLow;

  return Math.round(aqi);
}

/**
 * Gets AQI category and color based on AQI value
 */
function getAQICategoryId(aqi: number): number {
  if (aqi <= 50) return 1;
  if (aqi <= 100) return 2;
  if (aqi <= 150) return 3;
  if (aqi <= 200) return 4;
  if (aqi <= 300) return 5;
  return 6;
}

export type AQIInfo = ReturnType<typeof getAQICategoryId>;

/**
 * Main function to calculate AQI from sensor data
 */
export function calculateAQIFromSensorData({
  pm10,
  pm25,
  timestamp,
}: SensorData) {
  if (!pm25 && !pm10) {
    throw new Error('No PM2.5 or PM10 data found in sensor readings');
  }

  const results: AirQualityData = {
    timestamp,
    overall: { aqi: 0, categoryId: getAQICategoryId(1), primary: '' },
  };

  // Calculate PM2.5 AQI
  if (pm25) {
    const concentration = pm25;
    const aqi = calculateAQI(concentration, PM25_BREAKPOINTS);
    results.pm25 = {
      concentration,
      aqi,
      categoryId: getAQICategoryId(aqi),
    };
  }

  // Calculate PM10 AQI
  if (pm10) {
    const concentration = pm10;
    const aqi = calculateAQI(concentration, PM10_BREAKPOINTS);
    results.pm10 = {
      concentration,
      aqi,
      categoryId: getAQICategoryId(aqi),
    };
  }

  // Overall AQI is the maximum of all pollutants
  const aqiValues = [results.pm25?.aqi, results.pm10?.aqi].filter(
    (v) => v !== undefined
  ) as number[];
  const maxAQI = Math.max(...aqiValues);

  results.overall = {
    aqi: maxAQI,
    categoryId: getAQICategoryId(maxAQI),
    primary: maxAQI === results.pm25?.aqi ? 'PM2.5' : 'PM10',
  };

  return results;
}

export const AirQualityCategoryDataMap: Map<
  number,
  {
    label: string;
    color: string;
  }
> = new Map([
  [
    1,
    {
      label: 'Good',
      color: '#00a434',
    },
  ],
  [
    2,
    {
      label: 'Moderate',
      color: '#f3a81f',
    },
  ],
  [
    3,
    {
      label: 'Unhealthy for Sensitive',
      color: '#f08216',
    },
  ],
  [
    4,
    {
      label: 'Unhealthy',
      color: '#fc3535',
    },
  ],
  [
    5,
    {
      label: 'Very Unhealthy',
      color: '#cf15b8',
    },
  ],
  [
    6,
    {
      label: 'Hazardous',
      color: '#851ee3',
    },
  ],
]);

export function allowAirQualityUpdate(
  airQualityData: AirQualityData | null,
  airQualityTimestamp: number | null
) {
  if (!airQualityData || !airQualityTimestamp) return true;
  return Date.now() - airQualityTimestamp > AIR_QUALITY_UPD_INTERVAL;
}

export function getAirQualityCategoryData(category: number): {
  label: string;
  color: string;
} {
  return AirQualityCategoryDataMap.get(category)!;
}

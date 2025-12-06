'use client';

import { getAirQualityCategoryData } from '@/features/air-quality/helpers';
import { AirQualitySensorData } from '@/features/air-quality/types';

export interface AirQualitySensorProps extends AirQualitySensorData {
  particleSize: string;
}

const AirQualitySensor = ({
  aqi,
  categoryId,
  concentration,
  particleSize,
}: AirQualitySensorProps) => {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="w-10 text-muted font-semibold">PM{particleSize}</span>

      <div
        className="w-2.5 h-2.5 rounded-full mr-px"
        style={{
          backgroundColor: getAirQualityCategoryData(categoryId)!.color,
        }}
      />

      <div className="flex w-24 min-w-0">
        <span className="font-bold w-6 shrink-0">{aqi}</span>

        <span className="text-muted font-semibold truncate min-w-0">
          {`${Math.round(concentration)} mkg/m³`}
        </span>
      </div>
    </div>
  );
};

export default AirQualitySensor;

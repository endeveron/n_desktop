type SensorValue = {
  value: string;
  value_type: 'P1' | 'P2' | string;
  id: number;
};

type SensorType = {
  manufacturer: string;
  name: string;
  id: number;
};

type SensorInfo = {
  sensor_type: SensorType;
  id: number;
  pin: string;
};

type LocationInfo = {
  country: string;
  latitude: string;
  altitude: string;
  exact_location: number;
  longitude: string;
  id: number;
  indoor: number;
};

export type AirQualityApiItem = {
  sensordatavalues: SensorValue[];
  sensor: SensorInfo;
  sampling_rate: number | null;
  location: LocationInfo;
  timestamp: string;
  id: number;
};

export type SensorData = {
  pm10: number; // P1
  pm25: number; // P2
  timestamp: string;
};

export type AirQualitySensorData = {
  concentration: number;
  aqi: number;
  categoryId: number;
};

export type AirQualityData = {
  pm25?: AirQualitySensorData;
  pm10?: AirQualitySensorData;
  overall: {
    aqi: number;
    categoryId: number;
    primary: string;
  };
  timestamp: string;
};

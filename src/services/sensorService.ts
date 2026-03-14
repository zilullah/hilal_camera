import { Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

export interface SensorData {
  azimuth: number;
  pitch: number;
  roll: number;
}

export const useDeviceOrientation = () => {
  const [data, setData] = useState<SensorData>({ azimuth: 0, pitch: 0, roll: 0 });

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const subscription = Magnetometer.addListener((result) => {
      let angle = Math.atan2(result.y, result.x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setData((prev) => ({ ...prev, azimuth: angle }));
    });

    return () => subscription.remove();
  }, []);

  return data;
};

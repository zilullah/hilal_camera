import * as Location from 'expo-location';

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

export const getCurrentLocation = async (): Promise<DeviceLocation> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission denied');
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude,
  };
};

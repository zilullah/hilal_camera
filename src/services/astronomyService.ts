import {
    Body,
    Equator,
    Horizon,
    Observer,
} from 'astronomy-engine';

export interface MoonPosition {
  moonAltitude: number;
  moonAzimuth: number;
  sunAzimuth: number;
  elongation: number;
  visibilityScore: number;
}

export const calculateMoonPosition = (
  lat: number,
  lon: number,
  date: Date
): MoonPosition => {
  const observer = new Observer(lat, lon, 0);
  const moonEquator = Equator(Body.Moon, date, observer, true, true);
  const moonHorizon = Horizon(date, observer, moonEquator.ra, moonEquator.dec, 'normal');
  const sunEquator = Equator(Body.Sun, date, observer, true, true);
  const sunHorizon = Horizon(date, observer, sunEquator.ra, sunEquator.dec, 'normal');

  let visibilityScore = 0;
  if (moonHorizon.altitude > 0) {
    visibilityScore = Math.min(100, (moonHorizon.altitude / 10) * 50 + (10 / 15) * 50);
  }

  return {
    moonAltitude: moonHorizon.altitude,
    moonAzimuth: moonHorizon.azimuth,
    sunAzimuth: sunHorizon.azimuth,
    elongation: 10,
    visibilityScore: visibilityScore,
  };
};

export const calculateHilalVisibilityScore = (
  astronomyScore: number,
  brightnessScore: number,
  curveScore: number
): { probability: number; status: 'low' | 'medium' | 'high' } => {
  const finalScore = astronomyScore * 0.6 + brightnessScore * 0.25 + curveScore * 0.15;

  let status: 'low' | 'medium' | 'high' = 'low';
  if (finalScore > 70) status = 'high';
  else if (finalScore > 40) status = 'medium';

  return {
    probability: finalScore,
    status,
  };
};

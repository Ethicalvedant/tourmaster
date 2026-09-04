import { useState, useEffect, useCallback } from 'react';

export interface UserLocationState {
  status: 'prompt' | 'granted' | 'denied' | 'locating';
  coords: { lat: number; lng: number } | null;
  city: string;
  weather: any | null;
  error: string | null;
  isLocationEnabled: boolean;
}

export function useLocationManager(defaultCity: string = 'Pune, Maharashtra') {
  const [locationState, setLocationState] = useState<UserLocationState>({
    status: 'prompt',
    coords: null,
    city: defaultCity,
    weather: null,
    error: null,
    isLocationEnabled: false,
  });

  const fetchWeatherForCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/weather/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Could not fetch live weather for coordinates:', e);
      return null;
    }
  }, []);

  const fetchIpLocation = useCallback(async () => {
    try {
      const res = await fetch('/api/location/ip-detect');
      const data = await res.json();
      if (data && data.lat && data.lng) {
        return {
          coords: { lat: data.lat, lng: data.lng },
          city: data.city || defaultCity
        };
      }
    } catch (e) {
      console.warn('IP location detection error:', e);
    }
    return {
      coords: { lat: 18.5204, lng: 73.8567 },
      city: defaultCity
    };
  }, [defaultCity]);

  // Explicit user-triggered location request
  const requestLocation = useCallback(() => {
    setLocationState(prev => ({ ...prev, status: 'locating', error: null }));

    if (!navigator.geolocation) {
      fetchIpLocation().then(async ({ coords, city }) => {
        const weather = await fetchWeatherForCoords(coords.lat, coords.lng);
        setLocationState({
          status: 'granted',
          coords,
          city: weather?.city || city,
          weather,
          error: null,
          isLocationEnabled: true,
        });
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        const weather = await fetchWeatherForCoords(latitude, longitude);
        const detectedCity = weather?.city || `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;

        setLocationState({
          status: 'granted',
          coords,
          city: detectedCity,
          weather,
          error: null,
          isLocationEnabled: true,
        });

        try {
          localStorage.setItem('tourmaster_location_enabled', 'true');
          localStorage.setItem('tourmaster_last_city', detectedCity);
        } catch (e) {}
      },
      async (err) => {
        console.warn('Browser GPS permission not granted, falling back to live network geolocation:', err.message);
        const { coords, city } = await fetchIpLocation();
        const weather = await fetchWeatherForCoords(coords.lat, coords.lng);
        const detectedCity = weather?.city || city;

        setLocationState({
          status: 'granted',
          coords,
          city: detectedCity,
          weather,
          error: null,
          isLocationEnabled: true,
        });

        try {
          localStorage.setItem('tourmaster_location_enabled', 'true');
          localStorage.setItem('tourmaster_last_city', detectedCity);
        } catch (e) {}
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0,
      }
    );
  }, [defaultCity, fetchWeatherForCoords, fetchIpLocation]);

  // Switch location ON / OFF
  const toggleLocationSwitch = useCallback((enable: boolean) => {
    if (enable) {
      requestLocation();
    } else {
      try {
        localStorage.setItem('tourmaster_location_enabled', 'false');
      } catch (e) {}
      setLocationState({
        status: 'prompt',
        coords: null,
        city: defaultCity,
        weather: null,
        error: null,
        isLocationEnabled: false,
      });
    }
  }, [defaultCity, requestLocation]);

  // Do not take automatic access on initial load; wait for user to switch it on when asked
  // (No auto-executing useEffect)

  return {
    ...locationState,
    requestLocation,
    toggleLocationSwitch,
  };
}

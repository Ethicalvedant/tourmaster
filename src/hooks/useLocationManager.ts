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
  // Check if previously switched on by user
  const isPreviouslyEnabled = typeof window !== 'undefined' && localStorage.getItem('tourmaster_location_enabled') === 'true';

  const [locationState, setLocationState] = useState<UserLocationState>({
    status: isPreviouslyEnabled ? 'locating' : 'prompt',
    coords: null,
    city: defaultCity,
    weather: null,
    error: null,
    isLocationEnabled: isPreviouslyEnabled,
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

  // Explicit user-triggered location request
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState(prev => ({
        ...prev,
        status: 'denied',
        isLocationEnabled: false,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocationState(prev => ({ ...prev, status: 'locating', error: null }));

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
        console.warn('Geolocation permission not granted or timed out:', err.message);
        const fallbackWeather = await fetchWeatherForCoords(18.5204, 73.8567);
        setLocationState({
          status: err.code === 1 ? 'denied' : 'prompt',
          coords: { lat: 18.5204, lng: 73.8567 },
          city: defaultCity,
          weather: fallbackWeather,
          error: err.message,
          isLocationEnabled: false,
        });
        try {
          localStorage.setItem('tourmaster_location_enabled', 'false');
        } catch (e) {}
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [defaultCity, fetchWeatherForCoords]);

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

  // Automatically prompt/request location whenever anybody runs or starts the project
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...locationState,
    requestLocation,
    toggleLocationSwitch,
  };
}

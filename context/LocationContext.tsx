import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type UserLocation = {
  latitude: number;
  longitude: number;
};

type LocationContextType = {
  location: UserLocation | null;
  status: 'idle' | 'granted' | 'denied' | 'loading';
  requestLocation: () => Promise<boolean>;
};

const defaultLocation: UserLocation = {
  latitude: 48.8566,
  longitude: 2.3522,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<UserLocation | null>(defaultLocation);
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied' | 'loading'>('idle');

  const requestLocation = async () => {
    try {
      setStatus('loading');
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== 'granted') {
        setStatus('denied');
        return false;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setStatus('granted');
      return true;
    } catch (error) {
      console.error('Erreur localisation :', error);
      setStatus('denied');
      return false;
    }
  };

  useEffect(() => {
    const bootstrapLocation = async () => {
      try {
        const { status: permissionStatus } = await Location.getForegroundPermissionsAsync();
        if (permissionStatus === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          setStatus('granted');
        } else {
          setStatus('idle');
        }
      } catch (error) {
        console.error('Erreur initiale localisation :', error);
        setStatus('idle');
      }
    };

    bootstrapLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, status, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};

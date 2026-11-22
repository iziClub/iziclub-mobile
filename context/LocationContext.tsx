import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type UserLocation = {
  latitude: number;
  longitude: number;
};

type LocationContextType = {
  location: UserLocation | null;
  status: 'idle' | 'granted' | 'denied' | 'loading';
  requestLocation: () => Promise<UserLocation | null>;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied' | 'loading'>('idle');

  const requestLocation = async () => {
    try {
      setStatus('loading');
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== 'granted') {
        setStatus('denied');
        setLocation(null);
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(nextLocation);
      setStatus('granted');
      return nextLocation;
    } catch (error) {
      console.error('Erreur localisation :', error);
      setStatus('denied');
      return null;
    }
  };

  useEffect(() => {
    requestLocation();
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

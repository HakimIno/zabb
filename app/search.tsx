import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SearchScreen } from '@/src/screens/search/SearchScreen';
import { LocationResult } from '@/src/services/geocoding';

export default function Search() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse current location from params
  const currentLocation = params.currentLocation 
    ? params.currentLocation.split(',').map(Number) as [number, number]
    : undefined;

  const handleLocationSelect = (location: LocationResult) => {
    // Navigate back to home with selected location
    router.push({
      pathname: '/(tabs)',
      params: {
        selectedDestination: JSON.stringify(location)
      }
    });
  };

  return (
    <SearchScreen 
      currentLocation={currentLocation}
      onLocationSelect={handleLocationSelect}
    />
  );
}

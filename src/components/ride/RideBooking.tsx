import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useColorScheme } from 'nativewind';
import { LocationSearch } from '../location/LocationSearch';
import { SimpleMarker } from '../location/SimpleMarker';
import { geocodingService, LocationResult } from '@/src/services/geocoding';
import { Icon } from '@/src/components/ui/icon';
import { Text } from '@/src/components/ui/text';
import { 
  SearchIcon, 
  NavigationIcon, 
  CarIcon,
  XIcon,
  CheckIcon
} from 'lucide-react-native';

interface RideBookingProps {
  initialLocation?: [number, number];
  initialZoom?: number;
}

export function RideBooking({ 
  initialLocation = [100.5018, 13.7563], // กรุงเทพฯ
  initialZoom = 15 
}: RideBookingProps) {
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<LocationResult | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm' | 'booked'>('select');

  // ตั้งค่าตำแหน่งเริ่มต้น
  useEffect(() => {
    setCurrentLocation(initialLocation);
  }, [initialLocation]);

  // จัดการการแตะบนแผนที่เพื่อเลือกจุดหมาย
  const handleMapPress = async (event: any) => {
    if (!isSelectingDestination) return;
    
    const { geometry } = event;
    const coordinate: [number, number] = geometry.coordinates;
    
    try {
      // แปลงพิกัดเป็นชื่อสถานที่
      const location = await geocodingService.reverseGeocode(coordinate);
      
      if (location) {
        setDestination(location);
        setIsSelectingDestination(false);
        setShowSearch(false);
        setBookingStep('confirm');
      }
    } catch (error) {
      console.error('Error selecting destination:', error);
    }
  };

  // จัดการการเลือกสถานที่จากการค้นหา
  const handleLocationSelect = (location: LocationResult) => {
    setDestination(location);
    setShowSearch(false);
    setIsSelectingDestination(false);
    setBookingStep('confirm');
    
    // เคลื่อนที่แผนที่ไปยังจุดหมาย
    cameraRef.current?.setCamera({
      centerCoordinate: location.coordinates,
      zoomLevel: 16,
      animationDuration: 1000,
    });
  };

  // เริ่มการเลือกจุดหมาย
  const startDestinationSelection = () => {
    setIsSelectingDestination(true);
    setBookingStep('select');
    setShowSearch(true);
  };

  // ยกเลิกการเลือกจุดหมาย
  const cancelSelection = () => {
    setDestination(null);
    setIsSelectingDestination(false);
    setShowSearch(false);
    setBookingStep('select');
  };

  // ยืนยันการจองรถ
  const confirmBooking = () => {
    Alert.alert(
      'ยืนยันการจองรถ',
      `จุดหมาย: ${destination?.name}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ยืนยัน', 
          onPress: () => {
            setBookingStep('booked');
            Alert.alert('สำเร็จ!', 'ได้ทำการจองรถเรียบร้อยแล้ว\nรถจะมาถึงในอีก 5-10 นาที');
          }
        }
      ]
    );
  };

  // กลับไปตำแหน่งปัจจุบัน
  const goToCurrentLocation = () => {
    if (currentLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: currentLocation,
        zoomLevel: 16,
        animationDuration: 1000,
      });
    }
  };

  return (
    <View className="flex-1">
      {/* Map */}
      <Mapbox.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={colorScheme === 'dark' ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={currentLocation || initialLocation}
          zoomLevel={initialZoom}
        />
        
        {/* Current Location Marker */}
        {currentLocation && (
          <SimpleMarker
            id="current-location"
            coordinate={currentLocation}
            type="current"
          />
        )}
        
        {/* Destination Marker */}
        {destination && (
          <SimpleMarker
            id="destination"
            coordinate={destination.coordinates}
            type="destination"
          />
        )}
      </Mapbox.MapView>

      {/* Search Overlay */}
      {showSearch && (
        <View className="absolute top-16 left-4 right-4 z-10">
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            currentLocation={currentLocation || undefined}
            placeholder="ค้นหาจุดหมาย..."
          />
        </View>
      )}

      {/* Control Buttons */}
      <View className="absolute bottom-6 right-4 space-y-3">
        {/* Current Location Button */}
        <TouchableOpacity
          onPress={goToCurrentLocation}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg"
        >
          <Icon as={NavigationIcon} className="size-6 text-gray-700 dark:text-gray-300" />
        </TouchableOpacity>
      </View>

      {/* Booking Interface */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl">
        {bookingStep === 'select' && (
          <View className="p-6">
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              เลือกจุดหมาย
            </Text>
            <TouchableOpacity
              onPress={startDestinationSelection}
              className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center"
            >
              <Icon as={SearchIcon} className="size-5 text-white mr-2" />
              <Text className="text-white font-semibold text-lg">
                ค้นหาหรือแตะบนแผนที่
              </Text>
            </TouchableOpacity>
            
            {isSelectingDestination && (
              <View className="mt-4 bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
                <Text className="text-blue-700 dark:text-blue-300 text-center">
                  แตะบนแผนที่เพื่อเลือกจุดหมาย
                </Text>
              </View>
            )}
          </View>
        )}

        {bookingStep === 'confirm' && destination && (
          <View className="p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ยืนยันการจองรถ
              </Text>
              <TouchableOpacity onPress={cancelSelection}>
                <Icon as={XIcon} className="size-6 text-gray-500" />
              </TouchableOpacity>
            </View>
            
            <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                จุดหมาย
              </Text>
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                {destination.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {destination.address}
              </Text>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={cancelSelection}
                className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-xl p-4"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold text-center">
                  ยกเลิก
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={confirmBooking}
                className="flex-1 bg-green-500 rounded-xl p-4 flex-row items-center justify-center"
              >
                <Icon as={CarIcon} className="size-5 text-white mr-2" />
                <Text className="text-white font-semibold">
                  จองรถ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {bookingStep === 'booked' && destination && (
          <View className="p-6">
            <View className="items-center mb-4">
              <View className="bg-green-100 dark:bg-green-900 rounded-full p-3 mb-3">
                <Icon as={CheckIcon} className="size-8 text-green-600 dark:text-green-400" />
              </View>
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                จองรถสำเร็จ!
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                รถจะมาถึงในอีก 5-10 นาที
              </Text>
            </View>
            
            <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                จุดหมาย
              </Text>
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                {destination.name}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => {
                setBookingStep('select');
                setDestination(null);
              }}
              className="bg-blue-500 rounded-xl p-4"
            >
              <Text className="text-white font-semibold text-center">
                จองรถใหม่
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Selection Instruction */}
      {isSelectingDestination && (
        <View className="absolute top-20 left-4 right-4 bg-blue-500 rounded-lg p-3">
          <Text className="text-white text-center font-medium">
            แตะบนแผนที่เพื่อเลือกจุดหมาย หรือใช้ช่องค้นหา
          </Text>
        </View>
      )}
    </View>
  );
}

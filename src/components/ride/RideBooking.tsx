import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Mapbox from '@rnmapbox/maps';
import { useColorScheme } from 'nativewind';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SimpleMarker } from '../location/SimpleMarker';
import { DraggableMarker } from '../location/DraggableMarker';
import { geocodingService, LocationResult } from '@/src/services/geocoding';
import { directionsService } from '@/src/services/directions';
import { Text } from '@/src/components/ui/text';
import { Icon } from '@/src/components/ui/icon';
import { XIcon, NavigationIcon, SearchIcon, ArrowRightIcon, MapPinIcon } from 'lucide-react-native';
import { RideTypeSelector } from './RideTypeSelector';
import { TripSummary } from './TripSummary';
import { DriverCard } from './DriverCard';
import { SearchStates } from './SearchStates';
// import { MapOverlay } from './MapOverlay';
import { RIDE_TYPES, PAYMENT_METHODS, MOCK_DRIVER } from './constants';
import { RideType, PaymentMethod, Driver, BookingStep } from './types';
import { Ionicons } from '@expo/vector-icons';
import LocationSelector from './LocationSelector';

interface RideBookingProps {
  initialLocation?: [number, number];
  initialZoom?: number;
  selectedDestination?: LocationResult | null;
  selectOnMap?: boolean;
}


export function RideBooking({
  initialLocation = [100.5018, 13.7563],
  initialZoom = 15,
  selectedDestination = null,
  selectOnMap = false
}: RideBookingProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Location states
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [pickupLocation, setPickupLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<LocationResult | null>(null);
  
  const [bottomSheetState, setBottomSheetState] = useState<{
    index: number;
    step: BookingStep;
    isSelectingDestination: boolean;
    isSelectingPickup: boolean;
  }>({
    index: 0,
    step: 'idle',
    isSelectingDestination: false,
    isSelectingPickup: false,
  });
  
  // Ride states
  const [selectedRideType, setSelectedRideType] = useState<RideType>(RIDE_TYPES[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  
  // Route states
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '96%'], []);

  // Helper functions for BottomSheet state management
  const updateBottomSheetState = (updates: Partial<typeof bottomSheetState>) => {
    setBottomSheetState(prev => ({ ...prev, ...updates }));
  };

  const snapToIndex = (index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
    updateBottomSheetState({ index });
  };

  // Subtle pulse animation
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.2}
      />
    ),
    []
  );

  useEffect(() => {
    setCurrentLocation(initialLocation);
    setPickupLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    if (selectedDestination) {
      setDestination(selectedDestination);
      updateBottomSheetState({ step: 'selecting' });
      snapToIndex(2);

      cameraRef.current?.setCamera({
        centerCoordinate: selectedDestination.coordinates,
        zoomLevel: 16,
        animationDuration: 1000,
      });
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (selectOnMap) {
      updateBottomSheetState({ 
        isSelectingDestination: true, 
        step: 'idle',
        index: 0 
      });
      snapToIndex(0);
    }
  }, [selectOnMap]);

  const handleMapPress = async (event: any) => {
    const { isSelectingDestination, isSelectingPickup } = bottomSheetState;
    if (!isSelectingDestination && !isSelectingPickup) return;

    const { geometry } = event;
    const coordinate: [number, number] = geometry.coordinates;

    try {
      if (isSelectingDestination) {
        const location = await geocodingService.reverseGeocode(coordinate);

        if (location) {
          setDestination(location);
          updateBottomSheetState({ 
            isSelectingDestination: false, 
            step: 'confirming' 
          });
          snapToIndex(1);

          // คำนวณเส้นทาง
          if (pickupLocation) {
            await calculateRoute(pickupLocation, location.coordinates);
          }
        }
      } else if (isSelectingPickup) {
        setPickupLocation(coordinate);
        updateBottomSheetState({ isSelectingPickup: false });

        // คำนวณเส้นทางใหม่หากมีปลายทาง
        if (destination) {
          await calculateRoute(coordinate, destination.coordinates);
        }
      }
    } catch (error) {
      console.error('Error selecting location:', error);
    }
  };

  const calculateRoute = async (from: [number, number], to: [number, number]) => {
    try {
      const directions = await directionsService.getDirections([from, to]);

      if (directions && directions.routes.length > 0) {
        const route = directions.routes[0];
        setRouteCoordinates(route.coordinates);
        setRouteDistance(directionsService.formatDistance(route.distance));
        setRouteDuration(directionsService.formatDuration(route.duration));

        // ปรับกล้องให้เห็นเส้นทางทั้งหมด
        const bounds = {
          ne: [
            Math.max(from[0], to[0]) + 0.01,
            Math.max(from[1], to[1]) + 0.01
          ] as [number, number],
          sw: [
            Math.min(from[0], to[0]) - 0.01,
            Math.min(from[1], to[1]) - 0.01
          ] as [number, number]
        };

        cameraRef.current?.fitBounds(bounds.ne, bounds.sw, [50, 50, 50, 300], 1000);
      } else {
        // ใช้การคำนวณแบบง่าย
        const estimate = directionsService.calculateEstimate(from, to);
        setRouteDistance(directionsService.formatDistance(estimate.distance));
        setRouteDuration(directionsService.formatDuration(estimate.duration));
        setRouteCoordinates([from, to]);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      // ใช้การคำนวณแบบง่าย
      const estimate = directionsService.calculateEstimate(from, to);
      setRouteDistance(directionsService.formatDistance(estimate.distance));
      setRouteDuration(directionsService.formatDuration(estimate.duration));
      setRouteCoordinates([from, to]);
    }
  };

  const handleLocationSelect = async (location: LocationResult) => {
    setDestination(location);
    updateBottomSheetState({ 
      isSelectingDestination: false, 
      step: 'selecting' 
    });
    snapToIndex(2);

    cameraRef.current?.setCamera({
      centerCoordinate: location.coordinates,
      zoomLevel: 16,
      animationDuration: 1000,
    });

    if (pickupLocation) {
      await calculateRoute(pickupLocation, location.coordinates);
    }
  };

  const handlePickupDrag = async (coordinate: [number, number]) => {
    setPickupLocation(coordinate);

    if (destination) {
      await calculateRoute(coordinate, destination.coordinates);
    }
  };

  const handleDestinationDrag = async (coordinate: [number, number]) => {
    try {
      const location = await geocodingService.reverseGeocode(coordinate);
      if (location) {
        setDestination(location);

        if (pickupLocation) {
          await calculateRoute(pickupLocation, coordinate);
        }
      }
    } catch (error) {
      console.error('Error updating destination:', error);
    }
  };

  // Simplified BottomSheet actions
  const startBookingFlow = () => {
    updateBottomSheetState({ step: 'idle' });
    bottomSheetRef.current?.snapToIndex(3);
  };

  const handleBottomSheetChange = (index: number) => {
    updateBottomSheetState({ index });
  };

  const confirmBooking = () => {
    updateBottomSheetState({ step: 'searching' });
    snapToIndex(1);

    setTimeout(() => {
      updateBottomSheetState({ step: 'found' });
    }, 3000);
  };

  const startRide = () => {
    updateBottomSheetState({ step: 'riding' });
    Alert.alert('Trip Started', 'Have a safe journey');
  };

  const cancelBooking = () => {
    setDestination(null);
    setRouteCoordinates([]);
    setRouteDistance('');
    setRouteDuration('');
    updateBottomSheetState({ 
      step: 'idle',
      isSelectingDestination: false,
      isSelectingPickup: false,
      index: 0
    });
    snapToIndex(0);
  };

  const selectPickupLocation = () => {
    updateBottomSheetState({ 
      isSelectingPickup: true,
      step: 'idle',
      index: 0
    });
    snapToIndex(0);
  };

  const selectDestination = () => {
    updateBottomSheetState({ 
      isSelectingDestination: true,
      step: 'idle',
      index: 0
    });
    snapToIndex(0);
  };


  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Map */}
      <Mapbox.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={colorScheme === 'dark' ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={currentLocation || initialLocation}
          zoomLevel={initialZoom}
        />

        {currentLocation && (
          <SimpleMarker
            id="current-location"
            coordinate={currentLocation}
            type="current"
          />
        )}

        {pickupLocation && (
          <DraggableMarker
            id="pickup-location"
            coordinate={pickupLocation}
            type="pickup"
            draggable={bottomSheetState.step === 'selecting' || bottomSheetState.step === 'confirming'}
            onDragEnd={handlePickupDrag}
          />
        )}

        {destination && (
          <DraggableMarker
            id="destination"
            coordinate={destination.coordinates}
            type="destination"
            draggable={bottomSheetState.step === 'selecting' || bottomSheetState.step === 'confirming'}
            onDragEnd={handleDestinationDrag}
          />
        )}

        {/* เส้นทาง */}
        {routeCoordinates.length > 0 && (
          <Mapbox.ShapeSource
            id="route"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates,
              },
            }}
          >
            <Mapbox.LineLayer
              id="route-line"
              style={{
                lineColor: '#3B82F6',
                lineWidth: 4,
                lineOpacity: 0.8,
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>

    

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={false}
        onChange={handleBottomSheetChange}
        backgroundStyle={{
          backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#ffffff',
        }}
        handleIndicatorStyle={{
          backgroundColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
          width: 32,
          height: 3,
        }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 16 }}>
          {/* Idle State - แสดงปุ่มค้นหาเมื่อ index 0 */}
          {bottomSheetState.step === 'idle' && bottomSheetState.index === 0 && (
            <TouchableOpacity
              onPress={startBookingFlow}
              className="flex flex-row items-center gap-3 bg-gray-100 dark:bg-neutral-900 p-3 mb-2 rounded-lg">
              <Ionicons name='search' size={24} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
              <Text className="text-lg font-light font-anuphan-semibold text-gray-900 dark:text-gray-100">
                อยากไปที่ไหนดี?
              </Text>
            </TouchableOpacity>
          )}

          {/* Location Selector - แสดงเมื่อ index 2 และ step idle */}
          {bottomSheetState.step === 'idle' && bottomSheetState.index >= 2 && (
            <LocationSelector
              onCancel={cancelBooking}
              onSelectPickupLocation={selectPickupLocation}
              onSelectDestination={selectDestination}
            />
          )}

          {/* Ride Selection */}
          {bottomSheetState.step === 'selecting' && (
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  Select ride
                </Text>
                <TouchableOpacity onPress={cancelBooking}>
                  <Icon as={XIcon} className="size-6 text-gray-400" />
                </TouchableOpacity>
              </View>

              <RideTypeSelector
                rideTypes={RIDE_TYPES}
                selectedRideType={selectedRideType}
                onSelectRideType={setSelectedRideType}
              />
            </View>
          )}

          {/* Trip Confirmation */}
          {bottomSheetState.step === 'confirming' && destination && (
            <View className="flex-1 py-6">
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  Confirm trip
                </Text>
                <TouchableOpacity onPress={cancelBooking}>
                  <Icon as={XIcon} className="size-6 text-gray-400" />
                </TouchableOpacity>
              </View>

              <TripSummary
                destination={destination}
                pickupLocation={pickupLocation}
                routeDistance={routeDistance}
                routeDuration={routeDuration}
                selectedRideType={selectedRideType}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPickupLocation={selectPickupLocation}
              />

              {/* Action Buttons */}
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={cancelBooking}
                  className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-2xl p-4"
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-light text-center text-lg">
                    ยกเลิก
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmBooking}
                  className="flex-2 bg-gray-900 dark:bg-gray-100 rounded-2xl p-4"
                >
                  <Text className="text-white dark:text-gray-900 font-medium text-center text-lg">
                    จองรถ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Search States */}
          <SearchStates
            bookingStep={bottomSheetState.step}
            pulseAnim={pulseAnim}
            onCancel={cancelBooking}
            onStartRide={startRide}
          />

          {/* Driver Found */}
          {bottomSheetState.step === 'found' && (
            <View className="flex-1 py-6">
              <DriverCard driver={MOCK_DRIVER} />

              {/* Action Buttons */}
              <TouchableOpacity
                onPress={startRide}
                className="bg-gray-900 dark:bg-gray-100 rounded-2xl p-5 mb-4"
              >
                <Text className="text-white dark:text-gray-900 font-medium text-center text-lg">
                  Start Trip
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={cancelBooking}
                className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-4"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-light text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
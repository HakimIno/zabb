import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Alert, Animated } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useColorScheme } from 'nativewind';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SimpleMarker } from '../location/SimpleMarker';
import { DraggableMarker } from '../location/DraggableMarker';
import { LocationResult } from '@/src/services/geocoding';
import { Text } from '@/src/components/ui/text';
import { Icon } from '@/src/components/ui/icon';
import { XIcon } from 'lucide-react-native';
import { RideTypeSelector } from './RideTypeSelector';
import { TripSummary } from './TripSummary';
import { DriverCard } from './DriverCard';
import { SearchStates } from './SearchStates';
import { RIDE_TYPES, PAYMENT_METHODS, MOCK_DRIVER } from './constants';
import { Ionicons } from '@expo/vector-icons';
import LocationSelector from './LocationSelector';
import { useBookingStore, useBookingSelectors } from '@/src/stores/booking/bookingStore';

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
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '96%'], []);

  // Zustand store selectors
  const currentLocation = useBookingSelectors.currentLocation();
  const pickupLocation = useBookingSelectors.pickupLocation();
  const destination = useBookingSelectors.destination();
  const bottomSheetState = useBookingSelectors.bottomSheetState();
  const selectedRideType = useBookingSelectors.selectedRideType();
  const selectedPaymentMethod = useBookingSelectors.selectedPaymentMethod();
  const routeCoordinates = useBookingSelectors.routeCoordinates();
  const routeDistance = useBookingSelectors.routeDistance();
  const routeDuration = useBookingSelectors.routeDuration();
  const driver = useBookingSelectors.driver();

  // Zustand store actions
  const {
    setCurrentLocation,
    setPickupLocation,
    setDestination,
    updateBottomSheetState,
    snapToIndex,
    setSelectedRideType,
    calculateRoute,
    confirmBooking,
    startRide,
    cancelBooking,
    selectPickupLocation,
    selectDestination,
    openPickupLocationSelector,
    handleMapPress,
    handlePickupDrag,
    handleDestinationDrag,
  } = useBookingStore();

  // Helper function for BottomSheet
  const snapToIndexWithUpdate = useCallback((index: number) => {
    try {
      bottomSheetRef.current?.snapToIndex(index);
      snapToIndex(index);
    } catch (error) {
      console.warn('Failed to snap to index:', error);
    }
  }, [snapToIndex]);

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

  useEffect(() => {
    setCurrentLocation(initialLocation);
    // Set initial pickup location as a basic LocationResult
    setPickupLocation({
      id: 'current-location',
      name: 'Current Location',
      address: 'Your current location',
      coordinates: initialLocation,
      placeType: 'current'
    });
  }, [initialLocation, setCurrentLocation, setPickupLocation]);

  useEffect(() => {
    if (selectedDestination) {
      setDestination(selectedDestination);
      updateBottomSheetState({ step: 'selecting' });
      snapToIndexWithUpdate(1);

      cameraRef.current?.setCamera({
        centerCoordinate: selectedDestination.coordinates,
        zoomLevel: 16,
        animationDuration: 1000,
      });
    }
  }, [selectedDestination, setDestination, updateBottomSheetState]);

  useEffect(() => {
    if (selectOnMap) {
      updateBottomSheetState({
        isSelectingDestination: true,
        step: 'idle',
        index: 0
      });
      snapToIndexWithUpdate(0);
    }
  }, [selectOnMap, updateBottomSheetState]);

  const handleMapPressEvent = useCallback(async (event: any) => {
    try {
      const { geometry } = event;
      const coordinate: [number, number] = geometry.coordinates;
      await handleMapPress(coordinate);
    } catch (error) {
      console.warn('Failed to handle map press:', error);
    }
  }, [handleMapPress]);

  const calculateRouteWithCamera = async (from: [number, number], to: [number, number]) => {
    await calculateRoute(from, to);

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
  };

  const handleBottomSheetChange = useCallback((index: number) => {
    // ถ้า index เป็น -1 (ปิด) ให้ snap กลับไปที่ 0 (15%)
    if (index === -1) {
      snapToIndexWithUpdate(0);
      return;
    }
    updateBottomSheetState({ index });
  }, [updateBottomSheetState, snapToIndexWithUpdate]);

  const handleConfirmBooking = useCallback(() => {
    try {
      confirmBooking();
      snapToIndexWithUpdate(1);
    } catch (error) {
      console.warn('Failed to confirm booking:', error);
    }
  }, [confirmBooking, snapToIndexWithUpdate]);

  const handleStartRide = useCallback(() => {
    try {
      startRide();
      Alert.alert('Trip Started', 'Have a safe journey');
    } catch (error) {
      console.warn('Failed to start ride:', error);
    }
  }, [startRide]);

  const handleCancelBooking = useCallback(() => {
    try {
      cancelBooking();
      snapToIndexWithUpdate(0);
    } catch (error) {
      console.warn('Failed to cancel booking:', error);
    }
  }, [cancelBooking, snapToIndexWithUpdate]);

  const handleSelectPickupLocation = useCallback((location: LocationResult) => {
    try {
      selectPickupLocation(location);
      snapToIndexWithUpdate(1);
    } catch (error) {
      console.warn('Failed to select pickup location:', error);
    }
  }, [selectPickupLocation, snapToIndexWithUpdate]);

  const handleSelectDestination = useCallback((location: LocationResult) => {
    try {
      selectDestination(location);
      snapToIndexWithUpdate(1);
    } catch (error) {
      console.warn('Failed to select destination:', error);
    }
  }, [selectDestination, snapToIndexWithUpdate]);

  const handleOpenPickupLocationSelector = useCallback(() => {
    try {
      openPickupLocationSelector();
      snapToIndexWithUpdate(2);
    } catch (error) {
      console.warn('Failed to open pickup location selector:', error);
    }
  }, [openPickupLocationSelector, snapToIndexWithUpdate]);


  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Map */}
      <Mapbox.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={colorScheme === 'dark' ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
        onPress={handleMapPressEvent}
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
            coordinate={pickupLocation.coordinates}
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
        <BottomSheetView style={{ flex: 1 }}>
          {/* Idle State - แสดงปุ่มค้นหาเมื่อ index 0 */}
          {bottomSheetState.step === 'idle' && bottomSheetState.index === 0 && (
            <View style={{ paddingHorizontal: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  snapToIndexWithUpdate(3);
                }}
                className="flex flex-row items-center gap-3 bg-gray-100 dark:bg-neutral-900 p-3 mb-2 rounded-lg"
              >
                <Ionicons name='search' size={24} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
                <Text className="text-lg font-light font-anuphan-semibold text-gray-900 dark:text-gray-100">
                  อยากไปที่ไหนดี?
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Location Selector - แสดงเมื่อ index 2 และ step idle */}
          {bottomSheetState.step === 'idle' && bottomSheetState.index >= 2 && (
            <LocationSelector
              onCancel={handleCancelBooking}
              onSelectPickupLocation={handleSelectPickupLocation}
              onSelectDestination={handleSelectDestination}
              currentLocation={initialLocation}
            />
          )}

          {/* Ride Selection */}
          {bottomSheetState.step === 'selecting' && (
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  Select ride
                </Text>
                <TouchableOpacity onPress={handleCancelBooking}>
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
                <TouchableOpacity onPress={handleCancelBooking}>
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
                onSelectPickupLocation={handleOpenPickupLocationSelector}
              />

              {/* Action Buttons */}
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={handleCancelBooking}
                  className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-2xl p-4"
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-light text-center text-lg">
                    ยกเลิก
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmBooking}
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
            onCancel={handleCancelBooking}
            onStartRide={handleStartRide}
          />

          {/* Driver Found */}
          {bottomSheetState.step === 'found' && driver && (
            <View className="flex-1 py-6">
              <DriverCard driver={driver} />

              {/* Action Buttons */}
              <TouchableOpacity
                onPress={handleStartRide}
                className="bg-gray-900 dark:bg-gray-100 rounded-2xl p-5 mb-4"
              >
                <Text className="text-white dark:text-gray-900 font-medium text-center text-lg">
                  Start Trip
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelBooking}
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
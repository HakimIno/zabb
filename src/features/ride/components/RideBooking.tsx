import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Mapbox from '@rnmapbox/maps';
import { XIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Animated, TouchableOpacity, View } from 'react-native';
import { DraggableMarker } from '@/features/map/components/DraggableMarker';
import { FloatingPin } from '@/features/map/components/FloatingPin';
import { SimpleMarker } from '@/features/map/components/SimpleMarker';
import type { LocationResult } from '@/features/map/services/geocoding';
import { useBookingSelectors, useBookingStore } from '@/features/ride/stores/bookingStore';
import { Icon } from '@/ui/icon';
import { Text } from '@/ui/text';
import { RIDE_TYPES } from './constants';
import { DriverCard } from './DriverCard';
import LocationSelector from './LocationSelector';
import { RideTypeSelector } from './RideTypeSelector';
import { SearchStates } from './SearchStates';
import { TripSummary } from './TripSummary';

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
  selectOnMap = false,
}: RideBookingProps) {
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '96%'], []);

  // State for floating pin
  const [_mapCenter, setMapCenter] = React.useState<[number, number]>(initialLocation);
  const [isMapMoving, setIsMapMoving] = React.useState(false);
  const [showFloatingPin, setShowFloatingPin] = React.useState(false);
  const [floatingPinType, setFloatingPinType] = React.useState<'pickup' | 'destination'>(
    'destination'
  );

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
  const snapToIndexWithUpdate = useCallback(
    (index: number) => {
      try {
        bottomSheetRef.current?.snapToIndex(index);
        snapToIndex(index);
      } catch (error) {
        console.warn('Failed to snap to index:', error);
      }
    },
    [snapToIndex]
  );

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
  }, [pulseAnim]);

  useEffect(() => {
    setCurrentLocation(initialLocation);
    // Set initial pickup location as a basic LocationResult
    setPickupLocation({
      id: 'current-location',
      name: 'Current Location',
      address: 'Your current location',
      coordinates: initialLocation,
      placeType: 'current',
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
  }, [selectedDestination, setDestination, updateBottomSheetState, snapToIndexWithUpdate]);

  useEffect(() => {
    if (selectOnMap) {
      updateBottomSheetState({
        isSelectingDestination: true,
        step: 'idle',
        index: 0,
      });
      snapToIndexWithUpdate(0);
      setShowFloatingPin(true);
    }
  }, [selectOnMap, updateBottomSheetState, snapToIndexWithUpdate]);

  // Handle map region change
  const handleCameraChanged = useCallback(() => {
    setIsMapMoving(true);
  }, []);

  const handleMapIdle = useCallback(async () => {
    setIsMapMoving(false);

    if (showFloatingPin) {
      // Get current map center
      const center = await mapRef.current?.getCenter();
      if (center) {
        setMapCenter([center[0], center[1]]);
      }
    }
  }, [showFloatingPin]);

  const handleFloatingPinDrop = useCallback(async () => {
    // Get current map center and create location
    const center = await mapRef.current?.getCenter();
    if (center) {
      const location: LocationResult = {
        id: `map-selected-${Date.now()}`,
        name: floatingPinType === 'pickup' ? 'จุดรับที่เลือก' : 'ปลายทางที่เลือก',
        address: `${center[1].toFixed(6)}, ${center[0].toFixed(6)}`,
        coordinates: [center[0], center[1]],
        placeType: 'address',
      };

      if (floatingPinType === 'pickup') {
        selectPickupLocation(location);
      } else {
        selectDestination(location);
      }
    }

    setShowFloatingPin(false);
    snapToIndexWithUpdate(1);
  }, [floatingPinType, selectPickupLocation, selectDestination, snapToIndexWithUpdate]);

  const handleOpenPickupMapSelector = useCallback(() => {
    setFloatingPinType('pickup');
    setShowFloatingPin(true);
    snapToIndexWithUpdate(0);
  }, [snapToIndexWithUpdate]);

  const handleOpenDestinationMapSelector = useCallback(() => {
    setFloatingPinType('destination');
    setShowFloatingPin(true);
    snapToIndexWithUpdate(0);
  }, [snapToIndexWithUpdate]);

  const handleMapPressEvent = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Mapbox event type is complex
    async (event: any) => {
      try {
        const { geometry } = event;
        const coordinate: [number, number] = geometry.coordinates;
        await handleMapPress(coordinate);
      } catch (error) {
        console.warn('Failed to handle map press:', error);
      }
    },
    [handleMapPress]
  );

  const _calculateRouteWithCamera = async (from: [number, number], to: [number, number]) => {
    await calculateRoute(from, to);

    // ปรับกล้องให้เห็นเส้นทางทั้งหมด
    const bounds = {
      ne: [Math.max(from[0], to[0]) + 0.01, Math.max(from[1], to[1]) + 0.01] as [number, number],
      sw: [Math.min(from[0], to[0]) - 0.01, Math.min(from[1], to[1]) - 0.01] as [number, number],
    };

    cameraRef.current?.fitBounds(bounds.ne, bounds.sw, [50, 50, 50, 300], 1000);
  };

  const handleBottomSheetChange = useCallback(
    (index: number) => {
      // ถ้า index เป็น -1 (ปิด) ให้ snap กลับไปที่ 0 (15%)
      if (index === -1) {
        snapToIndexWithUpdate(0);
        return;
      }
      updateBottomSheetState({ index });
    },
    [updateBottomSheetState, snapToIndexWithUpdate]
  );

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

  const handleSelectPickupLocation = useCallback(
    (location: LocationResult) => {
      try {
        selectPickupLocation(location);
        snapToIndexWithUpdate(1);
      } catch (error) {
        console.warn('Failed to select pickup location:', error);
      }
    },
    [selectPickupLocation, snapToIndexWithUpdate]
  );

  const handleSelectDestination = useCallback(
    (location: LocationResult) => {
      try {
        selectDestination(location);
        snapToIndexWithUpdate(1);
      } catch (error) {
        console.warn('Failed to select destination:', error);
      }
    },
    [selectDestination, snapToIndexWithUpdate]
  );

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
        onCameraChanged={handleCameraChanged}
        onMapIdle={handleMapIdle}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={currentLocation || initialLocation}
          zoomLevel={initialZoom}
        />

        {currentLocation && (
          <SimpleMarker id="current-location" coordinate={currentLocation} type="current" />
        )}

        {pickupLocation && (
          <DraggableMarker
            id="pickup-location"
            coordinate={pickupLocation.coordinates}
            type="pickup"
            draggable={
              bottomSheetState.step === 'selecting' || bottomSheetState.step === 'confirming'
            }
            onDragEnd={handlePickupDrag}
          />
        )}

        {destination && (
          <DraggableMarker
            id="destination"
            coordinate={destination.coordinates}
            type="destination"
            draggable={
              bottomSheetState.step === 'selecting' || bottomSheetState.step === 'confirming'
            }
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

      {/* Floating Pin */}
      {showFloatingPin && (
        <FloatingPin
          type={floatingPinType}
          isActive={isMapMoving}
          onPinDrop={handleFloatingPinDrop}
        />
      )}

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
          {bottomSheetState.step === 'idle' && bottomSheetState.index === 0 && !showFloatingPin && (
            <View style={{ paddingHorizontal: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  snapToIndexWithUpdate(3);
                }}
                className="flex flex-row items-center gap-3 bg-gray-100 dark:bg-neutral-900 p-3 mb-2 rounded-lg"
              >
                <Ionicons
                  name="search"
                  size={24}
                  color={colorScheme === 'dark' ? '#ffffff' : '#000000'}
                />
                <Text className="text-lg font-light font-anuphan-semibold text-gray-900 dark:text-gray-100">
                  อยากไปที่ไหนดี?
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Floating Pin Controls */}
          {showFloatingPin && bottomSheetState.index === 0 && (
            <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              <Text className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                {floatingPinType === 'pickup'
                  ? 'เลื่อนแผนที่เพื่อเลือกจุดรับ'
                  : 'เลื่อนแผนที่เพื่อเลือกตำแหน่งปลายทาง'}
              </Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowFloatingPin(false);
                    updateBottomSheetState({ isSelectingDestination: false });
                    snapToIndexWithUpdate(2);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-xl p-3"
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-center font-medium">
                    ยกเลิก
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFloatingPinDrop}
                  className={`flex-2 rounded-xl p-3 ${
                    floatingPinType === 'pickup' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <Text className="text-white text-center font-medium">เลือกตำแหน่งนี้</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Location Selector - แสดงเมื่อ index 2 และ step idle */}
          {bottomSheetState.step === 'idle' && bottomSheetState.index >= 2 && !showFloatingPin && (
            <LocationSelector
              onCancel={handleCancelBooking}
              onSelectPickupLocation={handleSelectPickupLocation}
              onSelectDestination={handleSelectDestination}
              currentLocation={initialLocation}
              onPickupMapSelect={handleOpenPickupMapSelector}
              onDestinationMapSelect={handleOpenDestinationMapSelector}
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

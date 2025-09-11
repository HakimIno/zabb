import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Alert, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Mapbox from '@rnmapbox/maps';
import { useColorScheme } from 'nativewind';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
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
  CheckIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  MessageCircleIcon,
  StarIcon,
  CreditCardIcon,
  BanknoteIcon,
  SmartphoneIcon,
  ArrowRightIcon,
  User2Icon,
  RadioIcon,
} from 'lucide-react-native';

interface RideBookingProps {
  initialLocation?: [number, number];
  initialZoom?: number;
  selectedDestination?: LocationResult | null;
  selectOnMap?: boolean;
}

// Simplified ride types with elegant design
const RIDE_TYPES = [
  {
    id: 'economy',
    name: 'Economy',
    price: 18.50,
    description: 'Affordable everyday rides',
    eta: '3-5 min',
    seats: 4,
    isPopular: true
  },
  {
    id: 'comfort',
    name: 'Comfort',
    price: 32.00,
    description: 'Extra space and amenities',
    eta: '5-8 min',
    seats: 4,
    isPopular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 45.00,
    description: 'Luxury vehicles',
    eta: '8-12 min',
    seats: 3,
    isPopular: false
  }
];

// Clean payment methods
const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Cash',
    subtitle: 'Pay with cash',
    icon: BanknoteIcon
  },
  {
    id: 'card',
    name: 'Card',
    subtitle: '•••• 4529',
    icon: CreditCardIcon
  },
  {
    id: 'wallet',
    name: 'Wallet',
    subtitle: '$125.50',
    icon: SmartphoneIcon
  }
];

// Clean driver data
const MOCK_DRIVER = {
  name: 'Alex Johnson',
  car: 'Toyota Camry',
  color: 'Silver',
  plate: 'BKK-1234',
  rating: 4.9,
  totalRides: 2847,
  phone: '+66 81-234-5678',
  avatar: 'AJ',
  arrivalTime: '2 min'
};

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
  
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<LocationResult | null>(null);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [bookingStep, setBookingStep] = useState<'idle' | 'selecting' | 'confirming' | 'searching' | 'found' | 'riding'>('idle');
  const [selectedRideType, setSelectedRideType] = useState(RIDE_TYPES[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '45%', '85%'], []);

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
  }, [initialLocation]);

  useEffect(() => {
    if (selectedDestination) {
      setDestination(selectedDestination);
      setBookingStep('selecting');
      bottomSheetRef.current?.snapToIndex(2);
      
      cameraRef.current?.setCamera({
        centerCoordinate: selectedDestination.coordinates,
        zoomLevel: 16,
        animationDuration: 1000,
      });
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (selectOnMap) {
      setIsSelectingDestination(true);
      setBookingStep('idle');
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [selectOnMap]);

  const handleMapPress = async (event: any) => {
    if (!isSelectingDestination) return;
    
    const { geometry } = event;
    const coordinate: [number, number] = geometry.coordinates;
    
    try {
      const location = await geocodingService.reverseGeocode(coordinate);
      
      if (location) {
        setDestination(location);
        setIsSelectingDestination(false);
        setBookingStep('confirming');
        bottomSheetRef.current?.snapToIndex(1);
      }
    } catch (error) {
      console.error('Error selecting destination:', error);
    }
  };

  const handleLocationSelect = (location: LocationResult) => {
    setDestination(location);
    setIsSelectingDestination(false);
    setBookingStep('selecting');
    
    bottomSheetRef.current?.snapToIndex(2);
    
    cameraRef.current?.setCamera({
      centerCoordinate: location.coordinates,
      zoomLevel: 16,
      animationDuration: 1000,
    });
  };

  const startBookingFlow = () => {
    router.push({
      pathname: '/search',
      params: {
        currentLocation: currentLocation ? `${currentLocation[0]},${currentLocation[1]}` : undefined
      }
    });
  };

  const confirmBooking = () => {
    setBookingStep('searching');
    bottomSheetRef.current?.snapToIndex(1);
    
    setTimeout(() => {
      setBookingStep('found');
    }, 3000);
  };

  const startRide = () => {
    setBookingStep('riding');
    Alert.alert('Trip Started', 'Have a safe journey');
  };

  const cancelBooking = () => {
    setBookingStep('idle');
    setDestination(null);
    setIsSelectingDestination(false);
    bottomSheetRef.current?.snapToIndex(0);
  };

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
        
        {destination && (
          <SimpleMarker
            id="destination"
            coordinate={destination.coordinates}
            type="destination"
          />
        )}
      </Mapbox.MapView>

      {/* Floating Location Button */}
      <View className="absolute bottom-32 right-6 z-10">
        <TouchableOpacity
          onPress={goToCurrentLocation}
          className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <Icon as={NavigationIcon} className="size-5 text-gray-700 dark:text-gray-300" />
        </TouchableOpacity>
      </View>

      {/* Clean Search Input */}
      {bookingStep === 'idle' && (
        <View className="absolute top-10 left-3 right-3 z-0">
          <TouchableOpacity 
            onPress={startBookingFlow}
            className="bg-white dark:bg-gray-900 rounded-3xl py-2 px-2 shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-full items-center justify-center mr-4">
                <Icon as={SearchIcon} className="size-6 text-white dark:text-gray-900" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-gray-100 font-medium text-md font-anuphan-semibold">
                  Where to?
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 font-light font-anuphan">
                  13, Allen, Ikeja Lagos
                </Text>
              </View>
              <Icon as={ArrowRightIcon} className="size-5 text-gray-300 dark:text-gray-600" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Minimal Selection Instruction */}
      {/* {isSelectingDestination && (
        <View className="absolute top-32 left-3 right-3 z-5">
          <View className="bg-gray-900 dark:bg-gray-100 rounded-2xl p-2 flex-row items-center">
            <Animated.View 
              style={{ transform: [{ scale: pulseAnim }] }}
              className="w-3 h-3 bg-white dark:bg-gray-900 rounded-full mr-3"
            />
            <Text className="text-white dark:text-gray-900 font-light flex-1">
              Tap anywhere on the map to set destination
            </Text>
          </View>
        </View>
      )} */}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={false}
        backgroundStyle={{
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
        }}
        handleIndicatorStyle={{
          backgroundColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
          width: 32,
          height: 3,
        }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Idle State */}
          {bookingStep === 'idle' && (
            <View className="py-6">
              <Text className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-2">
                Good afternoon
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mb-8 font-light">
                Ready for your next journey?
              </Text>
              
              <TouchableOpacity 
                onPress={startBookingFlow}
                className="bg-gray-900 dark:bg-gray-100 rounded-3xl p-5 flex-row items-center justify-center"
              >
                <Icon as={CarIcon} className="size-6 text-white dark:text-gray-900 mr-3" />
                <Text className="text-white dark:text-gray-900 font-medium text-lg">
                  Book Ride
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Clean Ride Selection */}
          {bookingStep === 'selecting' && (
            <View className="flex-1 py-6">
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  Select ride
                </Text>
                <TouchableOpacity onPress={cancelBooking}>
                  <Icon as={XIcon} className="size-6 text-gray-400" />
                </TouchableOpacity>
              </View>
              
              {/* Simplified Ride Types */}
              <View className="space-y-3 mb-8">
                {RIDE_TYPES.map((rideType) => (
                  <TouchableOpacity
                    key={rideType.id}
                    onPress={() => setSelectedRideType(rideType)}
                    className={`p-5 rounded-2xl border ${
                      selectedRideType.id === rideType.id
                        ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text className="font-medium text-lg text-gray-900 dark:text-gray-100 mr-2">
                            {rideType.name}
                          </Text>
                          {rideType.isPopular && (
                            <View className="bg-gray-900 dark:bg-gray-100 px-2 py-1 rounded-full">
                              <Text className="text-white dark:text-gray-900 text-xs font-light">
                                Popular
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm font-light mb-1">
                          {rideType.description}
                        </Text>
                        <Text className="text-gray-400 dark:text-gray-500 text-xs font-light">
                          {rideType.eta} • {rideType.seats} seats
                        </Text>
                      </View>
                      <Text className="text-xl font-light text-gray-900 dark:text-gray-100">
                        ${rideType.price.toFixed(0)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Clean Payment Methods */}
              <View className="mb-8">
                <Text className="text-lg font-light text-gray-900 dark:text-gray-100 mb-4">
                  Payment
                </Text>
                <View className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setSelectedPaymentMethod(method)}
                      className={`flex-row items-center p-4 rounded-xl border ${
                        selectedPaymentMethod.id === method.id
                          ? 'border-gray-900 dark:border-gray-100'
                          : 'border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <View className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-4">
                        <Icon as={method.icon} className="size-5 text-gray-600 dark:text-gray-400" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900 dark:text-gray-100">
                          {method.name}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 font-light">
                          {method.subtitle}
                        </Text>
                      </View>
                      {selectedPaymentMethod.id === method.id && (
                        <View className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100 rounded-full items-center justify-center">
                          <View className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rounded-full" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Clean Confirmation */}
          {bookingStep === 'confirming' && destination && (
            <View className="flex-1 py-6">
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  Confirm trip
                </Text>
                <TouchableOpacity onPress={cancelBooking}>
                  <Icon as={XIcon} className="size-6 text-gray-400" />
                </TouchableOpacity>
              </View>

              {/* Clean Trip Summary */}
              <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 mb-8">
                <View className="flex-row items-start">
                  <View className="mr-4 pt-1">
                    <View className="w-3 h-3 bg-gray-900 dark:bg-gray-100 rounded-full mb-2" />
                    <View className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600 ml-1 mb-2" />
                    <View className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full" />
                  </View>
                  <View className="flex-1">
                    <View className="mb-4">
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-light">From</Text>
                      <Text className="font-medium text-gray-900 dark:text-gray-100">
                        13, Allen, Ikeja Lagos
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-light">To</Text>
                      <Text className="font-medium text-gray-900 dark:text-gray-100">
                        {destination.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Selected Options Summary */}
              <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                      {selectedRideType.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 font-light">
                      Arriving in {selectedRideType.eta}
                    </Text>
                  </View>
                  <Text className="text-2xl font-light text-gray-900 dark:text-gray-100">
                    ${selectedRideType.price.toFixed(0)}
                  </Text>
                </View>
                
                <View className="flex-row items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Icon as={selectedPaymentMethod.icon} className="size-5 text-gray-500 mr-3" />
                  <Text className="text-gray-900 dark:text-gray-100 font-light">
                    {selectedPaymentMethod.name}
                  </Text>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={cancelBooking}
                  className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-2xl p-4"
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-light text-center text-lg">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={confirmBooking}
                  className="flex-2 bg-gray-900 dark:bg-gray-100 rounded-2xl p-4"
                >
                  <Text className="text-white dark:text-gray-900 font-medium text-center text-lg">
                    Book Ride
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Minimal Searching State */}
          {bookingStep === 'searching' && (
            <View className="flex-1 items-center justify-center py-12">
              <Animated.View 
                style={{ transform: [{ scale: pulseAnim }] }}
                className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-full items-center justify-center mb-8"
              >
                <Icon as={RadioIcon} className="size-8 text-white dark:text-gray-900" />
              </Animated.View>
              
              <Text className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">
                Finding driver
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-12 font-light">
                Connecting you with nearby drivers
              </Text>
              
              <TouchableOpacity
                onPress={cancelBooking}
                className="bg-gray-200 dark:bg-gray-800 rounded-2xl px-8 py-4"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-light">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Clean Driver Found */}
          {bookingStep === 'found' && (
            <View className="flex-1 py-6">
              {/* Success Notice */}
              <View className="bg-gray-900 dark:bg-gray-100 rounded-2xl p-5 mb-8 flex-row items-center">
                <View className="w-10 h-10 bg-white/10 dark:bg-gray-900/10 rounded-full items-center justify-center mr-4">
                  <Icon as={CheckIcon} className="size-6 text-white dark:text-gray-900" />
                </View>
                <View className="flex-1">
                  <Text className="text-white dark:text-gray-900 font-medium text-lg">Driver assigned</Text>
                  <Text className="text-white/70 dark:text-gray-600 font-light">
                    Arriving in {MOCK_DRIVER.arrivalTime}
                  </Text>
                </View>
              </View>

              {/* Clean Driver Card */}
              <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 mb-8">
                <View className="flex-row items-center justify-between mb-5">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-gray-900 dark:bg-gray-100 rounded-2xl items-center justify-center mr-4">
                      <Text className="text-white dark:text-gray-900 font-medium text-lg">
                        {MOCK_DRIVER.avatar}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-medium text-lg text-gray-900 dark:text-gray-100">
                        {MOCK_DRIVER.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Icon as={StarIcon} className="size-4 text-gray-400 mr-1" />
                        <Text className="text-gray-600 dark:text-gray-400 font-light">
                          {MOCK_DRIVER.rating} • {MOCK_DRIVER.totalRides} rides
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row space-x-3">
                    <TouchableOpacity className="bg-white dark:bg-gray-800 rounded-full p-3 border border-gray-200 dark:border-gray-700">
                      <Icon as={MessageCircleIcon} className="size-5 text-gray-600 dark:text-gray-400" />
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white dark:bg-gray-800 rounded-full p-3 border border-gray-200 dark:border-gray-700">
                      <Icon as={PhoneIcon} className="size-5 text-gray-600 dark:text-gray-400" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Icon as={CarIcon} className="size-5 text-gray-500 mr-3" />
                      <Text className="text-gray-900 dark:text-gray-100 font-light">
                        {MOCK_DRIVER.car} • {MOCK_DRIVER.color}
                      </Text>
                    </View>
                    <Text className="text-gray-600 dark:text-gray-400 font-mono font-light">
                      {MOCK_DRIVER.plate}
                    </Text>
                  </View>
                </View>
              </View>

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
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { LocationResult } from '@/src/services/geocoding';
import { directionsService } from '@/src/services/directions';
import { RideType, PaymentMethod, Driver, BookingStep } from '@/src/components/ride/types';
import { RIDE_TYPES, PAYMENT_METHODS, MOCK_DRIVER } from '@/src/components/ride/constants';

interface BottomSheetState {
  index: number;
  step: BookingStep;
  isSelectingDestination: boolean;
  isSelectingPickup: boolean;
}

interface RouteInfo {
  coordinates: [number, number][];
  distance: string;
  duration: string;
}

interface BookingState {
  // Location states
  currentLocation: [number, number] | null;
  pickupLocation: LocationResult | null;
  destination: LocationResult | null;
  
  // Bottom sheet state
  bottomSheetState: BottomSheetState;
  
  // Ride states
  selectedRideType: RideType;
  selectedPaymentMethod: PaymentMethod;
  
  // Route states
  routeInfo: RouteInfo;
  
  // Driver state
  driver: Driver | null;
  
  // Actions
  setCurrentLocation: (location: [number, number] | null) => void;
  setPickupLocation: (location: LocationResult | null) => void;
  setDestination: (location: LocationResult | null) => void;
  
  updateBottomSheetState: (updates: Partial<BottomSheetState>) => void;
  snapToIndex: (index: number) => void;
  
  setSelectedRideType: (rideType: RideType) => void;
  setSelectedPaymentMethod: (paymentMethod: PaymentMethod) => void;
  
  setRouteInfo: (routeInfo: Partial<RouteInfo>) => void;
  calculateRoute: (from: [number, number], to: [number, number]) => Promise<void>;
  
  setDriver: (driver: Driver | null) => void;
  
  // Booking flow actions
  startBookingFlow: () => void;
  confirmBooking: () => void;
  startRide: () => void;
  cancelBooking: () => void;
  
  selectPickupLocation: (location: LocationResult) => void;
  selectDestination: (location: LocationResult) => void;
  openPickupLocationSelector: () => void;
  
  handleMapPress: (coordinate: [number, number]) => Promise<void>;
  handlePickupDrag: (coordinate: [number, number]) => Promise<void>;
  handleDestinationDrag: (coordinate: [number, number]) => Promise<void>;
  
  // Reset actions
  resetBooking: () => void;
  resetRoute: () => void;
}

const initialBottomSheetState: BottomSheetState = {
  index: 0,
  step: 'idle',
  isSelectingDestination: false,
  isSelectingPickup: false,
};

const initialRouteInfo: RouteInfo = {
  coordinates: [],
  distance: '',
  duration: '',
};

export const useBookingStore = create<BookingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentLocation: null,
    pickupLocation: null,
    destination: null,
    bottomSheetState: initialBottomSheetState,
    selectedRideType: RIDE_TYPES[0],
    selectedPaymentMethod: PAYMENT_METHODS[0],
    routeInfo: initialRouteInfo,
    driver: null,

    // Location actions
    setCurrentLocation: (location) => set({ currentLocation: location }),
    
    setPickupLocation: (location) => set({ pickupLocation: location }),
    
    setDestination: (location) => set({ destination: location }),

    // Bottom sheet actions
    updateBottomSheetState: (updates) =>
      set((state) => ({
        bottomSheetState: { ...state.bottomSheetState, ...updates },
      })),

    snapToIndex: (index) =>
      set((state) => ({
        bottomSheetState: { ...state.bottomSheetState, index },
      })),

    // Ride selection actions
    setSelectedRideType: (rideType) => set({ selectedRideType: rideType }),
    
    setSelectedPaymentMethod: (paymentMethod) => set({ selectedPaymentMethod: paymentMethod }),

    // Route actions
    setRouteInfo: (routeInfo) =>
      set((state) => ({
        routeInfo: { ...state.routeInfo, ...routeInfo },
      })),

    calculateRoute: async (from, to) => {
      try {
        const directions = await directionsService.getDirections([from, to]);

        if (directions && directions.routes.length > 0) {
          const route = directions.routes[0];
          set({
            routeInfo: {
              coordinates: route.coordinates,
              distance: directionsService.formatDistance(route.distance),
              duration: directionsService.formatDuration(route.duration),
            },
          });
        } else {
          // Fallback to simple calculation
          const estimate = directionsService.calculateEstimate(from, to);
          set({
            routeInfo: {
              coordinates: [from, to],
              distance: directionsService.formatDistance(estimate.distance),
              duration: directionsService.formatDuration(estimate.duration),
            },
          });
        }
      } catch (error) {
        console.error('Error calculating route:', error);
        // Fallback to simple calculation
        const estimate = directionsService.calculateEstimate(from, to);
        set({
          routeInfo: {
            coordinates: [from, to],
            distance: directionsService.formatDistance(estimate.distance),
            duration: directionsService.formatDuration(estimate.duration),
          },
        });
      }
    },

    // Driver actions
    setDriver: (driver) => set({ driver }),

    // Booking flow actions
    startBookingFlow: () => {
      set((state) => ({
        bottomSheetState: { ...state.bottomSheetState, step: 'idle' },
      }));
    },

    confirmBooking: () => {
      set((state) => ({
        bottomSheetState: { ...state.bottomSheetState, step: 'searching' },
      }));
      
      // Simulate driver search
      setTimeout(() => {
        set((state) => ({
          bottomSheetState: { ...state.bottomSheetState, step: 'found' },
          driver: MOCK_DRIVER,
        }));
      }, 3000);
    },

    startRide: () => {
      set((state) => ({
        bottomSheetState: { ...state.bottomSheetState, step: 'riding' },
      }));
    },

    cancelBooking: () => {
      set({
        destination: null,
        routeInfo: initialRouteInfo,
        driver: null,
        bottomSheetState: {
          ...initialBottomSheetState,
          index: 0,
        },
      });
    },

    selectPickupLocation: (location) => {
      set((state) => ({
        pickupLocation: location,
        bottomSheetState: {
          ...state.bottomSheetState,
          isSelectingPickup: false,
          step: 'selecting',
          index: 1,
        },
      }));
    },

    selectDestination: (location) => {
      set((state) => ({
        destination: location,
        bottomSheetState: {
          ...state.bottomSheetState,
          isSelectingDestination: false,
          step: 'selecting',
          index: 1,
        },
      }));
    },

    openPickupLocationSelector: () => {
      set((state) => ({
        bottomSheetState: {
          ...state.bottomSheetState,
          isSelectingPickup: true,
          step: 'idle',
          index: 2,
        },
      }));
    },

    handleMapPress: async (coordinate) => {
      const { bottomSheetState, pickupLocation, destination } = get();
      const { isSelectingDestination, isSelectingPickup } = bottomSheetState;
      
      if (!isSelectingDestination && !isSelectingPickup) return;

      try {
        if (isSelectingDestination) {
          const { geocodingService } = await import('@/src/services/geocoding');
          const location = await geocodingService.reverseGeocode(coordinate);

          if (location) {
            set({
              destination: location,
              bottomSheetState: {
                ...bottomSheetState,
                isSelectingDestination: false,
                step: 'confirming',
                index: 1,
              },
            });

            // Calculate route if pickup location exists
            if (pickupLocation) {
              await get().calculateRoute(pickupLocation.coordinates, location.coordinates);
            }
          }
        } else if (isSelectingPickup) {
          const location: LocationResult = {
            id: 'manual-pickup',
            name: 'Selected Location',
            address: 'Selected location on map',
            coordinates: coordinate,
            placeType: 'manual',
          };
          
          set({
            pickupLocation: location,
            bottomSheetState: {
              ...bottomSheetState,
              isSelectingPickup: false,
            },
          });

          // Calculate route if destination exists
          if (destination) {
            await get().calculateRoute(coordinate, destination.coordinates);
          }
        }
      } catch (error) {
        console.error('Error selecting location:', error);
      }
    },

    handlePickupDrag: async (coordinate) => {
      const { destination } = get();
      const location: LocationResult = {
        id: 'dragged-pickup',
        name: 'Dragged Location',
        address: 'Location dragged on map',
        coordinates: coordinate,
        placeType: 'manual',
      };
      
      set({ pickupLocation: location });

      if (destination) {
        await get().calculateRoute(coordinate, destination.coordinates);
      }
    },

    handleDestinationDrag: async (coordinate) => {
      const { pickupLocation } = get();
      
      try {
        const { geocodingService } = await import('@/src/services/geocoding');
        const location = await geocodingService.reverseGeocode(coordinate);
        
        if (location) {
          set({ destination: location });

          if (pickupLocation) {
            await get().calculateRoute(pickupLocation.coordinates, coordinate);
          }
        }
      } catch (error) {
        console.error('Error updating destination:', error);
      }
    },

    // Reset actions
    resetBooking: () => {
      set({
        currentLocation: null,
        pickupLocation: null,
        destination: null,
        bottomSheetState: initialBottomSheetState,
        selectedRideType: RIDE_TYPES[0],
        selectedPaymentMethod: PAYMENT_METHODS[0],
        routeInfo: initialRouteInfo,
        driver: null,
      });
    },

    resetRoute: () => {
      set({ routeInfo: initialRouteInfo });
    },
  }))
);

// Selectors for better performance
export const useBookingSelectors = {
  // Location selectors
  currentLocation: () => useBookingStore((state) => state.currentLocation),
  pickupLocation: () => useBookingStore((state) => state.pickupLocation),
  destination: () => useBookingStore((state) => state.destination),
  
  // Bottom sheet selectors
  bottomSheetState: () => useBookingStore((state) => state.bottomSheetState),
  bottomSheetIndex: () => useBookingStore((state) => state.bottomSheetState.index),
  bookingStep: () => useBookingStore((state) => state.bottomSheetState.step),
  isSelectingDestination: () => useBookingStore((state) => state.bottomSheetState.isSelectingDestination),
  isSelectingPickup: () => useBookingStore((state) => state.bottomSheetState.isSelectingPickup),
  
  // Ride selectors
  selectedRideType: () => useBookingStore((state) => state.selectedRideType),
  selectedPaymentMethod: () => useBookingStore((state) => state.selectedPaymentMethod),
  
  // Route selectors
  routeInfo: () => useBookingStore((state) => state.routeInfo),
  routeCoordinates: () => useBookingStore((state) => state.routeInfo.coordinates),
  routeDistance: () => useBookingStore((state) => state.routeInfo.distance),
  routeDuration: () => useBookingStore((state) => state.routeInfo.duration),
  
  // Driver selectors
  driver: () => useBookingStore((state) => state.driver),
  
  // Computed selectors
  hasRoute: () => useBookingStore((state) => state.routeInfo.coordinates.length > 0),
  canConfirmBooking: () => useBookingStore((state) => 
    state.destination && state.pickupLocation && state.routeInfo.coordinates.length > 0
  ),
};
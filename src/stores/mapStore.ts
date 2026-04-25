import { create } from 'zustand';
import type { LocationResult } from '@/src/services/geocoding';

interface MapState {
  // สถานะแผนที่
  currentLocation: [number, number] | null;
  selectedLocation: LocationResult | null;
  markers: LocationResult[];
  customMarkers: Array<{
    id: string;
    coordinate: [number, number];
    title?: string;
  }>;

  // การค้นหา
  searchQuery: string;
  searchResults: LocationResult[];
  isSearching: boolean;

  // การตั้งค่าแผนที่
  zoomLevel: number;
  mapStyle: 'light' | 'dark';

  // Actions
  setCurrentLocation: (location: [number, number] | null) => void;
  setSelectedLocation: (location: LocationResult | null) => void;
  addMarker: (location: LocationResult) => void;
  removeMarker: (locationId: string) => void;
  clearMarkers: () => void;
  addCustomMarker: (coordinate: [number, number], title?: string) => void;
  removeCustomMarker: (markerId: string) => void;
  clearCustomMarkers: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: LocationResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;

  // Map settings
  setZoomLevel: (zoom: number) => void;
  setMapStyle: (style: 'light' | 'dark') => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  currentLocation: null,
  selectedLocation: null,
  markers: [],
  customMarkers: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  zoomLevel: 10,
  mapStyle: 'light',

  // Location actions
  setCurrentLocation: (location) => set({ currentLocation: location }),

  setSelectedLocation: (location) => set({ selectedLocation: location }),

  addMarker: (location) => {
    const { markers } = get();
    const exists = markers.some((marker) => marker.id === location.id);
    if (!exists) {
      set({ markers: [...markers, location] });
    }
  },

  removeMarker: (locationId) => {
    const { markers } = get();
    set({
      markers: markers.filter((marker) => marker.id !== locationId),
      selectedLocation: get().selectedLocation?.id === locationId ? null : get().selectedLocation,
    });
  },

  clearMarkers: () =>
    set({
      markers: [],
      selectedLocation: null,
    }),

  addCustomMarker: (coordinate, title) => {
    const { customMarkers } = get();
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set({
      customMarkers: [...customMarkers, { id, coordinate, title }],
    });
  },

  removeCustomMarker: (markerId) => {
    const { customMarkers } = get();
    set({
      customMarkers: customMarkers.filter((marker) => marker.id !== markerId),
    });
  },

  clearCustomMarkers: () => set({ customMarkers: [] }),

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchResults: (results) => set({ searchResults: results }),

  setIsSearching: (isSearching) => set({ isSearching }),

  clearSearch: () =>
    set({
      searchQuery: '',
      searchResults: [],
    }),

  // Map settings
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

  setMapStyle: (style) => set({ mapStyle: style }),
}));

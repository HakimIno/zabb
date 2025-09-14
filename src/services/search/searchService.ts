import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://192.168.198.21:8082/api/v1';

// Create axios instance
const searchApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Types for the new API response
export interface SearchPlace {
  title: string;
  id: string;
  language: string;
  resultType: string;
  address: {
    label: string;
    countryCode: string;
    countryName: string;
    county: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
  };
  position: {
    lat: number;
    lng: number;
  };
  distance: number;
  categories: Array<{
    id: string;
    name: string;
    primary: boolean;
  }>;
  contacts?: Array<{
    phone?: string[];
    www?: string[];
  }>;
}

export interface SearchResponse {
  data: {
    places: SearchPlace[];
    meta: {
      query: string;
      resultsCount: number;
      searchTime: string;
      fromCache: boolean;
    };
  };
  message: string;
  success: boolean;
}

export interface SearchRequest {
  language: string;
  limit: number;
  query: string;
  proximity?: {
    lat: number;
    lng: number;
  };
}

// Converted type to match existing LocationResult interface
export interface LocationResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  placeType?: string;
}

export class SearchService {
  private static instance: SearchService;

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Search places using the new API endpoint
   */
  async searchPlaces(request: SearchRequest): Promise<LocationResult[]> {
    try {
      const response = await searchApiClient.post<SearchResponse>('/maps/search', request);
      
      if (!response.data.success || !response.data.data.places) {
        throw new Error(response.data.message || 'Search failed');
      }

      // Convert SearchPlace[] to LocationResult[]
      return response.data.data.places.map((place): LocationResult => ({
        id: place.id,
        name: place.title,
        address: place.address.label,
        coordinates: [place.position.lng, place.position.lat] as [number, number],
        placeType: place.categories.find(cat => cat.primary)?.name || place.resultType,
      }));
    } catch (error) {
      console.error('Search API error:', error);
      throw error;
    }
  }

  /**
   * Search places with fallback error handling
   */
  async searchPlacesWithFallback(request: SearchRequest): Promise<LocationResult[]> {
    try {
      return await this.searchPlaces(request);
    } catch (error) {
      console.warn('Search API failed, using fallback data:', error);
      return this.getFallbackSearchResults(request.query);
    }
  }

  /**
   * Fallback data when API is unavailable
   */
  private getFallbackSearchResults(query: string): LocationResult[] {
    const fallbackData: LocationResult[] = [
      { id: 'fallback-1', name: 'Central World', address: 'Ratchadamri Road, Bangkok', coordinates: [100.5395, 13.7472] as [number, number], placeType: 'poi' },
      { id: 'fallback-2', name: 'Siam Paragon', address: 'Rama I Road, Bangkok', coordinates: [100.5347, 13.7463] as [number, number], placeType: 'poi' },
      { id: 'fallback-3', name: 'Terminal 21', address: 'Sukhumvit Road, Bangkok', coordinates: [100.5605, 13.7307] as [number, number], placeType: 'poi' },
      { id: 'fallback-4', name: 'Chatuchak Weekend Market', address: 'Kamphaeng Phet 2 Road, Bangkok', coordinates: [100.5495, 13.7998] as [number, number], placeType: 'poi' },
      { id: 'fallback-5', name: 'Lumpini Park', address: 'Rama IV Road, Bangkok', coordinates: [100.5408, 13.7307] as [number, number], placeType: 'poi' },
      { id: 'fallback-6', name: 'วัดพระแก้ว (Temple of the Emerald Buddha)', address: 'พระนคร, กรุงเทพมหานคร', coordinates: [100.4955, 13.74964] as [number, number], placeType: 'temple' },
      { id: 'fallback-7', name: 'วัดโพธิ์ (Wat Pho)', address: 'พระนคร, กรุงเทพมหานคร', coordinates: [100.4927, 13.7468] as [number, number], placeType: 'temple' },
      { id: 'fallback-8', name: 'วัดอรุณราชวราราม (Wat Arun)', address: 'ธนบุรี, กรุงเทพมหานคร', coordinates: [100.4889, 13.7437] as [number, number], placeType: 'temple' },
    ];

    // Filter results that match the search query
    const filteredResults = fallbackData.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.address.toLowerCase().includes(query.toLowerCase())
    );

    return filteredResults.length > 0 ? filteredResults : fallbackData.slice(0, 5);
  }
}

export const searchService = SearchService.getInstance();

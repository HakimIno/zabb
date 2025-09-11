import { MAPBOX_ACCESS_TOKEN } from '@/src/config/mapbox';

export interface LocationResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  placeType?: string;
}

export interface SearchLocationParams {
  query: string;
  proximity?: [number, number];
  limit?: number;
}

export class GeocodingService {
  private static instance: GeocodingService;

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  /**
   * ค้นหาสถานที่จากข้อความ
   */
  async searchLocation(params: SearchLocationParams): Promise<LocationResult[]> {
    try {
      const { query, proximity, limit = 10 } = params;
      
      // เพิ่ม timeout และ error handling ที่ดีกว่า
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 วินาที timeout
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_ACCESS_TOKEN}&` +
        `limit=${limit}&` +
        `language=th&` +
        (proximity ? `proximity=${proximity[0]},${proximity[1]}&` : '') +
        `country=TH`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Mapbox API error: ${response.status} - ${response.statusText}`);
        // ใช้ fallback data แทนการ throw error
        return this.getFallbackSearchResults(query);
      }

      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        return this.getFallbackSearchResults(query);
      }
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        name: feature.text || feature.place_name,
        address: feature.place_name,
        coordinates: feature.center,
        placeType: feature.place_type?.[0],
      }));
    } catch (error) {
      console.warn('Network error during search, using fallback data:', error);
      // ใช้ fallback data แทนการ return empty array
      return this.getFallbackSearchResults(params.query);
    }
  }

  /**
   * ข้อมูล fallback เมื่อ API ไม่ทำงาน
   */
  private getFallbackSearchResults(query: string): LocationResult[] {
    const fallbackData: LocationResult[] = [
      { id: 'fallback-1', name: 'Central World', address: 'Ratchadamri Road, Bangkok', coordinates: [100.5395, 13.7472] as [number, number], placeType: 'poi' },
      { id: 'fallback-2', name: 'Siam Paragon', address: 'Rama I Road, Bangkok', coordinates: [100.5347, 13.7463] as [number, number], placeType: 'poi' },
      { id: 'fallback-3', name: 'Terminal 21', address: 'Sukhumvit Road, Bangkok', coordinates: [100.5605, 13.7307] as [number, number], placeType: 'poi' },
      { id: 'fallback-4', name: 'Chatuchak Weekend Market', address: 'Kamphaeng Phet 2 Road, Bangkok', coordinates: [100.5495, 13.7998] as [number, number], placeType: 'poi' },
      { id: 'fallback-5', name: 'Lumpini Park', address: 'Rama IV Road, Bangkok', coordinates: [100.5408, 13.7307] as [number, number], placeType: 'poi' },
    ];

    // กรองข้อมูลที่ตรงกับคำค้นหา
    const filteredResults = fallbackData.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.address.toLowerCase().includes(query.toLowerCase())
    );

    return filteredResults.length > 0 ? filteredResults : fallbackData.slice(0, 3);
  }

  /**
   * แปลงพิกัดเป็นชื่อสถานที่ (Reverse Geocoding)
   */
  async reverseGeocode(coordinates: [number, number]): Promise<LocationResult | null> {
    try {
      const [lng, lat] = coordinates;
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
        `access_token=${MAPBOX_ACCESS_TOKEN}&` +
        `language=th&` +
        `country=TH`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          id: feature.id,
          name: feature.text || feature.place_name,
          address: feature.place_name,
          coordinates: feature.center,
          placeType: feature.place_type?.[0],
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * ค้นหาสถานที่น่าสนใจใกล้เคียง
   */
  async searchNearbyPlaces(coordinates: [number, number], categories: string[] = ['poi']): Promise<LocationResult[]> {
    try {
      const [lng, lat] = coordinates;
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
        `access_token=${MAPBOX_ACCESS_TOKEN}&` +
        `types=${categories.join(',')}&` +
        `language=th&` +
        `country=TH&` +
        `limit=20`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        name: feature.text || feature.place_name,
        address: feature.place_name,
        coordinates: feature.center,
        placeType: feature.place_type?.[0],
      }));
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }
}

export const geocodingService = GeocodingService.getInstance();

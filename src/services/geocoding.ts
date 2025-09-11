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
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_ACCESS_TOKEN}&` +
        `limit=${limit}&` +
        `language=th&` +
        (proximity ? `proximity=${proximity[0]},${proximity[1]}&` : '') +
        `country=TH`
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
      console.error('Error searching location:', error);
      return [];
    }
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

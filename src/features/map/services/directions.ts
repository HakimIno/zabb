import { MAPBOX_ACCESS_TOKEN } from '@/features/map/config/mapbox';

export interface DirectionRoute {
  coordinates: [number, number][];
  distance: number; // เมตร
  duration: number; // วินาที
  geometry: string;
}

export interface DirectionsResult {
  routes: DirectionRoute[];
  waypoints: {
    location: [number, number];
    name: string;
  }[];
}

export class DirectionsService {
  private static instance: DirectionsService;

  public static getInstance(): DirectionsService {
    if (!DirectionsService.instance) {
      DirectionsService.instance = new DirectionsService();
    }
    return DirectionsService.instance;
  }

  /**
   * รับเส้นทางระหว่างจุดต่างๆ
   */
  async getDirections(
    coordinates: [number, number][],
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<DirectionsResult | null> {
    try {
      if (coordinates.length < 2) {
        throw new Error('ต้องมีอย่างน้อย 2 จุด');
      }

      const coordinatesString = coordinates.map((coord) => `${coord[0]},${coord[1]}`).join(';');

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatesString}?` +
          `access_token=${MAPBOX_ACCESS_TOKEN}&` +
          `geometries=geojson&` +
          `overview=full&` +
          `steps=true&` +
          `language=th`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`Directions API error: ${response.status} - ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        return null;
      }

      return {
        routes: data.routes.map((route: any) => ({
          coordinates: route.geometry.coordinates,
          distance: route.distance,
          duration: route.duration,
          geometry: JSON.stringify(route.geometry),
        })),
        waypoints: data.waypoints.map((waypoint: any) => ({
          location: waypoint.location,
          name: waypoint.name || '',
        })),
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }

  /**
   * คำนวณระยะทางและเวลาโดยประมาณ
   */
  calculateEstimate(
    from: [number, number],
    to: [number, number]
  ): {
    distance: number;
    duration: number;
  } {
    // คำนวณระยะทางแบบเส้นตรง (Haversine formula)
    const R = 6371000; // รัศมีโลกเป็นเมตร
    const lat1 = (from[1] * Math.PI) / 180;
    const lat2 = (to[1] * Math.PI) / 180;
    const deltaLat = ((to[1] - from[1]) * Math.PI) / 180;
    const deltaLng = ((to[0] - from[0]) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // ระยะทางเป็นเมตร

    // ประมาณเวลาโดยใช้ความเร็วเฉลี่ย 30 กม./ชม. ในเมือง
    const duration = (distance / 1000) * (3600 / 30); // วินาที

    return {
      distance: Math.round(distance),
      duration: Math.round(duration),
    };
  }

  /**
   * แปลงระยะทางเป็นข้อความ
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} ม.`;
    } else {
      return `${(meters / 1000).toFixed(1)} กม.`;
    }
  }

  /**
   * แปลงเวลาเป็นข้อความ
   */
  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} นาที`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} ชม. ${remainingMinutes} นาที`;
    }
  }
}

export const directionsService = DirectionsService.getInstance();

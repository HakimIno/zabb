import { LucideIcon } from 'lucide-react-native';
import { LocationResult } from '@/src/services/geocoding';

export interface RideType {
  id: string;
  name: string;
  price: number;
  description: string;
  eta: string;
  seats: number;
  isPopular: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
}

export interface Driver {
  name: string;
  car: string;
  color: string;
  plate: string;
  rating: number;
  totalRides: number;
  phone: string;
  avatar: string;
  arrivalTime: string;
}

export type BookingStep = 'idle' | 'selecting' | 'confirming' | 'searching' | 'found' | 'riding';

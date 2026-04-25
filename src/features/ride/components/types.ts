import type { LucideIcon } from 'lucide-react-native';

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

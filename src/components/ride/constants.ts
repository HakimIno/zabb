import { 
  BanknoteIcon,
  CreditCardIcon,
  SmartphoneIcon
} from 'lucide-react-native';
import { RideType, PaymentMethod, Driver } from './types';

export const RIDE_TYPES: RideType[] = [
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

export const PAYMENT_METHODS: PaymentMethod[] = [
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

export const MOCK_DRIVER: Driver = {
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

import { TouchableOpacity, View } from 'react-native';
import type { LocationResult } from '@/features/map/services/geocoding';
import { Icon } from '@/ui/icon';
import { Text } from '@/ui/text';
import type { PaymentMethod, RideType } from './types';

interface TripSummaryProps {
  destination: LocationResult;
  pickupLocation: LocationResult | null;
  routeDistance?: string;
  routeDuration?: string;
  selectedRideType: RideType;
  selectedPaymentMethod: PaymentMethod;
  onSelectPickupLocation: () => void;
}

export function TripSummary({
  destination,
  pickupLocation,
  routeDistance,
  routeDuration,
  selectedRideType,
  selectedPaymentMethod,
  onSelectPickupLocation,
}: TripSummaryProps) {
  return (
    <>
      {/* Trip Route Summary */}
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
                {pickupLocation?.name || 'จุดรับ'}
              </Text>
              <TouchableOpacity onPress={onSelectPickupLocation} className="mt-1">
                <Text className="text-xs text-blue-600 dark:text-blue-400">เลือกจุดรับใหม่</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-light">To</Text>
              <Text className="font-medium text-gray-900 dark:text-gray-100">
                {destination.name}
              </Text>
              {routeDistance && routeDuration && (
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {routeDistance} • {routeDuration}
                </Text>
              )}
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
    </>
  );
}

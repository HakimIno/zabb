import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';

export interface RideType {
  id: string;
  name: string;
  price: number;
  description: string;
  eta: string;
  seats: number;
  isPopular: boolean;
}

interface RideTypeSelectorProps {
  rideTypes: RideType[];
  selectedRideType: RideType;
  onSelectRideType: (rideType: RideType) => void;
}

export function RideTypeSelector({ 
  rideTypes, 
  selectedRideType, 
  onSelectRideType 
}: RideTypeSelectorProps) {
  return (
    <View className="space-y-3 mb-8">
      {rideTypes.map((rideType) => (
        <TouchableOpacity
          key={rideType.id}
          onPress={() => onSelectRideType(rideType)}
          className={`p-5 rounded-2xl border ${
            selectedRideType.id === rideType.id
              ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-900'
              : 'border-gray-200 dark:border-gray-800'
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="font-medium text-lg text-gray-900 dark:text-gray-100 mr-2">
                  {rideType.name}
                </Text>
                {rideType.isPopular && (
                  <View className="bg-gray-900 dark:bg-gray-100 px-2 py-1 rounded-full">
                    <Text className="text-white dark:text-gray-900 text-xs font-light">
                      Popular
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-light mb-1">
                {rideType.description}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs font-light">
                {rideType.eta} • {rideType.seats} seats
              </Text>
            </View>
            <Text className="text-xl font-light text-gray-900 dark:text-gray-100">
              ${rideType.price.toFixed(0)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Icon } from '@/src/components/ui/icon';
import { RadioIcon } from 'lucide-react-native';
import { BookingStep } from './types';

interface SearchStatesProps {
  bookingStep: BookingStep;
  pulseAnim: Animated.Value;
  onCancel: () => void;
  onStartRide: () => void;
}

export function SearchStates({ 
  bookingStep, 
  pulseAnim, 
  onCancel, 
  onStartRide 
}: SearchStatesProps) {
  if (bookingStep === 'searching') {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Animated.View 
          style={{ transform: [{ scale: pulseAnim }] }}
          className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-full items-center justify-center mb-8"
        >
          <Icon as={RadioIcon} className="size-8 text-white dark:text-gray-900" />
        </Animated.View>
        
        <Text className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">
          Finding driver
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-12 font-light">
          Connecting you with nearby drivers
        </Text>
        
        <TouchableOpacity
          onPress={onCancel}
          className="bg-gray-200 dark:bg-gray-800 rounded-2xl px-8 py-4"
        >
          <Text className="text-gray-700 dark:text-gray-300 font-light">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

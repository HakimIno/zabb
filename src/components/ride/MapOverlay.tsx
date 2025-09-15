import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Icon } from '@/src/components/ui/icon';
import {
  SearchIcon,
  NavigationIcon,
  ArrowRightIcon
} from 'lucide-react-native';
import { BookingStep } from './types';

interface MapOverlayProps {
  bookingStep: BookingStep;
  isSelectingPickup: boolean;
  isSelectingDestination: boolean;
  pickupLocation: [number, number] | null;
  onStartBookingFlow: () => void;
  onGoToCurrentLocation: () => void;
}

export function MapOverlay({
  bookingStep,
  isSelectingPickup,
  isSelectingDestination,
  pickupLocation,
  onStartBookingFlow,
  onGoToCurrentLocation
}: MapOverlayProps) {
  return (
    <>
      {/* Floating Location Button */}
      <View className="absolute bottom-32 right-6 z-10">
        <TouchableOpacity
          onPress={onGoToCurrentLocation}
          className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <Icon as={NavigationIcon} className="size-5 text-gray-700 dark:text-gray-300" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {(!isSelectingPickup && !isSelectingDestination) && bookingStep === 'idle' && (
        <View className="absolute top-10 left-3 right-3 z-0">
          <TouchableOpacity
            onPress={onStartBookingFlow}
            className="bg-white dark:bg-black rounded-3xl p-2 shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-gray-950 dark:bg-gray-50 rounded-full items-center justify-center mr-2 ">
                <Icon as={SearchIcon} className="size-6 text-white dark:text-gray-900" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-gray-100 font-medium text-md font-anuphan-semibold">
                  Where to?
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 font-light font-anuphan">
                  {pickupLocation ? 'ตำแหน่งรับ' : '13, Allen, Ikeja Lagos'}
                </Text>
              </View>
              <Icon as={ArrowRightIcon} className="size-5 text-gray-300 dark:text-gray-600" />
            </View>
          </TouchableOpacity>
        </View>
      )}

    </>
  );
}

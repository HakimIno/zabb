import { CarIcon, CheckIcon, MessageCircleIcon, PhoneIcon, StarIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@/ui/icon';
import { Text } from '@/ui/text';
import type { Driver } from './types';

interface DriverCardProps {
  driver: Driver;
}

export function DriverCard({ driver }: DriverCardProps) {
  return (
    <>
      {/* Success Notice */}
      <View className="bg-gray-900 dark:bg-gray-100 rounded-2xl p-5 mb-8 flex-row items-center">
        <View className="w-10 h-10 bg-white/10 dark:bg-gray-900/10 rounded-full items-center justify-center mr-4">
          <Icon as={CheckIcon} className="size-6 text-white dark:text-gray-900" />
        </View>
        <View className="flex-1">
          <Text className="text-white dark:text-gray-900 font-medium text-lg">Driver assigned</Text>
          <Text className="text-white/70 dark:text-gray-600 font-light">
            Arriving in {driver.arrivalTime}
          </Text>
        </View>
      </View>

      {/* Driver Card */}
      <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 mb-8">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-gray-900 dark:bg-gray-100 rounded-2xl items-center justify-center mr-4">
              <Text className="text-white dark:text-gray-900 font-medium text-lg">
                {driver.avatar}
              </Text>
            </View>
            <View>
              <Text className="font-medium text-lg text-gray-900 dark:text-gray-100">
                {driver.name}
              </Text>
              <View className="flex-row items-center">
                <Icon as={StarIcon} className="size-4 text-gray-400 mr-1" />
                <Text className="text-gray-600 dark:text-gray-400 font-light">
                  {driver.rating} • {driver.totalRides} rides
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity className="bg-white dark:bg-gray-800 rounded-full p-3 border border-gray-200 dark:border-gray-700">
              <Icon as={MessageCircleIcon} className="size-5 text-gray-600 dark:text-gray-400" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white dark:bg-gray-800 rounded-full p-3 border border-gray-200 dark:border-gray-700">
              <Icon as={PhoneIcon} className="size-5 text-gray-600 dark:text-gray-400" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon as={CarIcon} className="size-5 text-gray-500 mr-3" />
              <Text className="text-gray-900 dark:text-gray-100 font-light">
                {driver.car} • {driver.color}
              </Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-400 font-mono font-light">
              {driver.plate}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

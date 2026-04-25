import React from 'react';
import { View } from 'react-native';

export const PickupIcon = React.memo(() => (
  <View className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg items-center justify-center mr-2">
    <View className="w-6 h-6 bg-green-400 dark:bg-green-950 rounded-full items-center justify-center">
      <View className="w-4 h-4 bg-green-500 rounded-full" />
    </View>
  </View>
));

export const DestinationIcon = React.memo(() => (
  <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg items-center justify-center mr-2">
    <View className="w-6 h-6 bg-indigo-400 dark:bg-indigo-950 rounded-full items-center justify-center">
      <View className="w-4 h-4 bg-indigo-500 rounded-full" />
    </View>
  </View>
));

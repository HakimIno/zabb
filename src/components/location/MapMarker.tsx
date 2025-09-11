import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Icon } from '@/src/components/ui/icon';
import { Text } from '@/src/components/ui/text';
import { MapPinIcon, XIcon } from 'lucide-react-native';
import { LocationResult } from '@/src/services/geocoding';

interface MapMarkerProps {
  location: LocationResult;
  onPress?: () => void;
  onRemove?: () => void;
  isSelected?: boolean;
  color?: string;
}

export function MapMarker({ 
  location, 
  onPress, 
  onRemove, 
  isSelected = false,
  color = '#3B82F6' 
}: MapMarkerProps) {
  return (
    <Mapbox.PointAnnotation
      id={location.id}
      coordinate={location.coordinates}
      onSelected={onPress}
    >
      <View className="items-center" style={{ minWidth: 100 }}>
        {/* Marker Icon Container */}
        <View className="relative">
          <View 
            className={`items-center justify-center rounded-full border-2 border-white shadow-lg ${
              isSelected ? 'scale-110' : 'scale-100'
            }`}
            style={{ 
              backgroundColor: color,
              width: 40,
              height: 40,
            }}
          >
            <Icon as={MapPinIcon} className="size-5 text-white" />
          </View>
          
          {/* Remove Button - ย้ายมาอยู่ใน container เดียวกัน */}
          {onRemove && (
            <TouchableOpacity
              onPress={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full"
              style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon as={XIcon} className="size-3 text-white" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Location Name - ย้ายมาอยู่ใน container เดียวกัน */}
        {isSelected && (
          <View className="mt-2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
            <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {location.name}
            </Text>
          </View>
        )}
      </View>
    </Mapbox.PointAnnotation>
  );
}

interface CustomMarkerProps {
  coordinate: [number, number];
  title?: string;
  onPress?: () => void;
  color?: string;
}

export function CustomMarker({ 
  coordinate, 
  title, 
  onPress, 
  color = '#EF4444' 
}: CustomMarkerProps) {
  return (
    <Mapbox.PointAnnotation
      id={`custom-${coordinate[0]}-${coordinate[1]}`}
      coordinate={coordinate}
      onSelected={onPress}
    >
      <View className="items-center" style={{ minWidth: 80 }}>
        <View 
          className="items-center justify-center rounded-full border-2 border-white shadow-lg"
          style={{ 
            backgroundColor: color,
            width: 36,
            height: 36,
          }}
        >
          <Icon as={MapPinIcon} className="size-4 text-white" />
        </View>
        
        {title && (
          <View className="mt-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
            <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {title}
            </Text>
          </View>
        )}
      </View>
    </Mapbox.PointAnnotation>
  );
}

import { MapPinIcon } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { LocationResult } from '@/features/ride/services/searchService';
import { Icon } from '@/ui/icon';
import { Skeleton } from '@/ui/skeleton';

type FieldType = 'pickup' | 'destination';

interface SearchResultsProps {
  fieldType: FieldType;
  results: LocationResult[];
  isLoading: boolean;
  hasQuery: boolean;
  label: string;
  onLocationSelect: (location: LocationResult) => void;
}

const SearchResults = React.memo<SearchResultsProps>(
  ({ fieldType, results, isLoading, hasQuery, label, onLocationSelect }) => {
    // Render search result item
    const renderSearchResult = ({ item }: { item: LocationResult }) => (
      <TouchableOpacity
        onPress={() => onLocationSelect(item)}
        className="flex-row items-center p-3 border-b border-gray-100 dark:border-gray-800"
      >
        <View className="mr-3">
          <Icon as={MapPinIcon} className="size-4 text-blue-500" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900 dark:text-gray-100 text-sm">{item.name}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.address}</Text>
        </View>
      </TouchableOpacity>
    );

    // Render skeleton loading items
    const renderSkeletonItem = () => (
      <View className="flex-row items-center p-3 border-b border-gray-100 dark:border-gray-800">
        <View className="mr-3">
          <Skeleton className="w-8 h-8 rounded-full" />
        </View>
        <View className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </View>
      </View>
    );

    if (isLoading) {
      return (
        <>
          <View className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              กำลังค้นหา{label}...
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static
              <View key={`skeleton-${fieldType}-${index}`}>{renderSkeletonItem()}</View>
            ))}
          </View>
        </>
      );
    }

    if (results.length > 0) {
      return (
        <>
          <View className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ผลการค้นหา{label}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {results.map((item) => (
              <View key={item.id}>{renderSearchResult({ item })}</View>
            ))}
          </View>
        </>
      );
    }

    if (hasQuery) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">ไม่พบสถานที่ที่ค้นหา</Text>
        </View>
      );
    }

    return null;
  }
);

SearchResults.displayName = 'SearchResults';

export default SearchResults;

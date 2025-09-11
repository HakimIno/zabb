import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '@/src/components/ui/icon';
import { Text } from '@/src/components/ui/text';
import { geocodingService, LocationResult } from '@/src/services/geocoding';
import { SearchIcon, MapPinIcon, XIcon } from 'lucide-react-native';

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  currentLocation?: [number, number];
}

export function LocationSearch({ 
  onLocationSelect, 
  placeholder = "ค้นหาสถานที่...",
  currentLocation 
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // ค้นหาสถานที่เมื่อมีการพิมพ์
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await geocodingService.searchLocation({
          query: query.trim(),
          proximity: currentLocation,
          limit: 10,
        });
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // หน่วงเวลา 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, currentLocation]);

  const handleLocationSelect = (location: LocationResult) => {
    setQuery(location.name);
    setResults([]);
    setIsFocused(false);
    onLocationSelect(location);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const renderLocationItem = ({ item }: { item: LocationResult }) => (
    <TouchableOpacity
      onPress={() => handleLocationSelect(item)}
      className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700"
    >
      <View className="mr-3">
        <Icon as={MapPinIcon} className="size-5 text-blue-500" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900 dark:text-gray-100">
          {item.name}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="relative">
      {/* Search Input */}
      <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2">
        <Icon as={SearchIcon} className="size-5 text-gray-400 mr-2" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-gray-900 dark:text-gray-100 text-base"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} className="ml-2">
            <Icon as={XIcon} className="size-4 text-gray-400" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {isFocused && (query.length > 0 || results.length > 0) && (
        <View className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-64 shadow-lg">
          {isLoading ? (
            <View className="p-4 items-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 dark:text-gray-400 mt-2">
                กำลังค้นหา...
              </Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : query.length >= 2 ? (
            <View className="p-4 items-center">
              <Text className="text-gray-500 dark:text-gray-400">
                ไม่พบสถานที่ที่ค้นหา
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

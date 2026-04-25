import { useRouter } from 'expo-router';
import {
  ArrowLeftIcon,
  BuildingIcon,
  ClockIcon,
  HomeIcon,
  MapPinIcon,
  NavigationIcon,
  SearchIcon,
  TrendingUpIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import type { LocationResult } from '@/features/map/services/geocoding';
import { useSearchPlaces } from '@/features/ride/hooks/useSearch';
import type { SearchRequest } from '@/features/ride/services/searchService';
import { Icon } from '@/ui/icon';
import { Text } from '@/ui/text';

interface SearchScreenProps {
  currentLocation?: [number, number];
  onLocationSelect?: (location: LocationResult) => void;
}

// Mock data for recent searches and popular destinations
interface PopularDestination {
  id: string;
  name: string;
  address: string;
  type: string;
  distance: string;
}

interface RecentSearch {
  id: string;
  name: string;
  address: string;
  type: string;
}

const POPULAR_DESTINATIONS: PopularDestination[] = [
  {
    id: '1',
    name: 'Suvarnabhumi Airport',
    address: 'Samut Prakan, Thailand',
    type: 'airport',
    distance: '45 km',
  },
  {
    id: '2',
    name: 'Terminal 21',
    address: 'Sukhumvit Road, Bangkok',
    type: 'shopping',
    distance: '8 km',
  },
  {
    id: '3',
    name: 'Wat Pho',
    address: 'Sanam Chai Road, Bangkok',
    type: 'temple',
    distance: '12 km',
  },
  {
    id: '4',
    name: 'Chatuchak Weekend Market',
    address: 'Kamphaeng Phet 2 Road, Bangkok',
    type: 'market',
    distance: '15 km',
  },
  {
    id: '5',
    name: 'Lumpini Park',
    address: 'Rama IV Road, Bangkok',
    type: 'park',
    distance: '6 km',
  },
  {
    id: '6',
    name: 'Asiatique',
    address: 'Charoenkrung Road, Bangkok',
    type: 'entertainment',
    distance: '18 km',
  },
];

const RECENT_SEARCHES: RecentSearch[] = [
  { id: '1', name: 'Central World', address: 'Ratchadamri Road, Bangkok', type: 'shopping' },
  { id: '2', name: 'Siam Paragon', address: 'Rama I Road, Bangkok', type: 'shopping' },
  {
    id: '3',
    name: 'Chatuchak Weekend Market',
    address: 'Kamphaeng Phet 2 Road, Bangkok',
    type: 'market',
  },
];

const QUICK_ACTIONS = [
  { id: 'home', name: 'Home', icon: HomeIcon },
  { id: 'work', name: 'Work', icon: BuildingIcon },
  { id: 'current', name: 'Current', icon: NavigationIcon },
];

export function SearchScreen({ currentLocation, onLocationSelect }: SearchScreenProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [_isLoading, _setIsLoading] = useState(false);
  const [_isFocused, _setIsFocused] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Create search request
  const searchRequest: SearchRequest | null = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      return null;
    }

    return {
      language: 'th',
      limit: 10,
      query: debouncedQuery.trim(),
      ...(currentLocation && {
        proximity: {
          lat: currentLocation[1],
          lng: currentLocation[0],
        },
      }),
    };
  }, [debouncedQuery, currentLocation]);

  // Use TanStack Query for search
  const {
    data: searchResults = [],
    isLoading: isSearching,
    isError,
  } = useSearchPlaces(searchRequest, {
    enabled: !!searchRequest,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  const handleLocationSelect = (location: LocationResult) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    router.back();
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'home': {
        const homeLocation: LocationResult = {
          id: 'home',
          name: 'Home',
          address: '123 Sukhumvit Road, Bangkok',
          coordinates: [100.5018, 13.7563],
          placeType: 'home',
        };
        handleLocationSelect(homeLocation);
        break;
      }
      case 'work': {
        const workLocation: LocationResult = {
          id: 'work',
          name: 'Office',
          address: '456 Silom Road, Bangkok',
          coordinates: [100.5355, 13.7307],
          placeType: 'work',
        };
        handleLocationSelect(workLocation);
        break;
      }
      case 'current':
        if (currentLocation) {
          const currentLocationResult: LocationResult = {
            id: 'current',
            name: 'Current Location',
            address: 'Your current location',
            coordinates: currentLocation,
            placeType: 'current',
          };
          handleLocationSelect(currentLocationResult);
        } else {
          Alert.alert('Location Error', 'Unable to get current location');
        }
        break;
    }
  };

  const handlePopularDestinationSelect = (destination: PopularDestination) => {
    const location: LocationResult = {
      id: destination.id,
      name: destination.name,
      address: destination.address,
      coordinates: [100.5018, 13.7563],
      placeType: destination.type,
    };
    handleLocationSelect(location);
  };

  const handleRecentSearchSelect = (search: RecentSearch) => {
    const location: LocationResult = {
      id: search.id,
      name: search.name,
      address: search.address,
      coordinates: [100.5018, 13.7563],
      placeType: search.type,
    };
    handleLocationSelect(location);
  };

  const renderSearchResult = ({ item }: { item: LocationResult }) => (
    <TouchableOpacity
      onPress={() => handleLocationSelect(item)}
      className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800"
    >
      <View className="mr-3">
        <Icon as={MapPinIcon} className="size-5 text-blue-500" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900 dark:text-gray-100">{item.name}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Minimalist Header */}
      <View className="pt-14 pb-6 px-6 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900"
          >
            <Icon as={ArrowLeftIcon} className="size-5 text-gray-700 dark:text-gray-300" />
          </TouchableOpacity>

          <Text className="text-xl font-light text-gray-900 dark:text-gray-100 tracking-wide">
            Destination
          </Text>

          <View className="w-10" />
        </View>
      </View>

      {/* Search Input */}
      <View className="px-6 pt-8 pb-6">
        <View className="relative">
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Icon as={SearchIcon} className="size-5 text-gray-400" />
          </View>
          <TextInput
            className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-900 dark:text-gray-100 text-base font-light border border-gray-200 dark:border-gray-800 focus:border-gray-900 dark:focus:border-gray-100"
            placeholder="Search places..."
            placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* Search Results */}
      {searchQuery.length > 0 ? (
        <View className="flex-1">
          {isSearching ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 dark:text-gray-400">กำลังค้นหา...</Text>
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-red-500 dark:text-red-400 text-center mb-2">
                เกิดข้อผิดพลาดในการค้นหา
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
                กรุณาลองใหม่อีกครั้ง
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <View className="flex-1">
              {/* แสดงข้อความแจ้งเตือนเมื่อใช้ fallback data */}
              {searchResults.some((item) => item.id.startsWith('fallback-')) && (
                <View className="mx-6 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
                    กำลังใช้ข้อมูลสำรอง เนื่องจากปัญหาการเชื่อมต่อ
                  </Text>
                </View>
              )}
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                className="flex-1"
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 dark:text-gray-400">ไม่พบสถานที่ที่ค้นหา</Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Minimalist Quick Actions */}
          <View className="px-6 pb-8">
            <View className="flex-row justify-between">
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleQuickAction(action.id)}
                  className="flex-1 mx-1 first:ml-0 last:mr-0"
                >
                  <View className="h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl items-center justify-center border border-gray-200 dark:border-gray-800">
                    <Icon
                      as={action.icon}
                      className="size-6 text-gray-700 dark:text-gray-300 mb-1"
                    />
                    <Text className="text-xs font-light text-gray-600 dark:text-gray-400">
                      {action.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Select on Map - Elegant Button */}
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/(tabs)',
                  params: {
                    selectOnMap: 'true',
                  },
                });
              }}
              className="mt-4 h-14 bg-gray-900 dark:bg-gray-100 rounded-2xl flex-row items-center justify-center"
            >
              <Icon as={MapPinIcon} className="size-5 text-white dark:text-gray-900 mr-2" />
              <Text className="text-white dark:text-gray-900 font-medium tracking-wide">
                Select on Map
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Searches - Clean List */}
          {RECENT_SEARCHES.length > 0 && (
            <View className="px-6 pb-8">
              <View className="flex-row items-center mb-4">
                <Icon as={ClockIcon} className="size-4 text-gray-400 mr-2" />
                <Text className="text-sm font-light text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                  Recent
                </Text>
              </View>

              <View className="space-y-1">
                {RECENT_SEARCHES.map((search, _index) => (
                  <TouchableOpacity
                    key={search.id}
                    onPress={() => handleRecentSearchSelect(search)}
                    className="py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <View className="flex-row items-center">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {search.name}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 font-light">
                          {search.address}
                        </Text>
                      </View>
                      <Icon
                        as={ArrowLeftIcon}
                        className="size-4 text-gray-300 dark:text-gray-600 rotate-180"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Destinations - Refined List */}
          <View className="px-6 pb-8">
            <View className="flex-row items-center mb-4">
              <Icon as={TrendingUpIcon} className="size-4 text-gray-400 mr-2" />
              <Text className="text-sm font-light text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                Popular
              </Text>
            </View>

            <View className="space-y-1">
              {POPULAR_DESTINATIONS.map((destination, _index) => (
                <TouchableOpacity
                  key={destination.id}
                  onPress={() => handlePopularDestinationSelect(destination)}
                  className="py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {destination.name}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400 font-light">
                        {destination.address}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-gray-400 dark:text-gray-500 font-light">
                        {destination.distance}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-32" />
        </ScrollView>
      )}
    </View>
  );
}

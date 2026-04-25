import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { XIcon } from 'lucide-react-native';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useLocationSearch } from '@/features/map/hooks/useLocationSearch';
import type { LocationResult } from '@/features/ride/services/searchService';
import { Icon } from '@/ui/icon';
import { DestinationIcon, PickupIcon } from './LocationIcons';
import SearchInput from './SearchInput';

interface LocationSelectorProps {
  onCancel: () => void;
  onSelectPickupLocation: (location: LocationResult) => void;
  onSelectDestination: (location: LocationResult) => void;
  currentLocation?: [number, number];
  onPickupMapSelect?: () => void;
  onDestinationMapSelect?: () => void;
}

type FieldType = 'pickup' | 'destination';

const LocationSelector = ({
  onCancel,
  onSelectPickupLocation,
  onSelectDestination,
  currentLocation,
  onPickupMapSelect,
  onDestinationMapSelect,
}: LocationSelectorProps) => {
  const {
    focusedField,
    setFocusedField,
    updateFieldText,
    getFieldState,
    createManualLocation,
    searchResults,
    isSearching,
  } = useLocationSearch({ currentLocation });

  // Generic location select handler
  const handleLocationSelect = (location: LocationResult, fieldType: FieldType) => {
    updateFieldText(fieldType, location.name);

    if (fieldType === 'pickup') {
      onSelectPickupLocation(location);
    } else {
      onSelectDestination(location);
    }
    setFocusedField(null);
  };

  // Generic submit handler
  const _handleSubmit = (fieldType: FieldType) => {
    const fieldState = getFieldState(fieldType);
    const text = fieldState.text.trim();

    if (!text) {
      return;
    }

    const location = createManualLocation(fieldType);

    if (fieldType === 'pickup') {
      onSelectPickupLocation(location);
    } else {
      onSelectDestination(location);
    }
  };

  // Field configuration
  const fieldConfig = {
    pickup: {
      placeholder: 'ค้นหาจุดรับ...',
      iconColor: 'green',
      iconUri: 'https://img.icons8.com/deco-glyph/48/40C057/map-marker.png',
      label: 'สถานที่รับ',
    },
    destination: {
      placeholder: 'ค้นหาปลายทาง...',
      iconColor: 'indigo',
      iconUri: 'https://img.icons8.com/deco-glyph/48/7950F2/map-marker.png',
      label: 'ปลายทาง',
    },
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between p-2 border-b border-gray-200 dark:border-neutral-900"
        style={{ paddingHorizontal: 16 }}
      >
        <Text className="text-xl font-medium text-gray-900 dark:text-gray-100 font-anuphan-semibold">
          เลือกตำแหน่ง
        </Text>
        <TouchableOpacity onPress={onCancel} className="p-0">
          <Icon as={XIcon} className="size-5 text-gray-500" />
        </TouchableOpacity>
      </View>

      {/* Location Inputs */}
      <View
        className="flex flex-col gap-2 mt-3 border-b border-gray-200 dark:border-neutral-900 pb-4"
        style={{ paddingHorizontal: 16 }}
      >
        <SearchInput
          fieldType="pickup"
          value={getFieldState('pickup').text}
          isFocused={focusedField === 'pickup'}
          placeholder={fieldConfig.pickup.placeholder}
          iconComponent={<PickupIcon />}
          iconColor={fieldConfig.pickup.iconColor}
          iconUri={fieldConfig.pickup.iconUri}
          onTextChange={(text) => updateFieldText('pickup', text)}
          onFocus={() => setFocusedField('pickup')}
          onBlur={() => setFocusedField(null)}
          onSubmit={() => {}}
          onClear={() => updateFieldText('pickup', '')}
          onMapSelect={onPickupMapSelect}
        />
        <SearchInput
          fieldType="destination"
          value={getFieldState('destination').text}
          isFocused={focusedField === 'destination'}
          placeholder={fieldConfig.destination.placeholder}
          iconComponent={<DestinationIcon />}
          iconColor={fieldConfig.destination.iconColor}
          iconUri={fieldConfig.destination.iconUri}
          onTextChange={(text) => updateFieldText('destination', text)}
          onFocus={() => setFocusedField('destination')}
          onBlur={() => setFocusedField(null)}
          onSubmit={() => {}}
          onClear={() => updateFieldText('destination', '')}
          onMapSelect={onDestinationMapSelect}
        />
      </View>

      {/* Search Results Dropdown */}
      {focusedField && (
        <BottomSheetFlatList
          data={searchResults}
          keyExtractor={(item: LocationResult) => item.id.toString()}
          renderItem={({ item }: { item: LocationResult }) => (
            <TouchableOpacity
              onPress={() => handleLocationSelect(item, focusedField)}
              className="p-4 border-b border-gray-100 dark:border-neutral-800"
            >
              <Text className="text-gray-900 dark:text-gray-100 font-medium">{item.name}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">{item.address}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            isSearching ? (
              <View className="p-4 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-500 mt-2">กำลังค้นหา...</Text>
              </View>
            ) : (
              <View className="p-4 items-center">
                <Text className="text-gray-500">ไม่พบสถานที่ที่ค้นหา</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default LocationSelector;

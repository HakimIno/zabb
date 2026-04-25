import Mapbox from '@rnmapbox/maps';
import { MapPinIcon, NavigationIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { geocodingService, type LocationResult } from '@/features/map/services/geocoding';
import { useMapStore } from '@/stores/mapStore';
import { Icon } from '@/ui/icon';
import { Text } from '@/ui/text';
import { LocationSearch } from './LocationSearch';
import { CustomMarker, MapMarker } from './MapMarker';

interface InteractiveMapProps {
  initialLocation?: [number, number];
  initialZoom?: number;
}

export function InteractiveMap({
  initialLocation = [100.5018, 13.7563], // กรุงเทพฯ
  initialZoom = 10,
}: InteractiveMapProps) {
  const { colorScheme } = useColorScheme();
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isAddingMarker, setIsAddingMarker] = useState(false);

  const {
    currentLocation,
    selectedLocation,
    markers,
    customMarkers,
    setCurrentLocation,
    setSelectedLocation,
    addMarker,
    removeMarker,
    clearMarkers,
    addCustomMarker,
    removeCustomMarker,
    clearCustomMarkers,
  } = useMapStore();

  // ตั้งค่าตำแหน่งเริ่มต้น
  useEffect(() => {
    if (!currentLocation) {
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation, currentLocation, setCurrentLocation]);

  // จัดการการแตะบนแผนที่
  // biome-ignore lint/suspicious/noExplicitAny: Mapbox event type is complex
  const handleMapPress = async (event: any) => {
    if (!isAddingMarker) return;

    const { geometry } = event;
    const coordinate: [number, number] = geometry.coordinates;

    try {
      // แปลงพิกัดเป็นชื่อสถานที่
      const location = await geocodingService.reverseGeocode(coordinate);

      if (location) {
        addCustomMarker(coordinate, location.name);
        Alert.alert('เพิ่มหมุดสำเร็จ', `เพิ่มหมุดที่ ${location.name} แล้ว`, [{ text: 'ตกลง' }]);
      } else {
        addCustomMarker(coordinate, 'ตำแหน่งที่เลือก');
        Alert.alert('เพิ่มหมุดสำเร็จ', 'เพิ่มหมุดที่ตำแหน่งที่เลือกแล้ว', [{ text: 'ตกลง' }]);
      }
    } catch (error) {
      console.error('Error adding marker:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มหมุดได้');
    }

    setIsAddingMarker(false);
  };

  // จัดการการเลือกสถานที่จากการค้นหา
  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setShowSearch(false);

    // เคลื่อนที่แผนที่ไปยังตำแหน่งที่เลือก
    cameraRef.current?.setCamera({
      centerCoordinate: location.coordinates,
      zoomLevel: 15,
      animationDuration: 1000,
    });
  };

  // เพิ่มหมุดจากสถานที่ที่เลือก
  const handleAddMarker = () => {
    if (selectedLocation) {
      addMarker(selectedLocation);
      Alert.alert('เพิ่มหมุดสำเร็จ', `เพิ่มหมุดที่ ${selectedLocation.name} แล้ว`, [{ text: 'ตกลง' }]);
    }
  };

  // ลบหมุดทั้งหมด
  const handleClearMarkers = () => {
    Alert.alert('ลบหมุดทั้งหมด', 'คุณต้องการลบหมุดทั้งหมดหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: () => {
          clearMarkers();
          clearCustomMarkers();
        },
      },
    ]);
  };

  // กลับไปตำแหน่งปัจจุบัน
  const handleGoToCurrentLocation = () => {
    if (currentLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: currentLocation,
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  return (
    <View className="flex-1">
      {/* Map */}
      <Mapbox.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={colorScheme === 'dark' ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={currentLocation || initialLocation}
          zoomLevel={initialZoom}
        />

        {/* Markers from search results */}
        {markers.map((marker) => (
          <MapMarker
            key={marker.id}
            location={marker}
            isSelected={selectedLocation?.id === marker.id}
            onPress={() => setSelectedLocation(marker)}
            onRemove={() => removeMarker(marker.id)}
            color="#3B82F6"
          />
        ))}

        {/* Custom markers */}
        {customMarkers.map((marker) => (
          <CustomMarker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            onPress={() => {
              Alert.alert('หมุดที่ปัก', marker.title || 'ตำแหน่งที่เลือก', [
                { text: 'ตกลง' },
                {
                  text: 'ลบ',
                  style: 'destructive',
                  onPress: () => removeCustomMarker(marker.id),
                },
              ]);
            }}
            color="#EF4444"
          />
        ))}
      </Mapbox.MapView>

      {/* Search Overlay */}
      {showSearch && (
        <View className="absolute top-16 left-4 right-4 z-10">
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            currentLocation={currentLocation || undefined}
            placeholder="ค้นหาสถานที่..."
          />
        </View>
      )}

      {/* Control Buttons */}
      <View className="absolute bottom-6 right-4 space-y-3">
        {/* Search Button */}
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg"
        >
          <Icon as={SearchIcon} className="size-6 text-gray-700 dark:text-gray-300" />
        </TouchableOpacity>

        {/* Add Marker Button */}
        <TouchableOpacity
          onPress={() => setIsAddingMarker(!isAddingMarker)}
          className={`rounded-full p-3 shadow-lg ${
            isAddingMarker ? 'bg-red-500' : 'bg-white dark:bg-gray-800'
          }`}
        >
          <Icon
            as={PlusIcon}
            className={`size-6 ${
              isAddingMarker ? 'text-white' : 'text-gray-700 dark:text-gray-300'
            }`}
          />
        </TouchableOpacity>

        {/* Current Location Button */}
        <TouchableOpacity
          onPress={handleGoToCurrentLocation}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg"
        >
          <Icon as={NavigationIcon} className="size-6 text-gray-700 dark:text-gray-300" />
        </TouchableOpacity>

        {/* Clear Markers Button */}
        {(markers.length > 0 || customMarkers.length > 0) && (
          <TouchableOpacity
            onPress={handleClearMarkers}
            className="bg-red-500 rounded-full p-3 shadow-lg"
          >
            <Icon as={TrashIcon} className="size-6 text-white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Location Info */}
      {selectedLocation && (
        <View className="absolute bottom-6 left-4 right-20 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                {selectedLocation.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedLocation.address}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleAddMarker}
              className="ml-3 bg-blue-500 px-3 py-2 rounded-md flex-row items-center"
            >
              <Icon as={MapPinIcon} className="size-4 mr-1 text-white" />
              <Text className="text-white text-sm font-medium">เพิ่มหมุด</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Adding Marker Instruction */}
      {isAddingMarker && (
        <View className="absolute top-20 left-4 right-4 bg-blue-500 rounded-lg p-3">
          <Text className="text-white text-center font-medium">แตะบนแผนที่เพื่อเพิ่มหมุด</Text>
        </View>
      )}
    </View>
  );
}

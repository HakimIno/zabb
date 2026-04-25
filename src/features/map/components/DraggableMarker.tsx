import Mapbox from '@rnmapbox/maps';
import { GripVerticalIcon, MapPinIcon, NavigationIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Icon } from '@/ui/icon';

interface DraggableMarkerProps {
  id: string;
  coordinate: [number, number];
  type?: 'origin' | 'destination' | 'current' | 'pickup';
  onDragEnd?: (coordinate: [number, number]) => void;
  draggable?: boolean;
}

export function DraggableMarker({
  id,
  coordinate,
  type = 'destination',
  onDragEnd,
  draggable = false,
}: DraggableMarkerProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(8)).current;

  const getMarkerStyle = () => {
    switch (type) {
      case 'origin':
      case 'pickup':
        return {
          backgroundColor: '#10B981', // สีเขียว
          shadowColor: '#059669',
          iconColor: '#ffffff',
        };
      case 'destination':
        return {
          backgroundColor: '#EF4444', // สีแดง
          shadowColor: '#DC2626',
          iconColor: '#ffffff',
        };
      case 'current':
        return {
          backgroundColor: '#3B82F6', // สีน้ำเงิน
          shadowColor: '#2563EB',
          iconColor: '#ffffff',
        };
      default:
        return {
          backgroundColor: '#6B7280', // สีเทา
          shadowColor: '#4B5563',
          iconColor: '#ffffff',
        };
    }
  };

  const style = getMarkerStyle();
  const IconComponent = type === 'current' ? NavigationIcon : MapPinIcon;

  // Animation effects
  useEffect(() => {
    if (isDragging) {
      // Start drag animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(shadowAnim, {
          toValue: 16,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Start pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // End drag animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(shadowAnim, {
          toValue: 8,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Reset pulse
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isDragging, scaleAnim, pulseAnim, shadowAnim]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any) => {
    setIsDragging(false);
    if (onDragEnd) {
      const { geometry } = event;
      onDragEnd(geometry.coordinates);
    }
  };

  // Pin shape component
  const PinShape = () => (
    <Animated.View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Pulse effect เมื่อกำลังลาก */}
      {isDragging && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -15,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: style.backgroundColor,
            opacity: 0.15,
            zIndex: 0,
            transform: [{ scale: pulseAnim }],
          }}
        />
      )}

      {/* Pin Body - วงกลม */}
      <Animated.View
        style={{
          width: 50,
          height: 50,
          backgroundColor: style.backgroundColor,
          borderRadius: 25,
          borderWidth: 4,
          borderColor: '#ffffff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: shadowAnim,
          },
          shadowOpacity: isDragging ? 0.4 : 0.3,
          shadowRadius: shadowAnim,
          elevation: isDragging ? 16 : 10,
          zIndex: 2,
        }}
      >
        <Icon as={IconComponent} size={24} color={style.iconColor} />
      </Animated.View>

      {/* Pin Tail - หางแหลม */}
      <View
        style={{
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: 10,
          borderRightWidth: 10,
          borderBottomWidth: 0,
          borderTopWidth: 15,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: style.backgroundColor,
          marginTop: -4,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: isDragging ? 8 : 4,
          },
          shadowOpacity: isDragging ? 0.3 : 0.2,
          shadowRadius: isDragging ? 8 : 4,
          elevation: isDragging ? 12 : 8,
          zIndex: 1,
        }}
      />

      {/* Draggable indicator */}
      {draggable && !isDragging && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -12,
            right: -12,
            width: 28,
            height: 28,
            backgroundColor: style.shadowColor,
            borderRadius: 14,
            borderWidth: 3,
            borderColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
            zIndex: 3,
            opacity: 0.9,
          }}
        >
          <Icon as={GripVerticalIcon} size={14} color="#ffffff" />
        </Animated.View>
      )}

      {/* Floating effect เมื่อกำลังลาก */}
      {isDragging && (
        <View
          style={{
            position: 'absolute',
            top: 45,
            width: 30,
            height: 8,
            borderRadius: 15,
            backgroundColor: '#000000',
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      )}
    </Animated.View>
  );

  return (
    <Mapbox.PointAnnotation
      id={id}
      coordinate={coordinate}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      anchor={{ x: 0.5, y: 1 }} // จุดยึดที่ปลายของ pin
    >
      <PinShape />
    </Mapbox.PointAnnotation>
  );
}

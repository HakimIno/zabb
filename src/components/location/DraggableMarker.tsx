import React, { useState } from 'react';
import { View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Icon } from '@/src/components/ui/icon';
import { MapPinIcon, NavigationIcon, GripVerticalIcon } from 'lucide-react-native';

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
  draggable = false
}: DraggableMarkerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getMarkerStyle = () => {
    switch (type) {
      case 'origin':
      case 'pickup':
        return {
          backgroundColor: '#10B981', // สีเขียว
          size: 44,
          iconSize: 6,
          borderColor: '#059669',
        };
      case 'destination':
        return {
          backgroundColor: '#EF4444', // สีแดง
          size: 44,
          iconSize: 6,
          borderColor: '#DC2626',
        };
      case 'current':
        return {
          backgroundColor: '#3B82F6', // สีน้ำเงิน
          size: 40,
          iconSize: 5,
          borderColor: '#2563EB',
        };
      default:
        return {
          backgroundColor: '#6B7280', // สีเทา
          size: 40,
          iconSize: 5,
          borderColor: '#4B5563',
        };
    }
  };

  const style = getMarkerStyle();
  const IconComponent = type === 'current' ? NavigationIcon : MapPinIcon;

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

  return (
    <Mapbox.PointAnnotation
      id={id}
      coordinate={coordinate}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <View
        style={{
          width: style.size,
          height: style.size,
          backgroundColor: style.backgroundColor,
          borderRadius: style.size / 2,
          borderWidth: 4,
          borderColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: isDragging ? 8 : 4,
          },
          shadowOpacity: isDragging ? 0.4 : 0.25,
          shadowRadius: isDragging ? 8 : 4,
          elevation: isDragging ? 12 : 6,
          transform: [{ scale: isDragging ? 1.1 : 1 }],
        }}
      >
        <Icon 
          as={IconComponent} 
          className={`size-${style.iconSize} text-white`} 
        />
        
        {/* แสดงจุดจับเมื่อสามารถลากได้ */}
        {draggable && (
          <View
            style={{
              position: 'absolute',
              top: -16,
              right: -16,
              width: 24,
              height: 24,
              backgroundColor: style.borderColor,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Icon 
              as={GripVerticalIcon} 
              className="size-3 text-white" 
            />
          </View>
        )}
      </View>
    </Mapbox.PointAnnotation>
  );
}

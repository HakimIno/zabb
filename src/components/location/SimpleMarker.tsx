import React from 'react';
import { View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Icon } from '@/src/components/ui/icon';
import { MapPinIcon, NavigationIcon } from 'lucide-react-native';

interface SimpleMarkerProps {
  id: string;
  coordinate: [number, number];
  type?: 'origin' | 'destination' | 'current';
  onPress?: () => void;
}

export function SimpleMarker({ 
  id, 
  coordinate, 
  type = 'destination',
  onPress 
}: SimpleMarkerProps) {
  const getMarkerStyle = () => {
    switch (type) {
      case 'origin':
        return {
          backgroundColor: '#10B981', // สีเขียว
          size: 40,
          iconSize: 5,
        };
      case 'destination':
        return {
          backgroundColor: '#EF4444', // สีแดง
          size: 40,
          iconSize: 5,
        };
      case 'current':
        return {
          backgroundColor: '#3B82F6', // สีน้ำเงิน
          size: 36,
          iconSize: 4,
        };
      default:
        return {
          backgroundColor: '#6B7280', // สีเทา
          size: 36,
          iconSize: 4,
        };
    }
  };

  const style = getMarkerStyle();
  const IconComponent = type === 'current' ? NavigationIcon : MapPinIcon;

  return (
    <Mapbox.PointAnnotation
      id={id}
      coordinate={coordinate}
      onSelected={onPress}
    >
      <View
        style={{
          width: style.size,
          height: style.size,
          backgroundColor: style.backgroundColor,
          borderRadius: style.size / 2,
          borderWidth: 3,
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
          as={IconComponent} 
          className={`size-${style.iconSize} text-white`} 
        />
      </View>
    </Mapbox.PointAnnotation>
  );
}

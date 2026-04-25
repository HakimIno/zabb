import { MapPinIcon } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Icon } from '@/ui/icon';

interface FloatingPinProps {
  type?: 'pickup' | 'destination';
  isActive?: boolean;
  onPinDrop?: () => void;
}

export function FloatingPin({
  type = 'destination',
  isActive = false,
  onPinDrop,
}: FloatingPinProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(8)).current;

  const getMarkerStyle = () => {
    switch (type) {
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
      default:
        return {
          backgroundColor: '#6B7280', // สีเทา
          shadowColor: '#4B5563',
          iconColor: '#ffffff',
        };
    }
  };

  const style = getMarkerStyle();

  // Animation เมื่อ pin กำลังเคลื่อนไหว
  useEffect(() => {
    if (isActive) {
      // เริ่ม bounce animation
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      // เริ่ม scale animation
      Animated.parallel([
        bounceAnimation,
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 12,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      return () => {
        bounceAnimation.stop();
      };
    } else {
      // Reset animations
      Animated.parallel([
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
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
      ]).start(() => {
        if (onPinDrop) {
          onPinDrop();
        }
      });
    }
  }, [isActive, bounceAnim, scaleAnim, shadowAnim, onPinDrop]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.pinContainer,
          {
            transform: [{ translateY: bounceAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Pin Body - วงกลม */}
        <Animated.View
          style={[
            styles.pinBody,
            {
              backgroundColor: style.backgroundColor,
              shadowColor: '#000000',
              shadowOffset: {
                width: 0,
                height: shadowAnim,
              },
              shadowOpacity: 0.3,
              shadowRadius: shadowAnim,
              elevation: isActive ? 16 : 10,
            },
          ]}
        >
          <Icon as={MapPinIcon} size={24} color={style.iconColor} />
        </Animated.View>

        {/* Pin Tail - หางแหลม */}
        <View
          style={[
            styles.pinTail,
            {
              borderTopColor: style.backgroundColor,
            },
          ]}
        />

        {/* Ground Shadow */}
        <Animated.View
          style={[
            styles.groundShadow,
            {
              opacity: isActive ? 0.3 : 0.2,
              transform: [{ scaleX: isActive ? 1.2 : 1 }],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -65 }], // Center the pin
    zIndex: 1000,
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBody: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pinTail: {
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
    marginTop: -4,
    zIndex: 1,
  },
  groundShadow: {
    position: 'absolute',
    top: 60,
    width: 30,
    height: 8,
    borderRadius: 15,
    backgroundColor: '#000000',
    opacity: 0.2,
    zIndex: 0,
  },
});

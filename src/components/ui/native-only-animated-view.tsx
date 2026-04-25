import type React from 'react';
import Animated from 'react-native-reanimated';

interface NativeOnlyAnimatedViewProps {
  children?: React.ReactNode;
  className?: string;
  // biome-ignore lint/suspicious/noExplicitAny: complex animated style type
  style?: any;
  // biome-ignore lint/suspicious/noExplicitAny: reanimated transition type
  entering?: any;
  // biome-ignore lint/suspicious/noExplicitAny: reanimated transition type
  exiting?: any;
  // biome-ignore lint/suspicious/noExplicitAny: allow rest props
  [key: string]: any;
}

const NativeOnlyAnimatedView = ({ children, className, ...props }: NativeOnlyAnimatedViewProps) => {
  return (
    <Animated.View style={props.style} className={className} {...props}>
      {children}
    </Animated.View>
  );
};

export default NativeOnlyAnimatedView;

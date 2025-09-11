import React from 'react'
import Animated from 'react-native-reanimated'

interface NativeOnlyAnimatedViewProps {
  children?: React.ReactNode
  className?: string
  entering?: any
  exiting?: any
  [key: string]: any
}

const NativeOnlyAnimatedView = ({ children, className, ...props }: NativeOnlyAnimatedViewProps) => {
  return (
    <Animated.View className={className} {...props}>
      {children}
    </Animated.View>
  )
}

export default NativeOnlyAnimatedView
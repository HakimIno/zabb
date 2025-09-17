import { cn } from '@/src/utils/utils';
import { View } from 'react-native';
import React from 'react';

const Skeleton = React.forwardRef<View, React.ComponentProps<typeof View>>(({
  className,
  ...props
}, ref) => {
  return <View ref={ref} className={cn('bg-accent rounded-md', className)} {...props} />;
});

Skeleton.displayName = 'Skeleton';

export { Skeleton };

import React from 'react';
import { View } from 'react-native';
import { cn } from '@/src/utils/utils';

const Skeleton = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => {
    return <View ref={ref} className={cn('bg-accent rounded-md', className)} {...props} />;
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };

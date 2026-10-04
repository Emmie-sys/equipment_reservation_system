import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface SmoothRevealProps {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  scale?: boolean;
}

/**
 * SmoothReveal — Apple HIG Spring Entrance Wrapper
 * Provides silky smooth hardware-accelerated fade-in and vertical spring slide.
 */
export const SmoothReveal: React.FC<SmoothRevealProps> = ({
  children,
  delay = 0,
  distance = 14,
  style,
  scale = false,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [delay]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });

  const transform: any[] = [{ translateY }];
  if (scale) {
    transform.push({
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.97, 1],
      }),
    });
  }

  return (
    <Animated.View style={[{ opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
};

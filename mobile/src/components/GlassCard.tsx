import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type GlassVariant = 'card' | 'panel' | 'elevated' | 'chrome';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: number;
  highlight?: boolean;
  variant?: GlassVariant;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  padding = 16,
  highlight = false,
  variant = 'card',
}) => {
  const { theme, isDark } = useTheme();

  // Animated value for spring press feedback
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 45,
      bounciness: 2,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 5,
    }).start();
  };

  // Pure Apple HIG rounded glass variants with uniform continuous borders (no inner seams or sharp corners)
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'panel':
        return {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 14,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.borderMedium,
          borderRadius: 18,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.06,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'chrome':
        return {
          backgroundColor: theme.colors.surfacePrimary,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 16,
        };
      case 'card':
      default:
        return {
          backgroundColor: theme.colors.surfacePrimary,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 16,
        };
    }
  };

  const baseCardStyle: StyleProp<ViewStyle> = [
    styles.card,
    getVariantStyle(),
    {
      padding,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.18 : 0.04,
      shadowRadius: 3,
      elevation: 2,
    },
    highlight && {
      borderColor: isDark ? 'rgba(0, 160, 160, 0.45)' : theme.colors.brandTealBase,
      backgroundColor: theme.colors.surfaceElevated,
    },
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={baseCardStyle}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={baseCardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});

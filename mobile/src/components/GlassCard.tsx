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
      toValue: 0.968,
      useNativeDriver: true,
      speed: 50,
      bounciness: 2,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  // Variant-based surface opacities and depths
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'panel':
        return {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 12,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.borderMedium,
          // Stronger top-edge highlight for elevated surfaces
          borderTopColor: isDark
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.55 : 0.12,
          shadowRadius: 28,
          elevation: 12,
        };
      case 'chrome':
        return {
          backgroundColor: isDark
            ? 'rgba(5, 18, 11, 0.92)'
            : 'rgba(245, 243, 248, 0.96)',
          borderColor: theme.colors.borderSubtle,
          borderRadius: 16,
        };
      case 'card':
      default:
        return {
          backgroundColor: theme.colors.surfacePrimary,
          borderColor: theme.colors.borderMedium,
          borderRadius: 16,
        };
    }
  };

  // Apple HIG specular top-edge highlight (simulated via top border)
  const specularStyle: ViewStyle = {
    borderTopColor: isDark
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(255, 255, 255, 0.90)',
  };

  const baseCardStyle: StyleProp<ViewStyle> = [
    styles.card,
    getVariantStyle(),
    specularStyle,
    {
      padding,
      shadowColor: isDark ? '#000' : theme.colors.brandForestDark,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.42 : 0.08,
      shadowRadius: 18,
      elevation: 6,
    },
    highlight && {
      borderColor: isDark ? 'rgba(200, 160, 200, 0.45)' : theme.colors.brandPlumDeep,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 1)',
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


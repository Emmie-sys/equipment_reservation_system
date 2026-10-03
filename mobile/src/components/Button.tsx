import React from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'plum' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          button: {
            backgroundColor: isDark ? theme.colors.brandLilacBase : theme.colors.brandForestDark,
            borderColor: isDark ? theme.colors.borderStrong : theme.colors.brandForestDark,
          },
          text: {
            color: isDark ? theme.colors.brandForestDark : '#FAF8FB',
            fontFamily: 'Chirp-Heavy',
            fontWeight: '800' as const,
          },
        };
      case 'plum':
        return {
          button: {
            backgroundColor: theme.colors.brandPlumDeep,
            borderColor: isDark ? 'rgba(230, 212, 230, 0.28)' : 'rgba(90, 45, 92, 0.40)',
          },
          text: {
            color: '#FAF8FB',
            fontFamily: 'Chirp-Bold',
            fontWeight: '700' as const,
          },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: isDark ? 'rgba(225, 29, 72, 0.20)' : 'rgba(225, 29, 72, 0.12)',
            borderColor: isDark ? 'rgba(225, 29, 72, 0.40)' : 'rgba(225, 29, 72, 0.30)',
          },
          text: {
            color: isDark ? '#FB7185' : '#be123c',
            fontFamily: 'Chirp-Bold',
            fontWeight: '700' as const,
          },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderColor: theme.colors.borderMedium,
          },
          text: {
            color: theme.colors.textSecondary,
            fontFamily: 'Chirp-SemiBold',
            fontWeight: '600' as const,
          },
        };
      case 'secondary':
      default:
        return {
          button: {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.borderMedium,
          },
          text: {
            color: theme.colors.textPrimary,
            fontFamily: 'Chirp-SemiBold',
            fontWeight: '600' as const,
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 13,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 22,
          fontSize: 16,
        };
      case 'md':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 14,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        variantStyle.button,
        {
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        (disabled || isLoading) && styles.disabled,
        pressed && !disabled && !isLoading && styles.pressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? (isDark ? theme.colors.brandForestDark : '#FAF8FB') : theme.colors.textPrimary}
        />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              variantStyle.text,
              { fontSize: sizeStyle.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

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
            backgroundColor: theme.colors.brandTealBase,
            borderColor: isDark ? 'rgba(0, 160, 160, 0.40)' : theme.colors.brandTealBase,
          },
          text: {
            color: '#FFFAFA',
            fontFamily: 'Chirp-Bold',
            fontWeight: '700' as const,
          },
        };
      case 'plum':
        return {
          button: {
            backgroundColor: theme.colors.brandOrange,
            borderColor: 'rgba(242, 100, 25, 0.40)',
          },
          text: {
            color: '#FFFFFF',
            fontFamily: 'Chirp-Bold',
            fontWeight: '700' as const,
          },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: isDark ? 'rgba(225, 29, 72, 0.18)' : 'rgba(225, 29, 72, 0.10)',
            borderColor: isDark ? 'rgba(225, 29, 72, 0.35)' : 'rgba(225, 29, 72, 0.25)',
          },
          text: {
            color: isDark ? '#FB7185' : '#E11D48',
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
            color: theme.colors.textPrimary,
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
          height: 36,
          paddingHorizontal: 14,
          fontSize: 13,
          borderRadius: 10,
        };
      case 'lg':
        return {
          height: 50,
          paddingHorizontal: 22,
          fontSize: 16,
          borderRadius: 14,
        };
      case 'md':
      default:
        return {
          height: 44,
          paddingHorizontal: 18,
          fontSize: 15,
          borderRadius: 12,
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
          height: sizeStyle.height,
          minHeight: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
        },
        (disabled || isLoading) && styles.disabled,
        pressed && !disabled && !isLoading && styles.pressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFAFA' : theme.colors.textPrimary}
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
    marginRight: 2,
  },
  text: {
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});

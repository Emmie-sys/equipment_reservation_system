import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'available' | 'active' | 'pending' | 'maintenance' | 'completed' | 'rejected' | 'brand' | 'lilac';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'brand',
  size = 'md',
}) => {
  const { theme, isDark } = useTheme();

  const getBadgeColors = () => {
    switch (variant) {
      case 'available':
        return theme.colors.status.available;
      case 'active':
        return theme.colors.status.active;
      case 'pending':
        return theme.colors.status.pending;
      case 'maintenance':
        return theme.colors.status.maintenance;
      case 'completed':
        return theme.colors.status.completed;
      case 'rejected':
        return theme.colors.status.rejected;
      case 'lilac':
        return {
          bg: isDark ? 'rgba(90, 45, 92, 0.28)' : 'rgba(90, 45, 92, 0.12)',
          text: theme.colors.brandLilacBase,
          border: isDark ? 'rgba(90, 45, 92, 0.45)' : 'rgba(90, 45, 92, 0.28)',
        };
      case 'brand':
      default:
        return {
          bg: isDark ? 'rgba(27, 106, 65, 0.25)' : 'rgba(27, 106, 65, 0.12)',
          text: isDark ? '#34D399' : '#155E38',
          border: isDark ? 'rgba(27, 106, 65, 0.45)' : 'rgba(27, 106, 65, 0.28)',
        };
    }
  };

  const colors = getBadgeColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 8 : 10,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Chirp-Bold',
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral' | 'warning';
  variant?: 'forest' | 'lilac' | 'neutral';
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendType = 'neutral',
  variant = 'forest',
  onPress,
}) => {
  const { theme } = useTheme();
  const iconConfig = theme.colors.icons[variant] || theme.colors.icons.forest;

  const getTrendColor = () => {
    switch (trendType) {
      case 'up':
        return theme.colors.status.available.text;
      case 'warning':
        return theme.colors.status.pending.text;
      case 'down':
        return theme.colors.status.rejected.text;
      case 'neutral':
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <GlassCard style={styles.card} onPress={onPress} padding={12}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {label}
        </Text>
        {icon && (
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: iconConfig.bg,
                borderColor: iconConfig.border,
              },
            ]}
          >
            {icon}
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>

      {trend && (
        <View style={styles.footer}>
          <Text style={[styles.trend, { color: getTrendColor() }]}>{trend}</Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Chirp-SemiBold',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
    marginRight: 6,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  footer: {
    marginTop: 6,
  },
  trend: {
    fontSize: 11,
    fontFamily: 'Chirp-SemiBold',
    fontWeight: '600',
  },
});

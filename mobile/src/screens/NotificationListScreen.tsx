import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Modal,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNotifications, InstitutionalNotification } from '../context/NotificationContext';

// ── Type → icon mapping (no rainbow colors — use theme palette only) ──────────
const TYPE_META: Record<
  InstitutionalNotification['type'],
  { icon: string; label: string }
> = {
  approval: { icon: 'checkmark-circle-outline', label: 'Approved' },
  reminder: { icon: 'alarm-outline',            label: 'Reminder' },
  system:   { icon: 'information-circle-outline', label: 'System'  },
  return:   { icon: 'return-down-back-outline', label: 'Returned' },
};

// ── Notification Card ────────────────────────────────────────────────────────
const NotificationCard: React.FC<{
  item: InstitutionalNotification;
  index: number;
  onPress: (item: InstitutionalNotification) => void;
}> = ({ item, index, onPress }) => {
  const { theme, isDark } = useTheme();
  const meta = TYPE_META[item.type];
  const cardAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 220,
      mass: 0.9,
      delay: index * 55,
      useNativeDriver: true,
    }).start();
  }, []);

  const ty = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });
  const op = cardAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 1] });

  return (
    <Animated.View style={{ opacity: op, transform: [{ translateY: ty }] }}>
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(255,255,255,0.72)',
            borderColor: item.unread
              ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(9,56,31,0.14)'
              : theme.colors.borderSubtle,
            transform: [{ scale: pressed ? 0.984 : 1 }],
            opacity: pressed ? 0.88 : 1,
          },
        ]}
      >
        <View style={styles.cardInner}>
          {/* Icon — forest-green tinted box */}
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: isDark
                  ? 'rgba(0, 70, 67, 0.28)'
                  : 'rgba(0, 70, 67, 0.10)',
              },
            ]}
          >
            <Ionicons
              name={meta.icon as any}
              size={21}
              color={isDark ? '#2DD4BF' : '#004643'}
            />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              {/* Type label with subtle unread dot — matching solar orange indicator */}
              <View style={styles.typeWithDot}>
                {item.unread && (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: '#F26419' },
                    ]}
                  />
                )}
                <Text style={[styles.typeLabel, { color: theme.colors.textMuted }]}>
                  {meta.label.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.timestamp, { color: theme.colors.textMuted }]}>
                {item.timestamp}
              </Text>
            </View>

            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.textPrimary,
                  fontWeight: item.unread ? '700' : '500',
                },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <Text
              style={[styles.cardMessage, { color: theme.colors.textMuted }]}
              numberOfLines={2}
            >
              {item.message}
            </Text>

            {item.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={11} color={theme.colors.textMuted} />
                <Text style={[styles.locationText, { color: theme.colors.textMuted }]}>
                  {item.location}
                </Text>
              </View>
            )}
          </View>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.textMuted}
            style={{ opacity: 0.45 }}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ── Detail Bottom Sheet ──────────────────────────────────────────────────────
const NotificationDetailModal: React.FC<{
  item: InstitutionalNotification | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onMarkUnread: (id: string) => void;
}> = ({ item, visible, onClose, onDelete, onMarkUnread }) => {
  const { theme, isDark } = useTheme();
  const sheetAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      sheetAnim.setValue(0);
      Animated.spring(sheetAnim, {
        toValue: 1,
        damping: 18,
        stiffness: 230,
        mass: 0.85,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(onClose);
  };

  if (!item) return null;

  const meta = TYPE_META[item.type];
  const ty = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [90, 0] });
  const op = sheetAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 1] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.detailOverlay, { opacity: sheetAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View
          style={[
            styles.detailSheet,
            {
              backgroundColor: isDark
                ? 'rgba(9,18,12,0.99)'
                : 'rgba(247,245,248,0.99)',
              borderColor: isDark
                ? 'rgba(255,255,255,0.09)'
                : 'rgba(9,56,31,0.10)',
              transform: [{ translateY: ty }],
              opacity: op,
            },
          ]}
        >
          {/* Handle */}
          <View
            style={[
              styles.sheetHandle,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(0,0,0,0.12)',
              },
            ]}
          />

          {/* Header */}
          <View style={styles.detailHeader}>
            <View
              style={[
                styles.detailIconBox,
                {
                  backgroundColor: isDark
                    ? 'rgba(0, 70, 67, 0.28)'
                    : 'rgba(0, 70, 67, 0.10)',
                },
              ]}
            >
              <Ionicons
                name={meta.icon as any}
                size={26}
                color={isDark ? '#2DD4BF' : '#004643'}
              />
            </View>

            <View style={styles.detailHeaderInfo}>
              <Text style={[styles.detailTypeLabel, { color: theme.colors.textMuted }]}>
                {meta.label.toUpperCase()}
              </Text>
              <Text style={[styles.detailTimestamp, { color: theme.colors.textMuted }]}>
                {item.timestamp}{item.date ? ` · ${item.date}` : ''}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Ionicons name="close" size={21} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Title */}
          <Text style={[styles.detailTitle, { color: theme.colors.textPrimary }]}>
            {item.title}
          </Text>

          <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.detailBody, { color: theme.colors.textMuted }]}>
              {item.message}
            </Text>

            {item.location && (
              <View
                style={[
                  styles.metaChip,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(0, 70, 67, 0.04)',
                    borderColor: theme.colors.borderMedium,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={isDark ? '#2DD4BF' : '#004643'}
                />
                <Text style={[styles.metaChipText, { color: theme.colors.textPrimary }]}>
                  {item.location}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.detailActions}>
            {item.actionLabel && (
              <Pressable
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(0, 70, 67, 0.45)'
                      : '#004643',
                    borderColor: isDark
                      ? 'rgba(0, 127, 122, 0.40)'
                      : '#004643',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: isDark ? '#2DD4BF' : '#F0EDE5' },
                  ]}
                >
                  {item.actionLabel}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={isDark ? '#2DD4BF' : '#F0EDE5'}
                />
              </Pressable>
            )}

            <View style={styles.secondaryRow}>
              <Pressable
                onPress={() => { onMarkUnread(item.id); handleClose(); }}
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(9,56,31,0.04)',
                    borderColor: theme.colors.borderMedium,
                  },
                ]}
              >
                <Ionicons
                  name="mail-unread-outline"
                  size={14}
                  color={theme.colors.textMuted}
                />
                <Text style={[styles.secondaryBtnText, { color: theme.colors.textMuted }]}>
                  Mark Unread
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Alert.alert(
                    'Delete Notification',
                    'Permanently remove this notification?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => { onDelete(item.id); handleClose(); },
                      },
                    ]
                  );
                }}
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: 'rgba(225,29,72,0.07)',
                    borderColor: 'rgba(225,29,72,0.18)',
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={14} color="#FB7185" />
                <Text style={[styles.secondaryBtnText, { color: '#FB7185' }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const NotificationListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [selectedNotif, setSelectedNotif] = useState<InstitutionalNotification | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      damping: 18,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, []);

  const statusBarH =
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : insets.top;
  const topPad = Math.max(insets.top, statusBarH) + 8;

  const handleOpen = useCallback(
    (item: InstitutionalNotification) => {
      markAsRead(item.id);
      setSelectedNotif(item);
      setDetailVisible(true);
    },
    [markAsRead]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setTimeout(() => setSelectedNotif(null), 300);
  }, []);

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Remove all notifications for this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearAll },
    ]);
  };

  const hdrTY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const hdrOp = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.canvasBg }]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.headerBar,
          {
            paddingTop: topPad,
            backgroundColor: isDark
              ? 'rgba(3,12,6,0.94)'
              : 'rgba(244,242,247,0.96)',
            borderBottomColor: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(9,56,31,0.08)',
            opacity: hdrOp,
            transform: [{ translateY: hdrTY }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 14, right: 14 }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              transform: [{ scale: pressed ? 0.9 : 1 }],
            })}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </Pressable>

          <View style={styles.titleGroup}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View
                style={[
                  styles.newBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(242, 100, 25, 0.18)'
                      : 'rgba(242, 100, 25, 0.12)',
                    borderColor: isDark
                      ? 'rgba(242, 100, 25, 0.38)'
                      : 'rgba(242, 100, 25, 0.28)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.newBadgeText,
                    { color: isDark ? '#FB923C' : '#C2410C' },
                  ]}
                >
                  {unreadCount} new
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <Pressable
                onPress={markAllAsRead}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Text
                  style={[
                    styles.markAllText,
                    { color: isDark ? '#2DD4BF' : '#004643' },
                  ]}
                >
                  Read all
                </Text>
              </Pressable>
            )}
            {notifications.length > 0 && (
              <Pressable
                onPress={handleClearAll}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>

      {/* List */}
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={50}
              color={theme.colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
              All clear
            </Text>
            <Text style={[styles.emptySub, { color: theme.colors.textMuted }]}>
              No notifications at this time.
            </Text>
          </View>
        ) : (
          <>
            {notifications.some((n) => n.unread) && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
                  NEW
                </Text>
                {notifications
                  .filter((n) => n.unread)
                  .map((item, i) => (
                    <NotificationCard
                      key={item.id}
                      item={item}
                      index={i}
                      onPress={handleOpen}
                    />
                  ))}
              </>
            )}
            {notifications.some((n) => !n.unread) && (
              <>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: theme.colors.textMuted, marginTop: 20 },
                  ]}
                >
                  EARLIER
                </Text>
                {notifications
                  .filter((n) => !n.unread)
                  .map((item, i) => (
                    <NotificationCard
                      key={item.id}
                      item={item}
                      index={i + 4}
                      onPress={handleOpen}
                    />
                  ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <NotificationDetailModal
        item={selectedNotif}
        visible={detailVisible}
        onClose={handleCloseDetail}
        onDelete={deleteNotification}
        onMarkUnread={markAsUnread}
      />
    </View>
  );
};

// ── StyleSheet ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Chirp-Heavy',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  newBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  listContent: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 13,
    gap: 11,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  unreadDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
  },
  typeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  timestamp: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 13.5,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  cardMessage: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
  },

  /* ── Detail Sheet ── */
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 22,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  detailIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  detailTypeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  detailTimestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 24,
    marginBottom: 14,
  },
  detailScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  detailBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  metaChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  detailActions: {
    gap: 9,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 9,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 11,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
});


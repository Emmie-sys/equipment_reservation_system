import React, { createContext, useContext, useState } from 'react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Loan Approved: Sony Alpha A7 IV Kit',
    message:
      'Your reservation #108 for Sony Alpha A7 IV and 24-70mm GM Lens has been approved by Prof. Davies. Please collect your equipment from Science & Tech Center (STC-101) today between 14:00 and 17:30.',
    type: 'approval',
    timestamp: '12 mins ago',
    unread: true,
    priority: 'high',
    actionLabel: 'View Reservation #108',
    actionRoute: '/reservations',
    referenceId: 108,
    location: 'STC-101 Central Depot',
    date: 'Oct 4, 2026',
  },
  {
    id: 'notif-2',
    title: 'Return Deadline Reminder: MacBook Pro M3',
    message:
      'Friendly institutional reminder: Asset #EQ-MBP-042 is due for return tomorrow at 11:00 AM at STC-101 Central Desk. Late returns may affect reservation privileges for upcoming academic terms.',
    type: 'reminder',
    timestamp: '2 hours ago',
    unread: true,
    priority: 'warning',
    actionLabel: 'Check Loan Status',
    actionRoute: '/reservations',
    referenceId: 102,
    location: 'STC-101 Central Depot',
    date: 'Oct 5, 2026',
  },
  {
    id: 'notif-3',
    title: 'Depot Scheduled Sensor Maintenance',
    message:
      'The Media Production Studio (MED-012) checkout desk will be undergoing scheduled sensor calibration this Friday. All media pickup requests will temporarily route to STC-101 Central Depot.',
    type: 'system',
    timestamp: 'Yesterday',
    unread: true,
    priority: 'info',
    actionLabel: 'Depot Schedule',
    location: 'MED-012 Studio',
    date: 'Oct 3, 2026',
  },
  {
    id: 'notif-4',
    title: 'Hand-off Inspection Completed',
    message:
      'Return check for Reservation #96 (Tektronix Digital Oscilloscope) was verified in good condition by Technician R. Vance. Your custody record has been closed.',
    type: 'return',
    timestamp: '3 days ago',
    unread: false,
    priority: 'normal',
    actionLabel: 'View Custody Receipt',
    referenceId: 96,
    location: 'STC-101 Central Depot',
    date: 'Oct 1, 2026',
  },
];

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  const markAsUnread = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: true } : n)));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const deleteNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAsUnread, markAllAsRead, deleteNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

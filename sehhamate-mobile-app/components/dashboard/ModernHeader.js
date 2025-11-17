import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../utils/colorUtils';

export default function ModernHeader({ userName = 'Amelia' }) {
  console.log('ModernHeader - Rendering header for user:', userName);
  
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Health Recommendation',
      message: 'Based on your recent blood pressure readings, we recommend reducing sodium intake today.',
      time: '2 hours ago',
      type: 'recommendation',
      read: false,
    },
    {
      id: 2,
      title: 'Medication Reminder',
      message: 'Time to take your evening medication. Don\'t forget to log it!',
      time: '1 hour ago',
      type: 'reminder',
      read: false,
    },
    {
      id: 3,
      title: 'Weekly Health Summary',
      message: 'Your weekly health summary is ready. Check out your progress!',
      time: '1 day ago',
      type: 'summary',
      read: true,
    },
    {
      id: 4,
      title: 'Exercise Goal Achieved',
      message: 'Congratulations! You\'ve reached your daily step goal.',
      time: '2 days ago',
      type: 'achievement',
      read: true,
    },
  ];

  const handleNotificationPress = () => {
    setIsNotificationModalVisible(true);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'recommendation':
        return 'bulb-outline';
      case 'reminder':
        return 'alarm-outline';
      case 'summary':
        return 'stats-chart-outline';
      case 'achievement':
        return 'trophy-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'recommendation':
        return '#4ECDC4';
      case 'reminder':
        return '#FF6B6B';
      case 'summary':
        return '#45B7D1';
      case 'achievement':
        return '#FFD93D';
      default:
        return Colors.accent;
    }
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity 
      key={notification.id} 
      style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
      onPress={() => {
        console.log('Notification tapped:', notification.title);
        setIsNotificationModalVisible(false);
      }}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.notificationIcon, { backgroundColor: getNotificationColor(notification.type) }]}>
          <Ionicons 
            name={getNotificationIcon(notification.type)} 
            size={16} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.container}>
        <LinearGradient
          colors={['#2D2D33', '#1C1C22']}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>Hi, {userName}!</Text>
              <Text style={styles.subtitle}>Welcome back, stay healthy.</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
              {notifications.some(n => !n.read) && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={isNotificationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#2D2D33', '#1C1C22']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsNotificationModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                {notifications.length > 0 ? (
                  notifications.map(renderNotificationItem)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="notifications-off-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyStateText}>No notifications</Text>
                    <Text style={styles.emptyStateSubtext}>You're all caught up!</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#606060',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  notificationButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginLeft: 8,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#474747',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

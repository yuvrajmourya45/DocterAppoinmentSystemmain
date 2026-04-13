import { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';

export const useNotifications = (doctorId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from server
  const fetchNotifications = useCallback(async () => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      const response = await API.get(`/api/notifications/doctor/${doctorId}`);
      
      if (response.data.success) {
        const newNotifications = response.data.notifications;
        const newUnreadCount = response.data.unreadCount;
        
        // Check for new notifications and show toast
        if (notifications.length > 0 && newNotifications.length > notifications.length) {
          const latestNotification = newNotifications[0];
          toast.success(`🔔 ${latestNotification.title}`, {
            position: "bottom-right",
            autoClose: 5000,
          });
        }
        
        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, notifications.length]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await API.patch(`/api/notifications/${notificationId}/read`, {
        doctorId
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to update notification');
    }
  }, [doctorId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await API.patch(`/api/notifications/doctor/${doctorId}/read-all`);
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  }, [doctorId]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.success(`🔔 ${notification.title}`, {
      position: "bottom-right",
      autoClose: 5000,
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Set up polling for new notifications
  useEffect(() => {
    fetchNotifications();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearAllNotifications,
    getNotificationsByType,
    getUnreadNotifications
  };
};

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import io from 'socket.io-client';

export const useSocket = (userId) => {
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Connect to socket.io server
    const socket = io('http://localhost:8000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket.io server');
      // Emit user_online event with userId
      socket.emit('user_online', userId.toString());
    });

    // Listen for new notifications
    socket.on('new_notification', (data) => {
      console.log('New notification received:', data);
      
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Update unread count
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });

      // Show toast notification based on type
      const notification = data.notification;
      const notificationMessages = {
        'like': 'Someone liked your post',
        'follow': 'Someone followed you',
        'comment': 'Someone commented on your post',
        'admin_warning': `⚠️ You received a warning: ${notification.message}`,
        'admin_suspend': `🚫 Your account has been suspended: ${notification.message}`,
        'admin_content_removed': `🗑️ Your content was removed: ${notification.message}`,
        'post_auto_moderated': `📋 Your post was auto-moderated: ${notification.reason}`,
        'reported': `📢 You were reported: ${notification.reason}`,
        'auto_moderated_nsfw': `⚠️ Your post was auto-flagged as NSFW: ${notification.reason}`
      };

      const message = notificationMessages[notification.type] || 'New notification';
      
      // Show appropriate toast based on type
      if (notification.type === 'admin_suspend') {
        toast.error(message);
      } else if (notification.type === 'admin_warning' || notification.type === 'admin_content_removed') {
        toast.warning(message);
      } else if (notification.type === 'auto_moderated_nsfw' || notification.type === 'post_auto_moderated') {
        toast.info(message);
      } else {
        toast.success(message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, queryClient]);

  return socketRef.current;
};

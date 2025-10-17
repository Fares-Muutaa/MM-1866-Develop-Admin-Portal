// components/NotificationCenter.tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useEffect, useState } from 'react';

export function NotificationCenter({
  userId,
}: Readonly<{ userId: number }>) {
    const { notifications, unreadCount, markAsRead, isConnected } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 relative"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
        
        {!isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
     {notifications.length === 0 ? (
  <div className="p-4 text-center text-gray-500">No notifications yet</div>
) : (
  notifications.map(notification => (
    <button
      //NOSONAR
  tabIndex={0}
      key={notification.id}
      onClick={() => markAsRead(notification.id)}
      className={`w-full text-left p-3 hover:bg-gray-50 cursor-pointer ${
        !notification.read_at ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1 flex-shrink-0">
          {/* Optional: Icon or marker */}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-medium">{notification.title}</h4>
            <span className="text-xs text-gray-400">
              {new Date(notification.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          {notification.redirect_url && (
            <a
              href={notification.redirect_url}
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
              onClick={e => e.stopPropagation()}
            >
              View details
            </a>
          )}
        </div>
      </div>
    </button>
  ))
)}

          </div>
        </div>
      )}
    </div>
  );
}

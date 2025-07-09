"use client";

import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      clearAll 
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[notification.type] || Info;

  const typeStyles = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-destructive/10 border-destructive/20 text-destructive',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-blue/10 border-blue/20 text-blue',
  };

  return (
    <div
      className={cn(
        "relative flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        isExiting ? "animate-slide-out-right opacity-0" : "animate-slide-in-right",
        typeStyles[notification.type]
      )}
    >
      <div className="flex-shrink-0 mr-3">
        <Icon className="h-5 w-5 animate-bounce-in" />
      </div>
      
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="text-sm font-medium mb-1 animate-fade-in">
            {notification.title}
          </h4>
        )}
        <p className="text-sm opacity-90 animate-fade-in animate-delay-100">
          {notification.message}
        </p>
        
        {notification.action && (
          <div className="mt-3 animate-slide-up animate-delay-200">
            <button
              onClick={notification.action.onClick}
              className="text-sm font-medium hover:underline focus:outline-none focus:underline"
            >
              {notification.action.label}
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-black/10 transition-colors duration-200 animate-fade-in animate-delay-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Hook for programmatic notifications
export function useNotify() {
  const { addNotification } = useNotifications();
  
  return {
    success: (message, options) => addNotification({ type: 'success', message, ...options }),
    error: (message, options) => addNotification({ type: 'error', message, duration: 7000, ...options }),
    warning: (message, options) => addNotification({ type: 'warning', message, ...options }),
    info: (message, options) => addNotification({ type: 'info', message, ...options }),
  };
}

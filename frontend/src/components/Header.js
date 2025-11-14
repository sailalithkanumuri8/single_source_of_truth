import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../css/Header.css';
import { formatRelativeDate } from '../utils/helpers';

const Header = ({ onSearch, searchTerm, darkMode, onToggleDarkMode, escalations = [] }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(new Set());
  const notificationRef = useRef(null);

  const notifications = useMemo(() => {
    if (!escalations || escalations.length === 0) return [];

    const now = new Date();
    const notificationsList = [];

    escalations.forEach(escalation => {
      const createdAt = new Date(escalation.createdAt);
      const updatedAt = new Date(escalation.updatedAt);
      const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
      const hoursSinceUpdated = (now - updatedAt) / (1000 * 60 * 60);

      if (hoursSinceCreated < 24) {
        if (escalation.status === 'critical') {
          notificationsList.push({
            id: `new-${escalation.id}`,
            escalationId: escalation.id,
            message: `New critical escalation ${escalation.id} - ${escalation.title}`,
            time: formatRelativeDate(escalation.createdAt),
            read: readNotificationIds.has(`new-${escalation.id}`),
            type: 'critical',
            timestamp: createdAt
          });
        } else if (escalation.status === 'high') {
          notificationsList.push({
            id: `new-${escalation.id}`,
            escalationId: escalation.id,
            message: `New high priority escalation ${escalation.id} - ${escalation.title}`,
            time: formatRelativeDate(escalation.createdAt),
            read: readNotificationIds.has(`new-${escalation.id}`),
            type: 'high',
            timestamp: createdAt
          });
        } else {
          notificationsList.push({
            id: `new-${escalation.id}`,
            escalationId: escalation.id,
            message: `New escalation ${escalation.id} - ${escalation.title}`,
            time: formatRelativeDate(escalation.createdAt),
            read: readNotificationIds.has(`new-${escalation.id}`),
            type: 'info',
            timestamp: createdAt
          });
        }
      }

      if (escalation.context?.slaStatus === 'At risk' && hoursSinceUpdated < 24) {
        notificationsList.push({
          id: `sla-${escalation.id}`,
          escalationId: escalation.id,
          message: `SLA deadline approaching for ${escalation.id} - ${escalation.context.timeToSLA} remaining`,
          time: formatRelativeDate(escalation.updatedAt),
          read: readNotificationIds.has(`sla-${escalation.id}`),
          type: 'warning',
          timestamp: updatedAt
        });
      }

      if (escalation.status === 'resolved' && hoursSinceUpdated < 24) {
        notificationsList.push({
          id: `resolved-${escalation.id}`,
          escalationId: escalation.id,
          message: `Escalation ${escalation.id} has been resolved`,
          time: formatRelativeDate(escalation.updatedAt),
          read: readNotificationIds.has(`resolved-${escalation.id}`),
          type: 'success',
          timestamp: updatedAt
        });
      }
    });

    return notificationsList.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [escalations, readNotificationIds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id) => {
    setReadNotificationIds(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(prev => new Set([...prev, ...allIds]));
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo-container">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>Compass AI</h1>
              <p className="subtitle">Product @ GT Fellowship</p>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search escalations by title, customer, ID, or tags..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => onSearch('')}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <div className="notification-wrapper" ref={notificationRef}>
              <button 
                className="icon-button" 
                title="Notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="mark-all-read" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                          </div>
                          {!notification.read && <div className="notification-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="icon-button" 
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={onToggleDarkMode}
            >
              {darkMode ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <div className="user-profile">
              <div className="user-avatar">ES</div>
              <div className="user-info">
                <span className="user-name">Product @ GT</span>
                <span className="user-role">Support Engineer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


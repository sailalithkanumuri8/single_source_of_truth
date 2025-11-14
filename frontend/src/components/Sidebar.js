import React from 'react';
import '../css/Sidebar.css';

const Sidebar = ({ 
  selectedView, 
  onViewChange, 
  filters, 
  onFilterChange,
  escalationStats 
}) => {
  const menuItems = [
    { 
      id: 'escalations', 
      label: 'All Escalations', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2"/>
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 12H15M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      badge: escalationStats?.total || 0
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 14L12 9L16 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const statusFilters = [
    { id: 'all', label: 'All Statuses', count: escalationStats?.total || 0 },
    { id: 'critical', label: 'Critical', count: escalationStats?.bySeverity?.critical || 0, color: '#dc2626' },
    { id: 'high', label: 'High', count: escalationStats?.bySeverity?.high || 0, color: '#ea580c' },
    { id: 'medium', label: 'Medium', count: escalationStats?.bySeverity?.medium || 0, color: '#f59e0b' },
    { id: 'low', label: 'Low', count: escalationStats?.bySeverity?.low || 0, color: '#10b981' }
  ];

  const priorityFilters = [
    { id: 'all', label: 'All Priorities', count: escalationStats?.total || 0 },
    { id: 'P0', label: 'P0 - Critical', count: escalationStats?.byPriority?.P0 || 0, color: '#dc2626' },
    { id: 'P1', label: 'P1 - High', count: escalationStats?.byPriority?.P1 || 0, color: '#ea580c' },
    { id: 'P2', label: 'P2 - Medium', count: escalationStats?.byPriority?.P2 || 0, color: '#f59e0b' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="nav-section">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${selectedView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="filter-section">
          <h3 className="filter-title">Status</h3>
          <div className="filter-group">
            {statusFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-item ${filters.status === filter.id ? 'active' : ''}`}
                onClick={() => onFilterChange({ ...filters, status: filter.id })}
              >
                {filter.color && (
                  <span 
                    className="filter-indicator" 
                    style={{ backgroundColor: filter.color }}
                  />
                )}
                <span className="filter-label">{filter.label}</span>
                <span className="filter-count">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3 className="filter-title">Priority</h3>
          <div className="filter-group">
            {priorityFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-item ${filters.priority === filter.id ? 'active' : ''}`}
                onClick={() => onFilterChange({ ...filters, priority: filter.id })}
              >
                {filter.color && (
                  <span 
                    className="filter-indicator" 
                    style={{ backgroundColor: filter.color }}
                  />
                )}
                <span className="filter-label">{filter.label}</span>
                <span className="filter-count">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3 className="filter-title">Category</h3>
          <div className="filter-group">
            <button
              className={`filter-item ${filters.category === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange({ ...filters, category: 'all' })}
            >
              <span className="filter-label">All Categories</span>
            </button>
            {Object.keys(escalationStats?.byCategory || {}).sort().map(category => (
              <button
                key={category}
                className={`filter-item ${filters.category === category ? 'active' : ''}`}
                onClick={() => onFilterChange({ ...filters, category })}
              >
                <span className="filter-label">{category}</span>
                <span className="filter-count">{escalationStats?.byCategory[category] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;


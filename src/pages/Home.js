import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import driverService from '../services/driverService';
import materialService from '../services/materialService';
import serviceService from '../services/serviceService';
import serviceRecordService from '../services/serviceRecordService';
import userService from '../services/userService';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalMaterials: 0,
    activeServices: 0,
    serviceRecords: 0,
    driversThisMonth: 0,
    lowStockMaterials: 0,
    servicesAdded: 0,
    recordsThisWeek: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewedNotifications, setViewedNotifications] = useState(new Set());
  const notificationsRef = useRef(null);
  const settingsRef = useRef(null);
  const [rawData, setRawData] = useState({
    drivers: [],
    materials: [],
    services: [],
    records: [],
    users: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [driversRes, materialsRes, servicesRes, recordsRes, usersRes] = await Promise.all([
        driverService.getAllDrivers().catch(() => ({ data: [] })),
        materialService.getAllMaterials().catch(() => ({ data: [] })),
        serviceService.getAllServices().catch(() => ({ data: [] })),
        serviceRecordService.getAllServiceRecords().catch(() => ({ data: [] })),
        userService.getAllUsers().catch(() => ({ data: [] })),
      ]);

      const drivers = driversRes.data || [];
      const materials = materialsRes.data || [];
      const services = servicesRes.data || [];
      const records = recordsRes.data || [];
      const users = usersRes.data || [];

      // Store raw data for processing
      setRawData({ drivers, materials, services, records, users });
      
      // Cache drivers count for Dashboard component
      localStorage.setItem('dashboard_drivers_count', drivers.length.toString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize expensive calculations
  const processedStats = useMemo(() => {
    const { drivers, materials, services, records } = rawData;
    
    if (drivers.length === 0 && materials.length === 0 && services.length === 0 && records.length === 0) {
      return {
        totalDrivers: 0,
        totalMaterials: 0,
        activeServices: 0,
        serviceRecords: 0,
        driversThisMonth: 0,
        lowStockMaterials: 0,
        servicesAdded: 0,
        recordsThisWeek: 0,
      };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now);
    thisWeek.setDate(thisWeek.getDate() - 7);

    // Use for loops for better performance with large datasets
    let driversThisMonth = 0;
    for (let i = 0; i < drivers.length; i++) {
      const createdAt = new Date(drivers[i].createdAt || drivers[i].created_at);
      if (createdAt >= thisMonth) driversThisMonth++;
    }

    let lowStockMaterials = 0;
    for (let i = 0; i < materials.length; i++) {
      const quantity = parseInt(materials[i].quantity || 0);
      if (quantity < 20) lowStockMaterials++;
    }

    let servicesAdded = 0;
    for (let i = 0; i < services.length; i++) {
      const createdAt = new Date(services[i].createdAt || services[i].created_at);
      if (createdAt >= thisMonth) servicesAdded++;
    }

    let recordsThisWeek = 0;
    for (let i = 0; i < records.length; i++) {
      const checkIn = new Date(records[i].check_in_time);
      if (checkIn >= thisWeek) recordsThisWeek++;
    }

    return {
      totalDrivers: drivers.length,
      totalMaterials: materials.length,
      activeServices: services.length,
      serviceRecords: records.length,
      driversThisMonth,
      lowStockMaterials,
      servicesAdded,
      recordsThisWeek,
    };
  }, [rawData]);

  // Update stats when processed stats change
  useEffect(() => {
    setStats(processedStats);
  }, [processedStats]);

  // Memoize recent records processing
  const processedRecentRecords = useMemo(() => {
    const { drivers, materials, services, records } = rawData;
    
    if (records.length === 0) return [];

    // Create lookup maps for O(1) access
    const driverMap = new Map();
    drivers.forEach(d => driverMap.set(d._id, d));
    
    const serviceMap = new Map();
    services.forEach(s => serviceMap.set(s._id, s));
    
    const materialMap = new Map();
    materials.forEach(m => {
      if (m.service_record_id && !materialMap.has(m.service_record_id)) {
        materialMap.set(m.service_record_id, m);
      }
    });

    // Sort and get top 4
    const sorted = [...records].sort((a, b) => {
      const dateA = new Date(a.check_in_time);
      const dateB = new Date(b.check_in_time);
      return dateB - dateA;
    }).slice(0, 4);

    return sorted.map((record) => {
      const driver = driverMap.get(record.driver_id);
      const service = serviceMap.get(record.service_id);
      const material = materialMap.get(record._id);
      
      return {
        ...record,
        driver_name: driver?.full_name || 'N/A',
        service_name: service?.service_name || 'N/A',
        material_name: material ? `${material.material_name} ${material.quantity || ''}x${material.quantity_used || 1}` : '—',
      };
    });
  }, [rawData]);

  useEffect(() => {
    setRecentRecords(processedRecentRecords);
  }, [processedRecentRecords]);

  // Memoize chart data
  const processedChartData = useMemo(() => {
    const { records } = rawData;
    if (records.length === 0) return [];

    const chartDataArray = [];
    const now = new Date();
    
    // Pre-calculate date ranges
    const dateRanges = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      dateRanges.push({ date, nextDate, day: date.toLocaleDateString('en-US', { weekday: 'short' }) });
    }

    // Count records per day using date ranges
    dateRanges.forEach(({ date, nextDate, day }) => {
      let count = 0;
      for (let i = 0; i < records.length; i++) {
        const checkIn = new Date(records[i].check_in_time);
        if (checkIn >= date && checkIn < nextDate) {
          count++;
        }
      }
      chartDataArray.push({ day, count });
    });

    return chartDataArray;
  }, [rawData]);

  useEffect(() => {
    setChartData(processedChartData);
  }, [processedChartData]);

  // Memoize utility functions (needed for activities)
  const formatRecordId = useCallback((id) => {
    if (!id) return 'N/A';
    const num = id.slice(-4) || '0000';
    return `#SR-${num.padStart(4, '0')}`;
  }, []);

  // Generate recent activities from real system data
  const processedRecentActivities = useMemo(() => {
    const { drivers, materials, services, records, users } = rawData;
    const activities = [];
    const now = new Date();

    // Helper function to calculate time ago
    const getTimeAgo = (date) => {
      if (!date) return 'Unknown time';
      const diffMs = now - new Date(date);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return new Date(date).toLocaleDateString();
    };

    // Helper to format record ID
    const formatId = (id) => {
      if (!id) return 'N/A';
      const num = id.slice(-4) || '0000';
      return `#SR-${num.padStart(4, '0')}`;
    };

    // Get recent drivers (last 2, sorted by creation date)
    [...drivers]
      .filter(d => d.createdAt || d.created_at)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 2)
      .forEach(driver => {
        activities.push({
          text: `New driver ${driver.full_name} registered`,
          time: getTimeAgo(driver.createdAt || driver.created_at),
          color: 'green',
          timestamp: new Date(driver.createdAt || driver.created_at),
        });
      });

    // Get recent service records (completed, sorted by check_in_time)
    [...records]
      .filter(r => r.status === 'COMPLETED' && r.check_in_time)
      .sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time))
      .slice(0, 2)
      .forEach(record => {
        const recordId = formatId(record._id);
        activities.push({
          text: `Service record ${recordId} completed`,
          time: getTimeAgo(record.check_in_time),
          color: 'blue',
          timestamp: new Date(record.check_in_time),
        });
      });

    // Get low stock materials
    materials
      .filter(m => {
        const quantity = parseInt(m.quantity || 0);
        return quantity > 0 && quantity < 20;
      })
      .slice(0, 2)
      .forEach(material => {
        activities.push({
          text: `Material ${material.material_name || material.item_name || 'Unknown'} stock low (${material.quantity} remaining)`,
          time: 'Recently',
          color: 'orange',
          timestamp: new Date(now.getTime() - 3600000), // 1 hour ago as fallback
        });
      });

    // Get recent users (last 1, sorted by creation date)
    [...users]
      .filter(u => u.createdAt || u.created_at)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 1)
      .forEach(user => {
        activities.push({
          text: `User ${user.full_name} ${user.role ? `(${user.role})` : ''} created`,
          time: getTimeAgo(user.createdAt || user.created_at),
          color: 'purple',
          timestamp: new Date(user.createdAt || user.created_at),
        });
      });

    // Get recent services added
    [...services]
      .filter(s => s.createdAt || s.created_at)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 1)
      .forEach(service => {
        activities.push({
          text: `Service ${service.service_name} added`,
          time: getTimeAgo(service.createdAt || service.created_at),
          color: 'blue',
          timestamp: new Date(service.createdAt || service.created_at),
        });
      });

    // Sort all activities by timestamp (most recent first) and take top 4
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4)
      .map(({ timestamp, ...rest }) => rest); // Remove timestamp from final output
  }, [rawData]);

  useEffect(() => {
    setRecentActivity(processedRecentActivities);
  }, [processedRecentActivities]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    if (showNotifications || showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showSettings]);

  // Generate notifications based on data
  const allNotifications = useMemo(() => {
    const notifs = [];
    
    if (stats.lowStockMaterials > 0) {
      notifs.push({
        id: 1,
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${stats.lowStockMaterials} material(s) are running low`,
        time: 'Just now',
      });
    }
    
    if (stats.driversThisMonth > 0) {
      notifs.push({
        id: 2,
        type: 'info',
        title: 'New Drivers',
        message: `${stats.driversThisMonth} new driver(s) registered this month`,
        time: 'Today',
      });
    }
    
    if (stats.recordsThisWeek > 0) {
      notifs.push({
        id: 3,
        type: 'success',
        title: 'Weekly Activity',
        message: `${stats.recordsThisWeek} service record(s) completed this week`,
        time: 'This week',
      });
    }

    return notifs;
  }, [stats]);

  // Filter out viewed notifications
  const unreadNotifications = useMemo(() => {
    return allNotifications.filter(notif => !viewedNotifications.has(notif.id));
  }, [allNotifications, viewedNotifications]);

  // Mark notification as viewed
  const markNotificationAsViewed = useCallback((notificationId) => {
    setViewedNotifications(prev => new Set([...prev, notificationId]));
  }, []);

  const maxChartValue = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map((d) => d.count), 1);
  }, [chartData]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const statusMap = useMemo(() => ({
    COMPLETED: { text: '• Completed', class: 'status-completed' },
    PENDING: { text: '• Pending', class: 'status-pending' },
    IN_PROGRESS: { text: '• In Progress', class: 'status-in-progress' },
    CANCELLED: { text: '• Cancelled', class: 'status-cancelled' },
  }), []);

  const getStatusBadge = useCallback((status) => {
    return statusMap[status] || { text: status, class: 'status-default' };
  }, [statusMap]);

  const quickAccessModules = useMemo(() => [
    { title: 'Drivers', icon: '🚗', count: `${stats.totalDrivers} registered`, link: '/dashboard/drivers' },
    { title: 'Materials', icon: '📦', count: `${stats.totalMaterials} items`, link: '/dashboard/materials' },
    { title: 'Services', icon: '🔧', count: `${stats.activeServices} active`, link: '/dashboard/services' },
    { title: 'Service Records', icon: '📋', count: `${stats.serviceRecords} total`, link: '/dashboard/service-records' },
    { title: 'Users', icon: '👥', count: `${rawData.users.length} accounts`, link: '/dashboard/users' },
    { title: 'Reports', icon: '📈', count: 'Generate insights', link: '/dashboard/reports' },
  ], [stats, rawData.users.length]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-header-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search anything..." />
          </div>
          <div className="header-icon-wrapper" ref={notificationsRef}>
            <button 
              className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unreadNotifications.length > 0 && (
                <span className="notification-badge">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <button 
                    className="notifications-close"
                    onClick={() => setShowNotifications(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="notifications-list">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`notification-item notification-${notif.type}`}
                        onClick={() => markNotificationAsViewed(notif.id)}
                      >
                        <div className="notification-icon">
                          {notif.type === 'warning' && '⚠️'}
                          {notif.type === 'info' && 'ℹ️'}
                          {notif.type === 'success' && '✅'}
                        </div>
                        <div className="notification-content">
                          <h4 className="notification-title">{notif.title}</h4>
                          <p className="notification-message">{notif.message}</p>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="notification-empty">
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <div className="notifications-footer">
                    <button 
                      className="notifications-view-all"
                      onClick={() => {
                        unreadNotifications.forEach(notif => {
                          markNotificationAsViewed(notif.id);
                        });
                      }}
                    >
                      Mark All as Read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="header-icon-wrapper" ref={settingsRef}>
            <button 
              className={`header-icon-btn ${showSettings ? 'active' : ''}`}
              title="Settings"
              onClick={() => setShowSettings(!showSettings)}
            >
              ⚙️
            </button>
            {showSettings && (
              <div className="settings-dropdown">
                <div className="settings-header">
                  <h3>Settings</h3>
                  <button 
                    className="settings-close"
                    onClick={() => setShowSettings(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="settings-list">
                  <button className="settings-item">
                    <span className="settings-icon">👤</span>
                    <span className="settings-text">Profile Settings</span>
                    <span className="settings-arrow">›</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-icon">🔔</span>
                    <span className="settings-text">Notification Preferences</span>
                    <span className="settings-arrow">›</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-icon">🎨</span>
                    <span className="settings-text">Theme</span>
                    <span className="settings-arrow">›</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-icon">🔒</span>
                    <span className="settings-text">Privacy & Security</span>
                    <span className="settings-arrow">›</span>
                  </button>
                  <div className="settings-divider"></div>
                  <button className="settings-item">
                    <span className="settings-icon">ℹ️</span>
                    <span className="settings-text">About</span>
                    <span className="settings-arrow">›</span>
                  </button>
                  <button className="settings-item">
                    <span className="settings-icon">❓</span>
                    <span className="settings-text">Help & Support</span>
                    <span className="settings-arrow">›</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🚗</span>
            <div className="metric-badge">24</div>
          </div>
          <div className="metric-content">
            <h3 className="metric-title">TOTAL DRIVERS</h3>
            <div className="metric-value">{stats.totalDrivers}</div>
            <div className="metric-trend trend-up">
              ▲ {stats.driversThisMonth} new this month
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📦</span>
          </div>
          <div className="metric-content">
            <h3 className="metric-title">MATERIALS</h3>
            <div className="metric-value">{stats.totalMaterials}</div>
            <div className="metric-trend trend-down">
              ▼ {stats.lowStockMaterials} low stock
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🔧</span>
          </div>
          <div className="metric-content">
            <h3 className="metric-title">ACTIVE SERVICES</h3>
            <div className="metric-value">{stats.activeServices}</div>
            <div className="metric-trend trend-up">
              ▲ {stats.servicesAdded} added recently
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📋</span>
          </div>
          <div className="metric-content">
            <h3 className="metric-title">SERVICE RECORDS</h3>
            <div className="metric-value">{stats.serviceRecords}</div>
            <div className="metric-trend trend-up">
              ▲ {stats.recordsThisWeek} this week
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity Section */}
      <div className="dashboard-middle-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Service Records Overview</h3>
            <div className="chart-period">
              Last 7 days <span>▼</span>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {chartData.map((data, index) => {
                const height = maxChartValue > 0 ? (data.count / maxChartValue) * 100 : 0;
                return (
                  <div key={index} className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: `${height}%` }}>
                      <span className="chart-bar-value">{data.count}</span>
                    </div>
                    <span className="chart-bar-label">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="activity-card">
          <div className="activity-header">
            <h3 className="activity-title">Recent Activity</h3>
            <Link to="/dashboard/reports" className="activity-view-all">
              View all
            </Link>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className={`activity-dot activity-dot-${activity.color}`}>•</span>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Records and Quick Access */}
      <div className="dashboard-bottom-section">
        <div className="records-table-card">
          <div className="records-header">
            <h3 className="records-title">Recent Service Records</h3>
            <Link to="/dashboard/service-records" className="records-view-all">
              View all records →
            </Link>
          </div>
          <div className="records-table-wrapper">
            <table className="records-table">
              <thead>
                <tr>
                  <th>RECORD ID</th>
                  <th>DRIVER</th>
                  <th>SERVICE</th>
                  <th>MATERIAL USED</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.length > 0 ? (
                  recentRecords.map((record, index) => {
                    const statusBadge = getStatusBadge(record.status);
                    return (
                      <tr key={record._id || index}>
                        <td>{formatRecordId(record._id)}</td>
                        <td>{record.driver_name || 'N/A'}</td>
                        <td>{record.service_name || 'N/A'}</td>
                        <td>{record.material_name || '—'}</td>
                        <td>{formatDate(record.check_in_time)}</td>
                        <td>
                          <span className={`status-badge ${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-records">
                      No recent service records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="quick-access-card">
          <h3 className="quick-access-title">Quick Access Modules</h3>
          <div className="quick-access-grid">
            {quickAccessModules.map((module, index) => (
              <Link key={index} to={module.link} className="quick-access-item">
                <span className="quick-access-icon">{module.icon}</span>
                <div className="quick-access-content">
                  <h4 className="quick-access-name">{module.title}</h4>
                  <p className="quick-access-count">{module.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

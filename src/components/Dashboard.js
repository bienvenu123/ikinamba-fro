import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [driversCount, setDriversCount] = useState(0);
  const userMenuRef = useRef(null);

  // Get drivers count from localStorage cache (set by Home component)
  useEffect(() => {
    const cachedCount = localStorage.getItem('dashboard_drivers_count');
    if (cachedCount) {
      setDriversCount(parseInt(cachedCount, 10));
    }
    
    // Listen for updates from Home component
    const handleStorageChange = () => {
      const updatedCount = localStorage.getItem('dashboard_drivers_count');
      if (updatedCount) {
        setDriversCount(parseInt(updatedCount, 10));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (in case of same-tab updates)
    const interval = setInterval(() => {
      const updatedCount = localStorage.getItem('dashboard_drivers_count');
      if (updatedCount && parseInt(updatedCount, 10) !== driversCount) {
        setDriversCount(parseInt(updatedCount, 10));
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [driversCount]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const menuSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          icon: '📊',
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          path: '/dashboard/drivers',
          name: 'Drivers',
          icon: '🚗',
          badge: driversCount,
        },
        {
          path: '/dashboard/materials',
          name: 'Materials',
          icon: '📦',
        },
        {
          path: '/dashboard/services',
          name: 'Services',
          icon: '🔧',
        },
        {
          path: '/dashboard/service-records',
          name: 'Service Records',
          icon: '📋',
        },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        {
          path: '/dashboard/users',
          name: 'Users',
          icon: '👥',
        },
        {
          path: '/dashboard/reports',
          name: 'Reports',
          icon: '📈',
        },
      ],
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && (
        <button className="mobile-sidebar-toggle" onClick={toggleSidebar} aria-label="Open menu">
          ☰
        </button>
      )}
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <h2 className="logo">Ikinamba</h2>
            {sidebarOpen && <p className="logo-subtitle">MIS PLATFORM</p>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Close menu">
            {sidebarOpen ? '✕' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              {sidebarOpen && <h3 className="nav-section-title">{section.title}</h3>}
              <ul className="nav-menu">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link ${
                        location.pathname === item.path ? 'active' : ''
                      }`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="nav-text">{item.name}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="nav-badge">{item.badge}</span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-profile-avatar">
                {user?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </div>
              <div className="user-profile-info">
                <div className="user-profile-name">{user?.full_name || 'User'}</div>
                <div className="user-profile-role">{user?.role || 'Administrator'}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar with User Menu */}
        <div className="top-bar">
          <div className="top-bar-content">
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu-button"
                onClick={() => setShowUserMenu((prev) => !prev)}
              >
                <div className="user-avatar">
                  {user?.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.full_name || 'User'}</span>
                  <span className="user-role">{user?.role || 'Administrator'}</span>
                </div>
                <span className={`user-menu-arrow ${showUserMenu ? 'open' : ''}`}>▼</span>
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <span className="user-menu-name">{user?.full_name || 'User'}</span>
                    <span className="user-menu-username">
                      {user?.username || user?.email || 'Logged in'}
                    </span>
                  </div>
                  <div className="user-menu-divider" />
                  <button
                    type="button"
                    className="user-menu-item"
                    onClick={handleLogout}
                  >
                    <span className="menu-item-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

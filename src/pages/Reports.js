import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import './Reports.css';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    datePreset: 'all', // all, today, week, month, lastMonth, last7Days, last30Days
  });

  const reportTypes = [
    { id: 'summary', name: 'Summary Report', icon: '📊' },
    { id: 'drivers', name: 'Drivers Report', icon: '🚗' },
    { id: 'services', name: 'Services Report', icon: '🔧' },
    { id: 'service-records', name: 'Service Records Report', icon: '📋' },
    { id: 'materials', name: 'Materials Report', icon: '📦' },
    { id: 'users', name: 'Users Report', icon: '👥' },
    { id: 'financial', name: 'Financial Report', icon: '💰' },
  ];

  useEffect(() => {
    fetchReport();
  }, [activeReport, filters]);

  // Reset status filter when switching away from service-records
  useEffect(() => {
    if (activeReport !== 'service-records' && filters.status) {
      setFilters((prev) => ({
        ...prev,
        status: '',
      }));
    }
  }, [activeReport]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      switch (activeReport) {
        case 'summary':
          data = await reportService.getSummaryReport();
          // Ensure all properties are arrays
          if (data) {
            data.drivers = Array.isArray(data.drivers) ? data.drivers : [];
            data.services = Array.isArray(data.services) ? data.services : [];
            data.records = Array.isArray(data.records) ? data.records : [];
            data.materials = Array.isArray(data.materials) ? data.materials : [];
            data.users = Array.isArray(data.users) ? data.users : [];
            
            // Apply date filtering to summary data
            if (filters.startDate || filters.endDate) {
              if (data.records && data.records.length > 0) {
                data.records = filterDataByDate(data.records, 'check_in_time');
              }
            }
          }
          break;
        case 'drivers':
          data = await reportService.getDriversReport();
          // Apply date filtering to drivers
          if (data && data.data && (filters.startDate || filters.endDate)) {
            data.data = filterDataByDate(data.data, 'created_at');
          }
          break;
        case 'services':
          data = await reportService.getServicesReport();
          break;
        case 'service-records':
          data = await reportService.getServiceRecordsReport(
            filters.status || null,
            filters.startDate || null,
            filters.endDate || null
          );
          // Apply additional client-side filtering if needed
          if (data && data.data && (filters.startDate || filters.endDate)) {
            data.data = filterDataByDate(data.data, 'check_in_time');
          }
          break;
        case 'materials':
          data = await reportService.getMaterialsReport();
          // Materials are linked to service records, filter by service record check_in_time
          if (data && data.data && (filters.startDate || filters.endDate)) {
            // Filter materials based on their service record's check_in_time
            data.data = data.data.filter((material) => {
              const serviceRecord = material.service_record_id;
              if (!serviceRecord || typeof serviceRecord !== 'object') return true;
              
              const checkInTime = serviceRecord.check_in_time;
              if (!checkInTime) return true;

              const checkInDate = new Date(checkInTime);
              checkInDate.setHours(0, 0, 0, 0);

              if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                startDate.setHours(0, 0, 0, 0);
                if (checkInDate < startDate) return false;
              }

              if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                if (checkInDate > endDate) return false;
              }

              return true;
            });
          }
          break;
        case 'users':
          data = await reportService.getUsersReport();
          // Apply date filtering to users
          if (data && data.data && (filters.startDate || filters.endDate)) {
            data.data = filterDataByDate(data.data, 'createdAt');
          }
          break;
        case 'financial':
          data = await reportService.getServiceRecordsReport(
            null,
            filters.startDate || null,
            filters.endDate || null
          );
          // Apply additional client-side filtering if needed
          if (data && data.data && (filters.startDate || filters.endDate)) {
            data.data = filterDataByDate(data.data, 'check_in_time');
          }
          break;
        default:
          data = await reportService.getSummaryReport();
      }
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Date preset handlers
  const getDatePreset = (preset) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'today':
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case 'week':
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: lastDay.toISOString().split('T')[0],
        };
      case 'last7Days':
        startDate.setDate(today.getDate() - 6);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case 'last30Days':
        startDate.setDate(today.getDate() - 29);
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      default:
        return {
          startDate: '',
          endDate: '',
        };
    }
  };

  const handleDatePreset = (preset) => {
    const dates = getDatePreset(preset);
    setFilters((prev) => ({
      ...prev,
      datePreset: preset,
      startDate: dates.startDate,
      endDate: dates.endDate,
    }));
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      datePreset: 'custom',
      [name]: value,
    }));
  };

  // Filter data by date range
  const filterDataByDate = (data, dateField = 'check_in_time') => {
    if (!filters.startDate && !filters.endDate) return data;
    if (!data || !Array.isArray(data)) return data;

    return data.filter((item) => {
      const itemDate = item[dateField];
      if (!itemDate) return false;

      const itemDateObj = new Date(itemDate);
      itemDateObj.setHours(0, 0, 0, 0);

      if (filters.startDate) {
        const startDateObj = new Date(filters.startDate);
        startDateObj.setHours(0, 0, 0, 0);
        if (itemDateObj < startDateObj) return false;
      }

      if (filters.endDate) {
        const endDateObj = new Date(filters.endDate);
        endDateObj.setHours(23, 59, 59, 999);
        if (itemDateObj > endDateObj) return false;
      }

      return true;
    });
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === 'object' ? JSON.stringify(value) : `"${value}"`;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Render Summary Report
  const renderSummaryReport = () => {
    if (!reportData) return null;
    
    // Safely extract data with defaults
    const drivers = reportData.drivers || reportData.data?.drivers || [];
    const services = reportData.services || reportData.data?.services || [];
    const records = reportData.records || reportData.data?.records || [];
    const materials = reportData.materials || reportData.data?.materials || [];
    const users = reportData.users || reportData.data?.users || [];

    // Ensure all are arrays
    const safeDrivers = Array.isArray(drivers) ? drivers : [];
    const safeServices = Array.isArray(services) ? services : [];
    const safeRecords = Array.isArray(records) ? records : [];
    const safeMaterials = Array.isArray(materials) ? materials : [];
    const safeUsers = Array.isArray(users) ? users : [];

    const stats = {
      totalDrivers: safeDrivers.length,
      totalServices: safeServices.length,
      totalRecords: safeRecords.length,
      totalMaterials: safeMaterials.length,
      totalUsers: safeUsers.length,
      pendingRecords: safeRecords.filter((r) => r.status === 'PENDING').length,
      inProgressRecords: safeRecords.filter((r) => r.status === 'IN_PROGRESS').length,
      completedRecords: safeRecords.filter((r) => r.status === 'COMPLETED').length,
      totalRevenue: safeRecords
        .filter((r) => r.status === 'COMPLETED' && r.service_id?.price)
        .reduce((sum, r) => sum + (r.service_id.price || 0), 0),
    };

    return (
      <div className="summary-report">
        <div className="report-header">
          <h2>Summary Report</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              const csvData = [
                { Metric: 'Total Drivers', Value: stats.totalDrivers },
                { Metric: 'Total Services', Value: stats.totalServices },
                { Metric: 'Total Records', Value: stats.totalRecords },
                { Metric: 'Total Materials', Value: stats.totalMaterials },
                { Metric: 'Total Users', Value: stats.totalUsers },
                { Metric: 'Pending Records', Value: stats.pendingRecords },
                { Metric: 'In Progress Records', Value: stats.inProgressRecords },
                { Metric: 'Completed Records', Value: stats.completedRecords },
                { Metric: 'Total Revenue', Value: `RWF ${stats.totalRevenue.toFixed(2)}` },
              ];
              exportToCSV(csvData, 'summary-report');
            }}
          >
            Export CSV
          </button>
        </div>

        <div className="summary-stats-grid">
          <div className="summary-stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-details">
              <h3>Total Drivers</h3>
              <p className="stat-value">{stats.totalDrivers}</p>
            </div>
          </div>
          <div className="summary-stat-card">
            <div className="stat-icon">🔧</div>
            <div className="stat-details">
              <h3>Total Services</h3>
              <p className="stat-value">{stats.totalServices}</p>
            </div>
          </div>
          <div className="summary-stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-details">
              <h3>Total Records</h3>
              <p className="stat-value">{stats.totalRecords}</p>
            </div>
          </div>
          <div className="summary-stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-details">
              <h3>Total Materials</h3>
              <p className="stat-value">{stats.totalMaterials}</p>
            </div>
          </div>
          <div className="summary-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="summary-stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-details">
              <h3>Total Revenue</h3>
              <p className="stat-value">RWF {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="report-sections">
          <div className="report-section">
            <h3>Service Records Status</h3>
            <div className="status-breakdown">
              <div className="status-item">
                <span className="status-label">Pending:</span>
                <span className="status-value">{stats.pendingRecords}</span>
              </div>
              <div className="status-item">
                <span className="status-label">In Progress:</span>
                <span className="status-value">{stats.inProgressRecords}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Completed:</span>
                <span className="status-value">{stats.completedRecords}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Drivers Report
  const renderDriversReport = () => {
    if (!reportData) return null;
    const drivers = reportData.data || [];

    return (
      <div className="drivers-report">
        <div className="report-header">
          <h2>Drivers Report</h2>
          <button
            className="btn btn-primary"
            onClick={() => exportToCSV(drivers, 'drivers-report')}
          >
            Export CSV
          </button>
        </div>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Plate Number</th>
                <th>Car Type</th>
                <th>Car Color</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver._id}>
                  <td>{driver.full_name}</td>
                  <td>{driver.phone}</td>
                  <td className="plate-number">{driver.plate_number}</td>
                  <td>{driver.car_type}</td>
                  <td>{driver.car_color}</td>
                  <td>{formatDate(driver.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Services Report
  const renderServicesReport = () => {
    if (!reportData) return null;
    const services = reportData.data || [];
    const totalValue = services.reduce((sum, s) => sum + (s.price || 0), 0);

    return (
      <div className="services-report">
        <div className="report-header">
          <h2>Services Report</h2>
          <button
            className="btn btn-primary"
            onClick={() => exportToCSV(services, 'services-report')}
          >
            Export CSV
          </button>
        </div>
        <div className="report-summary">
          <div className="summary-item">
            <span>Total Services:</span>
            <strong>{services.length}</strong>
          </div>
          <div className="summary-item">
            <span>Total Value:</span>
            <strong>RWF {totalValue.toFixed(2)}</strong>
          </div>
        </div>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Price</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id}>
                  <td>{service.service_name}</td>
                  <td className="price">RWF {service.price?.toFixed(2) || '0.00'}</td>
                  <td>{service.description || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Service Records Report
  const renderServiceRecordsReport = () => {
    if (!reportData) return null;
    const records = reportData.data || [];

    return (
      <div className="service-records-report">
        <div className="report-header">
          <h2>Service Records Report</h2>
          <button
            className="btn btn-primary"
            onClick={() => exportToCSV(records, 'service-records-report')}
          >
            Export CSV
          </button>
        </div>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Service</th>
                <th>Status</th>
                <th>Handled By</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>
                    {typeof record.driver_id === 'object'
                      ? record.driver_id.full_name
                      : 'N/A'}
                  </td>
                  <td>
                    {typeof record.service_id === 'object'
                      ? record.service_id.service_name
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge status-${record.status?.toLowerCase().replace('_', '-')}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    {typeof record.handled_by === 'object'
                      ? record.handled_by.full_name || record.handled_by.username
                      : 'N/A'}
                  </td>
                  <td>{formatDateTime(record.check_in_time)}</td>
                  <td>{formatDateTime(record.check_out_time)}</td>
                  <td className="price">
                    {typeof record.service_id === 'object' && record.service_id.price
                      ? `RWF ${record.service_id.price.toFixed(2)}`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Materials Report
  const renderMaterialsReport = () => {
    if (!reportData) return null;
    const materials = reportData.data || [];

    return (
      <div className="materials-report">
        <div className="report-header">
          <h2>Materials Report</h2>
          <button
            className="btn btn-primary"
            onClick={() => exportToCSV(materials, 'materials-report')}
          >
            Export CSV
          </button>
        </div>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Service Record</th>
                <th>Condition Note</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material._id}>
                  <td>{material.item_name}</td>
                  <td className="quantity">{material.quantity}</td>
                  <td>
                    {typeof material.service_record_id === 'object'
                      ? material.service_record_id._id
                      : material.service_record_id || 'N/A'}
                  </td>
                  <td>{material.condition_note || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Users Report
  const renderUsersReport = () => {
    if (!reportData) return null;
    const users = reportData.data || [];

    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="users-report">
        <div className="report-header">
          <h2>Users Report</h2>
          <button
            className="btn btn-primary"
            onClick={() => exportToCSV(users, 'users-report')}
          >
            Export CSV
          </button>
        </div>
        <div className="report-summary">
          <div className="summary-item">
            <span>Total Users:</span>
            <strong>{users.length}</strong>
          </div>
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className="summary-item">
              <span>{role}:</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.full_name}</td>
                  <td className="username">{user.username}</td>
                  <td>
                    <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Financial Report
  const renderFinancialReport = () => {
    if (!reportData) return null;
    const records = reportData.data || [];
    const completedRecords = records.filter((r) => r.status === 'COMPLETED');

    const revenue = completedRecords.reduce(
      (sum, r) => sum + (r.service_id?.price || 0),
      0
    );
    const pendingRevenue = records
      .filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS')
      .reduce((sum, r) => sum + (r.service_id?.price || 0), 0);

    const serviceBreakdown = completedRecords.reduce((acc, record) => {
      const serviceName =
        typeof record.service_id === 'object'
          ? record.service_id.service_name
          : 'Unknown';
      const price = record.service_id?.price || 0;
      acc[serviceName] = (acc[serviceName] || 0) + price;
      return acc;
    }, {});

    return (
      <div className="financial-report">
        <div className="report-header">
          <h2>Financial Report</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              const csvData = [
                { Metric: 'Total Revenue', Value: `RWF ${revenue.toFixed(2)}` },
                { Metric: 'Pending Revenue', Value: `RWF ${pendingRevenue.toFixed(2)}` },
                { Metric: 'Completed Services', Value: completedRecords.length },
                ...Object.entries(serviceBreakdown).map(([service, amount]) => ({
                  Metric: service,
                  Value: `RWF ${amount.toFixed(2)}`,
                })),
              ];
              exportToCSV(csvData, 'financial-report');
            }}
          >
            Export CSV
          </button>
        </div>

        <div className="financial-summary">
          <div className="financial-card">
            <h3>Total Revenue</h3>
            <p className="amount">RWF {revenue.toFixed(2)}</p>
            <span className="subtitle">From {completedRecords.length} completed services</span>
          </div>
          <div className="financial-card">
            <h3>Pending Revenue</h3>
            <p className="amount pending">RWF {pendingRevenue.toFixed(2)}</p>
            <span className="subtitle">From pending/in-progress services</span>
          </div>
        </div>

        <div className="service-breakdown">
          <h3>Revenue by Service</h3>
          <div className="breakdown-list">
            {Object.entries(serviceBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([service, amount]) => (
                <div key={service} className="breakdown-item">
                  <span className="service-name">{service}</span>
                  <span className="service-amount">RWF {amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'summary':
        return renderSummaryReport();
      case 'drivers':
        return renderDriversReport();
      case 'services':
        return renderServicesReport();
      case 'service-records':
        return renderServiceRecordsReport();
      case 'materials':
        return renderMaterialsReport();
      case 'users':
        return renderUsersReport();
      case 'financial':
        return renderFinancialReport();
      default:
        return renderSummaryReport();
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-content">
          <div>
            <h1>Reports</h1>
            <p className="subtitle">Generate and export various business reports</p>
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span className="menu-icon">{sidebarOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      <div className="reports-layout">
        <div className={`reports-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header-mobile">
            <h3>Report Types</h3>
            <button 
              className="close-sidebar"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <div className="report-types-list">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                className={`report-type-btn ${activeReport === type.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveReport(type.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="report-type-icon">{type.icon}</span>
                <span className="report-type-name">{type.name}</span>
              </button>
            ))}
          </div>
        </div>
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="reports-content">
          {/* Date Filters - Available for all reports */}
          <div className="report-filters">
            <div className="date-presets">
              <h4>Quick Filters:</h4>
              <div className="preset-buttons">
                <button
                  className={`preset-btn ${filters.datePreset === 'all' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('all')}
                >
                  All Time
                </button>
                <button
                  className={`preset-btn ${filters.datePreset === 'today' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('today')}
                >
                  Today
                </button>
                <button
                  className={`preset-btn ${filters.datePreset === 'week' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('week')}
                >
                  This Week
                </button>
                <button
                  className={`preset-btn ${filters.datePreset === 'month' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('month')}
                >
                  This Month
                </button>
                <button
                  className={`preset-btn ${filters.datePreset === 'lastMonth' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('lastMonth')}
                >
                  Last Month
                </button>
                <button
                  className={`preset-btn ${filters.datePreset === 'last7Days' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('last7Days')}
                >
                  Last 7 Days
                </button>
                <button
                  className={`preset-btn ${filters.datePreset === 'last30Days' ? 'active' : ''}`}
                  onClick={() => handleDatePreset('last30Days')}
                >
                  Last 30 Days
                </button>
              </div>
            </div>
            <div className="custom-date-range">
              <h4>Custom Date Range:</h4>
              <div className="date-inputs">
                <div className="filter-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleCustomDateChange}
                  />
                </div>
                <div className="filter-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleCustomDateChange}
                  />
                </div>
                {(filters.startDate || filters.endDate) && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        datePreset: 'all',
                        startDate: '',
                        endDate: '',
                      }));
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {/* Status filter - only for service-records */}
            {activeReport === 'service-records' && (
              <div className="status-filter">
                <div className="filter-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            )}
            {/* Active filter display */}
            {(filters.startDate || filters.endDate) && (
              <div className="active-filter-display">
                <span className="filter-label">Active Date Range:</span>
                <span className="filter-value">
                  {filters.startDate ? formatDate(filters.startDate) : 'Start'} -{' '}
                  {filters.endDate ? formatDate(filters.endDate) : 'End'}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading report...</div>
          ) : (
            <div className="report-content">{renderReport()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

import React, { useState, useEffect } from 'react';
import serviceRecordService from '../services/serviceRecordService';
import driverService from '../services/driverService';
import serviceService from '../services/serviceService';
import userService from '../services/userService';
import './ServiceRecords.css';

const ServiceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [filterDriverId, setFilterDriverId] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    driver_id: '',
    service_id: '',
    handled_by: '',
    status: 'PENDING',
    check_in_time: new Date().toISOString().slice(0, 16),
    check_out_time: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceRecordService.getAllServiceRecords(statusFilter || null);
      setRecords(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load service records');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsByDriver = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceRecordService.getServiceRecordsByDriverId(filterDriverId);
      setRecords(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load service records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [driversRes, servicesRes, usersRes] = await Promise.all([
        driverService.getAllDrivers(),
        serviceService.getAllServices(),
        userService.getAllUsers(),
      ]);
      setDrivers(driversRes.data || []);
      setServices(servicesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch related data:', err);
    }
  };

  // Fetch all service records
  useEffect(() => {
    if (filterDriverId) {
      fetchRecordsByDriver();
    } else {
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, filterDriverId]);

  // Fetch drivers, services, and users when form is shown
  useEffect(() => {
    if (showForm) {
      fetchRelatedData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      driver_id: '',
      service_id: '',
      handled_by: '',
      status: 'PENDING',
      check_in_time: new Date().toISOString().slice(0, 16),
      check_out_time: '',
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const submitData = {
        ...formData,
        check_out_time: formData.check_out_time || null,
      };
      if (editingRecord) {
        // Update existing record
        await serviceRecordService.updateServiceRecord(editingRecord._id, submitData);
      } else {
        // Create new record
        await serviceRecordService.createServiceRecord(submitData);
      }
      resetForm();
      if (filterDriverId) {
        fetchRecordsByDriver();
      } else {
        fetchRecords();
      }
    } catch (err) {
      setError(err.message || 'Failed to save service record');
    }
  };

  // Handle edit button click
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      driver_id: record.driver_id?._id || record.driver_id || '',
      service_id: record.service_id?._id || record.service_id || '',
      handled_by: record.handled_by?._id || record.handled_by || '',
      status: record.status || 'PENDING',
      check_in_time: record.check_in_time
        ? new Date(record.check_in_time).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      check_out_time: record.check_out_time
        ? new Date(record.check_out_time).toISOString().slice(0, 16)
        : '',
    });
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      try {
        setError(null);
        await serviceRecordService.deleteServiceRecord(id);
        if (filterDriverId) {
          fetchRecordsByDriver();
        } else {
          fetchRecords();
        }
      } catch (err) {
        setError(err.message || 'Failed to delete service record');
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    setFilterDriverId('');
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  };

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate statistics
  const stats = {
    total: records.length,
    pending: records.filter((r) => r.status === 'PENDING').length,
    inProgress: records.filter((r) => r.status === 'IN_PROGRESS').length,
    completed: records.filter((r) => r.status === 'COMPLETED').length,
  };

  return (
    <div className="service-records-container">
      <div className="service-records-header">
        <div>
          <h1>Service Records Management</h1>
          <p className="subtitle">Track and manage service records for drivers</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          {showForm && !editingRecord ? 'Cancel' : 'Add New Record'}
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filterDriverId">Filter by Driver ID:</label>
          <div className="filter-input-group">
            <input
              type="text"
              id="filterDriverId"
              value={filterDriverId}
              onChange={(e) => setFilterDriverId(e.target.value)}
              placeholder="Enter driver ID"
            />
            {(statusFilter || filterDriverId) && (
              <button className="btn btn-secondary btn-small" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {!loading && records.length > 0 && (
        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card status-pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-card status-in-progress">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
          <div className="stat-card status-completed">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="record-form-container">
          <h2>{editingRecord ? 'Edit Service Record' : 'Add New Service Record'}</h2>
          <form onSubmit={handleSubmit} className="record-form">
            <div className="form-group">
              <label htmlFor="driver_id">Driver *</label>
              <select
                id="driver_id"
                name="driver_id"
                value={formData.driver_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a driver</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.full_name} - {driver.plate_number} ({driver.car_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="service_id">Service *</label>
              <select
                id="service_id"
                name="service_id"
                value={formData.service_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.service_name} - RWF {service.price?.toFixed(2) || '0.00'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="handled_by">Handled By (User) *</label>
              <select
                id="handled_by"
                name="handled_by"
                value={formData.handled_by}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.full_name} ({user.username}) - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="check_in_time">Check-in Time *</label>
              <input
                type="datetime-local"
                id="check_in_time"
                name="check_in_time"
                value={formData.check_in_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="check_out_time">Check-out Time</label>
              <input
                type="datetime-local"
                id="check_out_time"
                name="check_out_time"
                value={formData.check_out_time}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingRecord ? 'Update Record' : 'Create Record'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading service records...</div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <p>
            {filterDriverId
              ? 'No service records found for this driver.'
              : 'No service records found. Add your first record to get started!'}
          </p>
        </div>
      ) : (
        <div className="records-list">
          <div className="records-grid">
            {records.map((record) => (
              <div key={record._id} className="record-card">
                <div className="record-card-header">
                  <div className="record-header-content">
                    <h3>
                      {record.service_id?.service_name || 'Service'}
                      {record.service_id?.price && (
                        <span className="service-price"> - RWF {record.service_id.price.toFixed(2)}</span>
                      )}
                    </h3>
                    <span className={`status-badge ${getStatusClass(record.status)}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="record-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(record)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(record._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="record-card-body">
                  <div className="record-info">
                    {record.driver_id && (
                      <div className="info-item">
                        <span className="info-label">Driver:</span>
                        <span className="info-value">
                          {typeof record.driver_id === 'object'
                            ? `${record.driver_id.full_name} (${record.driver_id.plate_number})`
                            : record.driver_id}
                        </span>
                      </div>
                    )}
                    {record.handled_by && (
                      <div className="info-item">
                        <span className="info-label">Handled By:</span>
                        <span className="info-value">
                          {typeof record.handled_by === 'object'
                            ? record.handled_by.full_name || record.handled_by.username
                            : record.handled_by}
                        </span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Check-in:</span>
                      <span className="info-value">{formatDateTime(record.check_in_time)}</span>
                    </div>
                    {record.check_out_time && (
                      <div className="info-item">
                        <span className="info-label">Check-out:</span>
                        <span className="info-value">{formatDateTime(record.check_out_time)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRecords;

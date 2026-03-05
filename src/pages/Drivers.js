import React, { useState, useEffect } from 'react';
import driverService from '../services/driverService';
import './Drivers.css';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    plate_number: '',
    car_type: '',
    car_color: '',
  });

  // Fetch all drivers
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await driverService.getAllDrivers();
      setDrivers(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

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
      full_name: '',
      phone: '',
      plate_number: '',
      car_type: '',
      car_color: '',
    });
    setEditingDriver(null);
    setShowForm(false);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingDriver) {
        // Update existing driver
        await driverService.updateDriver(editingDriver._id, formData);
      } else {
        // Create new driver
        await driverService.createDriver(formData);
      }
      resetForm();
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Failed to save driver');
    }
  };

  // Handle edit button click
  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      full_name: driver.full_name || '',
      phone: driver.phone || '',
      plate_number: driver.plate_number || '',
      car_type: driver.car_type || '',
      car_color: driver.car_color || '',
    });
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        setError(null);
        await driverService.deleteDriver(id);
        fetchDrivers();
      } catch (err) {
        setError(err.message || 'Failed to delete driver');
      }
    }
  };

  return (
    <div className="drivers-container">
      <div className="drivers-header">
        <h1>Drivers Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          {showForm && !editingDriver ? 'Cancel' : 'Add New Driver'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="driver-form-container">
          <h2>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
          <form onSubmit={handleSubmit} className="driver-form">
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                placeholder="Enter driver's full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="plate_number">Plate Number *</label>
              <input
                type="text"
                id="plate_number"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleInputChange}
                required
                placeholder="Enter plate number"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="car_type">Car Type *</label>
              <input
                type="text"
                id="car_type"
                name="car_type"
                value={formData.car_type}
                onChange={handleInputChange}
                required
                placeholder="e.g., Sedan, SUV, Hatchback"
              />
            </div>

            <div className="form-group">
              <label htmlFor="car_color">Car Color *</label>
              <input
                type="text"
                id="car_color"
                name="car_color"
                value={formData.car_color}
                onChange={handleInputChange}
                required
                placeholder="Enter car color"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingDriver ? 'Update Driver' : 'Create Driver'}
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
        <div className="loading">Loading drivers...</div>
      ) : drivers.length === 0 ? (
        <div className="empty-state">
          <p>No drivers found. Add your first driver to get started!</p>
        </div>
      ) : (
        <div className="drivers-list">
          <div className="drivers-stats">
            <p>Total Drivers: {drivers.length}</p>
          </div>
          <div className="drivers-grid">
            {drivers.map((driver) => (
              <div key={driver._id} className="driver-card">
                <div className="driver-card-header">
                  <h3>{driver.full_name}</h3>
                  <div className="driver-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(driver)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(driver._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="driver-card-body">
                  <div className="driver-info">
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{driver.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Plate Number:</span>
                      <span className="info-value plate-number">
                        {driver.plate_number}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Car Type:</span>
                      <span className="info-value">{driver.car_type}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Car Color:</span>
                      <span className="info-value">{driver.car_color}</span>
                    </div>
                    {driver.created_at && (
                      <div className="info-item">
                        <span className="info-label">Created:</span>
                        <span className="info-value">
                          {new Date(driver.created_at).toLocaleDateString()}
                        </span>
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

export default Drivers;

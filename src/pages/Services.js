import React, { useState, useEffect } from 'react';
import serviceService from '../services/serviceService';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    service_name: '',
    price: 0,
    description: '',
  });

  // Fetch all services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceService.getAllServices();
      setServices(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      service_name: '',
      price: 0,
      description: '',
    });
    setEditingService(null);
    setShowForm(false);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingService) {
        // Update existing service
        await serviceService.updateService(editingService._id, formData);
      } else {
        // Create new service
        await serviceService.createService(formData);
      }
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.message || 'Failed to save service');
    }
  };

  // Handle edit button click
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name || '',
      price: service.price || 0,
      description: service.description || '',
    });
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setError(null);
        await serviceService.deleteService(id);
        fetchServices();
      } catch (err) {
        setError(err.message || 'Failed to delete service');
      }
    }
  };

  // Calculate total value
  const totalValue = services.reduce((sum, service) => sum + (service.price || 0), 0);

  return (
    <div className="services-container">
      <div className="services-header">
        <div>
          <h1>Services Management</h1>
          <p className="subtitle">Manage your service offerings and pricing</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          {showForm && !editingService ? 'Cancel' : 'Add New Service'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="service-form-container">
          <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={handleSubmit} className="service-form">
            <div className="form-group">
              <label htmlFor="service_name">Service Name *</label>
              <input
                type="text"
                id="service_name"
                name="service_name"
                value={formData.service_name}
                onChange={handleInputChange}
                required
                placeholder="Enter service name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">RWF</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="price-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter service description (optional)"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingService ? 'Update Service' : 'Create Service'}
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
        <div className="loading">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <p>No services found. Add your first service to get started!</p>
        </div>
      ) : (
        <div className="services-list">
          <div className="services-stats">
            <div className="stat-item">
              <span className="stat-label">Total Services:</span>
              <span className="stat-value">{services.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value price">RWF {totalValue.toFixed(2)}</span>
            </div>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service._id} className="service-card">
                <div className="service-card-header">
                  <h3>{service.service_name}</h3>
                  <div className="service-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(service)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(service._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="service-card-body">
                  <div className="service-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">RWF {service.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  {service.description && (
                    <div className="service-description">
                      <p>{service.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;

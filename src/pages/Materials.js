import React, { useState, useEffect } from 'react';
import materialService from '../services/materialService';
import serviceRecordService from '../services/serviceRecordService';
import './Materials.css';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [filterServiceRecordId, setFilterServiceRecordId] = useState('');
  const [serviceRecords, setServiceRecords] = useState([]);
  const [formData, setFormData] = useState({
    service_record_id: '',
    item_name: '',
    quantity: 1,
    condition_note: '',
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materialService.getAllMaterials();
      setMaterials(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialsByServiceRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materialService.getMaterialsByServiceRecordId(
        filterServiceRecordId
      );
      setMaterials(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRecords = async () => {
    try {
      const response = await serviceRecordService.getAllServiceRecords();
      setServiceRecords(response.data || []);
    } catch (err) {
      console.error('Failed to fetch service records:', err);
    }
  };

  // Fetch all materials
  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch materials when filter changes
  useEffect(() => {
    if (filterServiceRecordId) {
      fetchMaterialsByServiceRecord();
    } else {
      fetchMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterServiceRecordId]);

  // Fetch service records when form is shown
  useEffect(() => {
    if (showForm) {
      fetchServiceRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      service_record_id: '',
      item_name: '',
      quantity: 1,
      condition_note: '',
    });
    setEditingMaterial(null);
    setShowForm(false);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingMaterial) {
        // Update existing material
        await materialService.updateMaterial(editingMaterial._id, formData);
      } else {
        // Create new material
        await materialService.createMaterial(formData);
      }
      resetForm();
      if (filterServiceRecordId) {
        fetchMaterialsByServiceRecord();
      } else {
        fetchMaterials();
      }
    } catch (err) {
      setError(err.message || 'Failed to save material');
    }
  };

  // Handle edit button click
  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      service_record_id: material.service_record_id?._id || material.service_record_id || '',
      item_name: material.item_name || '',
      quantity: material.quantity || 1,
      condition_note: material.condition_note || '',
    });
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        setError(null);
        await materialService.deleteMaterial(id);
        if (filterServiceRecordId) {
          fetchMaterialsByServiceRecord();
        } else {
          fetchMaterials();
        }
      } catch (err) {
        setError(err.message || 'Failed to delete material');
      }
    }
  };

  // Clear filter
  const clearFilter = () => {
    setFilterServiceRecordId('');
  };

  return (
    <div className="materials-container">
      <div className="materials-header">
        <h1>Materials Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          {showForm && !editingMaterial ? 'Cancel' : 'Add New Material'}
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="filterServiceRecord">Filter by Service Record ID:</label>
          <div className="filter-input-group">
            <input
              type="text"
              id="filterServiceRecord"
              value={filterServiceRecordId}
              onChange={(e) => setFilterServiceRecordId(e.target.value)}
              placeholder="Enter service record ID"
            />
            {filterServiceRecordId && (
              <button className="btn btn-secondary btn-small" onClick={clearFilter}>
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="material-form-container">
          <h2>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h2>
          <form onSubmit={handleSubmit} className="material-form">
            <div className="form-group">
              <label htmlFor="service_record_id">Service Record *</label>
              <select
                id="service_record_id"
                name="service_record_id"
                value={formData.service_record_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a service record</option>
                {serviceRecords.map((record) => {
                  const driverName = record.driver_id?.full_name || 'Unknown Driver';
                  const serviceName = record.service_id?.service_name || 'Unknown Service';
                  const status = record.status || '';
                  return (
                    <option key={record._id} value={record._id}>
                      {driverName} - {serviceName} ({status})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="item_name">Item Name *</label>
              <input
                type="text"
                id="item_name"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
                required
                placeholder="Enter item name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Enter quantity"
              />
            </div>

            <div className="form-group">
              <label htmlFor="condition_note">Condition Note</label>
              <textarea
                id="condition_note"
                name="condition_note"
                value={formData.condition_note}
                onChange={handleInputChange}
                placeholder="Enter condition note (optional)"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingMaterial ? 'Update Material' : 'Create Material'}
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
        <div className="loading">Loading materials...</div>
      ) : materials.length === 0 ? (
        <div className="empty-state">
          <p>
            {filterServiceRecordId
              ? 'No materials found for this service record.'
              : 'No materials found. Add your first material to get started!'}
          </p>
        </div>
      ) : (
        <div className="materials-list">
          <div className="materials-stats">
            <p>
              {filterServiceRecordId
                ? `Materials for Service Record: ${filterServiceRecordId} (${materials.length})`
                : `Total Materials: ${materials.length}`}
            </p>
          </div>
          <div className="materials-grid">
            {materials.map((material) => (
              <div key={material._id} className="material-card">
                <div className="material-card-header">
                  <h3>{material.item_name}</h3>
                  <div className="material-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(material)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(material._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="material-card-body">
                  <div className="material-info">
                    <div className="info-item">
                      <span className="info-label">Quantity:</span>
                      <span className="info-value quantity-badge">
                        {material.quantity}
                      </span>
                    </div>
                    {material.service_record_id && (
                      <>
                        <div className="info-item">
                          <span className="info-label">Service Record ID:</span>
                          <span className="info-value service-record-id">
                            {typeof material.service_record_id === 'object'
                              ? material.service_record_id._id
                              : material.service_record_id}
                          </span>
                        </div>
                        {material.service_record_id.status && (
                          <div className="info-item">
                            <span className="info-label">Service Status:</span>
                            <span className="info-value status-badge">
                              {material.service_record_id.status}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {material.condition_note && (
                      <div className="info-item full-width">
                        <span className="info-label">Condition Note:</span>
                        <span className="info-value condition-note">
                          {material.condition_note}
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

export default Materials;

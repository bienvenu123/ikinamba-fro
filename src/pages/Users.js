import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    role: 'WASHER',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      let usersData = response.data || [];
      
      // Filter by role if selected
      if (roleFilter) {
        usersData = usersData.filter((user) => user.role === roleFilter);
      }
      
      setUsers(usersData);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when role filter changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

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
      username: '',
      password: '',
      role: 'WASHER',
    });
    setEditingUser(null);
    setShowForm(false);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const submitData = { ...formData };
      
      // If editing and password is empty, don't send it
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }
      
      if (editingUser) {
        // Update existing user
        await userService.updateUser(editingUser._id, submitData);
      } else {
        // Create new user (password required)
        if (!submitData.password) {
          setError('Password is required for new users');
          return;
        }
        await userService.createUser(submitData);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    }
  };

  // Handle edit button click
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '',
      username: user.username || '',
      password: '', // Don't show password when editing
      role: user.role || 'WASHER',
    });
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError(null);
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Get role badge class
  const getRoleClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'role-admin';
      case 'MANAGER':
        return 'role-manager';
      case 'WASHER':
        return 'role-washer';
      default:
        return '';
    }
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === 'ADMIN').length,
    manager: users.filter((u) => u.role === 'MANAGER').length,
    washer: users.filter((u) => u.role === 'WASHER').length,
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <h1>Users Management</h1>
          <p className="subtitle">Manage system users and their roles</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          {showForm && !editingUser ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="roleFilter">Filter by Role:</label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="WASHER">Washer</option>
          </select>
        </div>
        {roleFilter && (
          <button className="btn btn-secondary btn-small" onClick={() => setRoleFilter('')}>
            Clear Filter
          </button>
        )}
      </div>

      {/* Statistics */}
      {!loading && users.length > 0 && (
        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card role-admin">
            <span className="stat-label">Admin</span>
            <span className="stat-value">{stats.admin}</span>
          </div>
          <div className="stat-card role-manager">
            <span className="stat-label">Manager</span>
            <span className="stat-value">{stats.manager}</span>
          </div>
          <div className="stat-card role-washer">
            <span className="stat-label">Washer</span>
            <span className="stat-value">{stats.washer}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="user-form-container">
          <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter username"
                disabled={!!editingUser}
              />
              {editingUser && (
                <small className="form-hint">Username cannot be changed</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password {editingUser ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
                placeholder={editingUser ? 'Enter new password (optional)' : 'Enter password (min 6 characters)'}
                minLength={editingUser ? 0 : 6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="WASHER">Washer</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Update User' : 'Create User'}
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
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>
            {roleFilter
              ? `No users found with role: ${roleFilter}`
              : 'No users found. Add your first user to get started!'}
          </p>
        </div>
      ) : (
        <div className="users-list">
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-card-header">
                  <div className="user-header-content">
                    <h3>{user.full_name}</h3>
                    <span className={`role-badge ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="user-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(user)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(user._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="user-card-body">
                  <div className="user-info">
                    <div className="info-item">
                      <span className="info-label">Username:</span>
                      <span className="info-value username">{user.username}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Role:</span>
                      <span className="info-value">
                        <span className={`role-badge-small ${getRoleClass(user.role)}`}>
                          {user.role}
                        </span>
                      </span>
                    </div>
                    {user.createdAt && (
                      <div className="info-item">
                        <span className="info-label">Created:</span>
                        <span className="info-value">
                          {new Date(user.createdAt).toLocaleDateString()}
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

export default Users;

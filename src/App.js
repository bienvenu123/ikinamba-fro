import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Home from './pages/Home';
import Drivers from './pages/Drivers';
import Materials from './pages/Materials';
import Services from './pages/Services';
import ServiceRecords from './pages/ServiceRecords';
import Users from './pages/Users';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="materials" element={<Materials />} />
              <Route path="services" element={<Services />} />
              <Route path="service-records" element={<ServiceRecords />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

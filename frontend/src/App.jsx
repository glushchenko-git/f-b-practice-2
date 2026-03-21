import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Users from './pages/Users';
import UserEdit from './pages/UserEdit';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={
              <PrivateRoute user={user}>
                <Products user={user} />
              </PrivateRoute>
            } />
            <Route path="/products/:id" element={
              <PrivateRoute user={user}>
                <ProductDetail user={user} />
              </PrivateRoute>
            } />
            <Route path="/products/create" element={
              <PrivateRoute user={user} roles={['seller', 'admin']}>
                <ProductForm />
              </PrivateRoute>
            } />
            <Route path="/products/edit/:id" element={
              <PrivateRoute user={user} roles={['seller', 'admin']}>
                <ProductForm />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute user={user} roles={['admin']}>
                <Users />
              </PrivateRoute>
            } />
            <Route path="/users/:id" element={
              <PrivateRoute user={user} roles={['admin']}>
                <UserEdit />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/products" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
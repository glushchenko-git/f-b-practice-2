import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, user, roles = [] }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/products" replace />;
  }
  
  return children;
}

export default PrivateRoute;
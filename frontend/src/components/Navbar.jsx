import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/products" className="nav-brand">
          🛒 RBAC Shop
        </Link>
        
        <div className="nav-links">
          <Link to="/products" className="nav-link">
            Товары
          </Link>
          
          {(user?.role === 'seller' || user?.role === 'admin') && (
            <Link to="/products/create" className="nav-link">
              ➕ Создать товар
            </Link>
          )}
          
          {user?.role === 'admin' && (
            <Link to="/users" className="nav-link">
              👥 Пользователи
            </Link>
          )}
        </div>
        
        <div className="nav-user">
          {user ? (
            <>
              <span className="user-info">
                {user.first_name} {user.last_name}
                <span className={`role-badge role-${user.role}`}>
                  {user.role === 'admin' ? 'Админ' : user.role === 'seller' ? 'Продавец' : 'Пользователь'}
                </span>
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Вход</Link>
              <Link to="/register" className="btn-register">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
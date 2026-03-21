import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBlock = async (id) => {
    if (!confirm('Вы уверены, что хотите заблокировать этого пользователя?')) return;
    
    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Ошибка блокировки пользователя');
    }
  };
  
  const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Администратор';
      case 'seller': return 'Продавец';
      default: return 'Пользователь';
    }
  };
  
  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="users-page">
      <h1>Управление пользователями</h1>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={user.isBlocked ? 'blocked' : ''}>
                <td>{user.email}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
                <td>
                  {user.isBlocked ? (
                    <span className="status-blocked">Заблокирован</span>
                  ) : (
                    <span className="status-active">Активен</span>
                  )}
                </td>
                <td>
                  <Link to={`/users/${user.id}`} className="btn-edit-small">
                    Редактировать
                  </Link>
                  {!user.isBlocked && (
                    <button onClick={() => handleBlock(user.id)} className="btn-block-small">
                      Заблокировать
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
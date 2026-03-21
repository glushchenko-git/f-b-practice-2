import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'user',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchUser();
  }, [id]);
  
  const fetchUser = async () => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      const user = response.data;
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        password: ''
      });
    } catch (err) {
      setError('Ошибка загрузки пользователя');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const dataToSend = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role
    };
    
    if (formData.password) {
      dataToSend.password = formData.password;
    }
    
    try {
      await apiClient.put(`/users/${id}`, dataToSend);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обновления пользователя');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-edit-container">
      <h1>Редактирование пользователя</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Фамилия</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Роль</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">Пользователь</option>
            <option value="seller">Продавец</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Новый пароль (оставьте пустым, чтобы не менять)</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" onClick={() => navigate('/users')} className="btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserEdit;
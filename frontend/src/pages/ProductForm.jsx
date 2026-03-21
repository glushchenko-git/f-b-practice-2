import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      const product = response.data;
      setFormData({
        title: product.title,
        category: product.category,
        description: product.description,
        price: product.price
      });
    } catch (err) {
      setError('Ошибка загрузки товара');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (id) {
        await apiClient.put(`/products/${id}`, formData);
      } else {
        await apiClient.post('/products', formData);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения товара');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="product-form-container">
      <h1>{id ? 'Редактировать товар' : 'Создать новый товар'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Название</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Категория</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="5"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Цена (₽)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Сохранение...' : (id ? 'Обновить' : 'Создать')}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
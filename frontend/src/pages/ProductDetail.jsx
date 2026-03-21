import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

function ProductDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchProduct();
  }, [id]);
  
  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      setError('Товар не найден');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
      await apiClient.delete(`/products/${id}`);
      navigate('/products');
    } catch (err) {
      alert('Ошибка удаления товара');
    }
  };
  
  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="product-detail">
      <Link to="/products" className="btn-back">← Назад к списку</Link>
      
      <div className="product-detail-card">
        <h1>{product.title}</h1>
        <div className="detail-category">Категория: {product.category}</div>
        <div className="detail-description">{product.description}</div>
        <div className="detail-price">{product.price.toLocaleString()} ₽</div>
        <div className="detail-date">
          Добавлено: {new Date(product.createdAt).toLocaleDateString()}
        </div>
        
        {(user?.role === 'seller' || user?.role === 'admin') && (
          <div className="detail-actions">
            <Link to={`/products/edit/${product.id}`} className="btn-edit">
              Редактировать
            </Link>
            {user?.role === 'admin' && (
              <button onClick={handleDelete} className="btn-delete">
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;   
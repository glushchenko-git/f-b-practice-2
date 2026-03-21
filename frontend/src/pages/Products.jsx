import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch (err) {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Ошибка удаления товара');
    }
  };
  
  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="products-page">
      <h1>Каталог товаров</h1>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.title}</h3>
            <div className="product-category">{product.category}</div>
            <p className="product-description">{product.description}</p>
            <div className="product-price">{product.price.toLocaleString()} ₽</div>
            
            <div className="product-actions">
              <Link to={`/products/${product.id}`} className="btn-view">
                Подробнее
              </Link>
              
              {(user?.role === 'seller' || user?.role === 'admin') && (
                <Link to={`/products/edit/${product.id}`} className="btn-edit">
                  Редактировать
                </Link>
              )}
              
              {user?.role === 'admin' && (
                <button onClick={() => handleDelete(product.id)} className="btn-delete">
                  Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
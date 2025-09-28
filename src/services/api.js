import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

// Set JWT token to headers
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_URL}token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem('access_token', newAccessToken);
          setAuthToken(newAccessToken);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// User registration
export const registerUser = (userData) => {
  return api.post('users/', userData);
};

// User login (get tokens)
export const loginUser = (credentials) => {
  return api.post('token/', credentials);
};

// Get products
export const getProducts = () => {
  return api.get('ecom/products/');
};

// Create product (admin)
export const createProduct = (productData) => {
  return api.post('ecom/products/', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update product (admin)
export const updateProduct = (id, productData) => {
  return api.put(`ecom/products/${id}/`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Delete product (admin)
export const deleteProduct = (id) => {
  return api.delete(`ecom/products/${id}/`);
};

// Create order
export const createOrder = (orderData) => {
  return api.post('ecom/orders/', orderData);
};

// Confirm order
export const confirmOrder = (orderId) => {
  return api.post(`ecom/orders/${orderId}/confirm/`);
};

// Get user orders
export const getUserOrders = () => {
  return api.get('ecom/orders/');
};

export const getPointsRate = () => {
  return api.get('points-rates/');
};

// Get user points and rewards (from loyalty system)
export const getUserProfile = () => {
  return api.get('users/me/');
};

export const getRewards = () => {
  return api.get('rewards/');
};

export const redeemReward = (rewardId) => {
  return api.post(`rewards/${rewardId}/redeem/`);
};

// Get user redemption history
export const getUserRedemptions = () => {
  return api.get('user-redemptions/');
};

// Mark redemption as used
export const markRedemptionUsed = (id) => {
  return api.post(`redemptions/${id}/mark_used/`);
};

export default api;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import LoyaltyPage from './components/LoyaltyPage';
import AdminDashboard from './components/AdminDashboard';
import TopBar from './components/TopBar';
import Login from './components/Login';
import Register from './components/Register';
import { CartProvider } from './contexts/CartContext';
import { setAuthToken, getUserProfile } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setAuthToken(token);
      getUserProfile()
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch user profile', error);
          setUser(null);
          // Do not clear tokens here; let the user re-login if needed
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setUser(null);
    }
  }, []);

  const handleLogin = (token) => {
    if (token) {
      localStorage.setItem('access_token', token);
      setAuthToken(token);
      try {
        const payload = jwtDecode(token);
        setUser({ role: payload.role });
      } catch (e) {
        console.error('Invalid token on login:', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const RequireAuth = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  // Custom theme for armor e-commerce site
  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? '#b0b0b0' : '#666666',
      },
      divider: mode === 'dark' ? '#404040' : '#e0e0e0',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <Router>
          <TopBar user={user} toggleMode={toggleMode} mode={mode} />
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/products"
              element={
                <RequireAuth>
                  <ProductList />
                </RequireAuth>
              }
            />
            <Route
              path="/cart"
              element={
                <RequireAuth>
                  <Cart />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/loyalty"
              element={
                <RequireAuth>
                  <LoyaltyPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  {user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/products" />}
                </RequireAuth>
              }
            />
            <Route path="/" element={<Home user={user} />} />
          </Routes>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;

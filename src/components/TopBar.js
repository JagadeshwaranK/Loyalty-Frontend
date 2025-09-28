import React from 'react';
import { AppBar, Toolbar, Typography, Button, Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const TopBar = ({ user, toggleMode, mode }) => {
  const { cart, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    clearCart();
    navigate('/login');
    window.location.reload(); // To reset state
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1200 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Armor E-Commerce
        </Typography>
        {user && (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{ color: location.pathname === '/' ? 'yellow' : 'inherit' }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/products"
              sx={{ color: location.pathname === '/products' ? 'yellow' : 'inherit' }}
            >
              Products
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/cart"
              sx={{ color: location.pathname === '/cart' ? 'yellow' : 'inherit' }}
            >
              <Badge badgeContent={cartItemCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/loyalty"
              sx={{ color: location.pathname === '/loyalty' ? 'yellow' : 'inherit' }}
            >
              Loyalty
            </Button>
            {user?.role === 'admin' && (
              <Button
                color="inherit"
                component={Link}
                to="/admin"
                sx={{ color: location.pathname === '/admin' ? 'yellow' : 'inherit' }}
              >
                Admin
              </Button>
            )}
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'dark' ? <BrightnessHighIcon /> : <BrightnessLowIcon />}
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;

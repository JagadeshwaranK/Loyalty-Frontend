import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Badge
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [pointsRate, setPointsRate] = useState(1);

  useEffect(() => {
    const fetchPointsRate = async () => {
      try {
        const response = await api.get('points-rates/');
        if (response.data.length > 0) {
          setPointsRate(response.data[0].rate);
        }
      } catch (error) {
        console.error('Failed to fetch points rate', error);
      }
    };

    fetchPointsRate();
  }, []);

  if (cart.length === 0) {
    return (
      <Box sx={{ padding: '20px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add some armor products to get started!
        </Typography>
        <Button variant="contained" component={Link} to="/products" size="large">
          Continue Shopping
        </Button>
      </Box>
    );
  }

  const total = getCartTotal();
  // Points earned will be calculated on backend with configurable rate
  const pointsEarned = Math.floor(total * pointsRate); // Placeholder, actual calculation on backend

  return (
    <Box sx={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart ({cart.length} items)
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <List sx={{ width: '100%' }}>
            {cart.map((item) => {
              const subtotal = item.price * item.quantity;
              return (
                <ListItem key={item.id} divider sx={{ p: 2 }}>
                  <Grid container>
                    <Grid item xs={3} sm={2}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={item.image || 'https://via.placeholder.com/100x100/1976d2/ffffff?text=' + item.name.substring(0, 4)}
                        alt={item.name}
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={7}>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" color="text.secondary" component="span">
                              ${item.price} each
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }} component="span" display="block">
                              Subtotal: ${subtotal.toFixed(2)}
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={3} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                          <Typography variant="body1">{item.quantity}</Typography>
                        
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </ListItem>
              );
            })}
          </List>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${total.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                <Typography>Points Earned:</Typography>
                <Typography>{pointsEarned}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Total:</Typography>
                <Typography variant="h5">${total.toFixed(2)}</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/checkout')}
                sx={{ mt: 2 }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/products"
                sx={{ mt: 1 }}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart;

import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import api, { createOrder, confirmOrder, getUserRedemptions, markRedemptionUsed } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Grid,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  // Form state for shipping address
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'USA',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [pointsRate, setPointsRate] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      const orderData = {
        items_data: orderItems,
        shipping_address: formData
      };
      const response = await createOrder(orderData);
      const orderId = response.data.id;
      await confirmOrder(orderId);
      // Mark coupon as used after successful order
      if (appliedCoupon && appliedCoupon.id) {
        try {
          await markRedemptionUsed(appliedCoupon.id);
        } catch (error) {
          console.error('Failed to mark coupon as used', error);
          // Don't fail the order for this
        }
      }
      clearCart();
      setSnackbarMessage('Order placed successfully! Points earned.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/loyalty'), 2000);
    } catch (error) {
      console.error('Checkout failed', error);
      setSnackbarMessage('Checkout failed. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    try {
      // Validate coupon: check if exists in user's redemptions and not used
      const response = await getUserRedemptions();
      const redemptions = response.data;
      const validCoupon = redemptions.find(r => r.coupon_code === couponCode.trim().toUpperCase() && !r.used);
      if (validCoupon) {
        const reward = validCoupon.reward;
        let discount = 0;
        let freeShipping = false;
        let freeProduct = null;
        if (reward.redemption_type === 'amount_discount' && reward.amount_discount) {
          discount = parseFloat(reward.amount_discount);
        } else if (reward.redemption_type === 'free_shipping') {
          freeShipping = true;
        } else if (reward.redemption_type === 'free_product' && reward.free_product_sku) {
          // Check if product is in cart
          const productInCart = cart.find(item => item.sku === reward.free_product_sku);
          if (productInCart) {
            discount = parseFloat(productInCart.price) * parseInt(productInCart.quantity);
            freeProduct = productInCart.name;
          } else {
            setCouponError('Free product not in cart');
            return;
          }
        } else {
          setCouponError('Invalid coupon type');
          return;
        }
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount, freeShipping, freeProduct, id: validCoupon.id });
        setCouponError('');
        setSnackbarMessage('Coupon applied successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } else {
        setCouponError('Invalid, expired, or already used coupon code');
      }
    } catch (error) {
      console.error('Failed to validate coupon', error);
      setCouponError('Failed to validate coupon');
    }
  };

  if (cart.length === 0) {
    return (
      <Box sx={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          No items in cart
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  const total = getCartTotal();
  // Points earned will be calculated on backend with configurable rate
  const pointsEarned = Math.floor(total * pointsRate); // Placeholder, actual calculation on backend

  return (
    <Box sx={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Checkout
      </Typography>
      <Grid container spacing={3}>
        {/* Shipping Address Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!errors.city}
                    helperText={errors.city}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.country}>
                    <InputLabel>Country</InputLabel>
                    <Select
                      name="country"
                      value={formData.country}
                      label="Country"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="USA">USA</MenuItem>
                      <MenuItem value="Canada">Canada</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Payment Placeholder */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For demo purposes, orders are processed with a mock payment. In production, integrate with Stripe or PayPal.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Button variant="outlined" fullWidth disabled>
                Credit Card **** **** **** 1234
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <List disablePadding>
                {cart.map((item) => (
                  <ListItem key={item.id} sx={{ py: 1 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} x $${item.price}`}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 1.5 }} />
              {/* Coupon Section */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  error={!!couponError}
                  helperText={couponError}
                />
                <Button variant="outlined" onClick={handleApplyCoupon} size="small">
                  Apply
                </Button>
              </Box>
              {appliedCoupon && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Coupon {appliedCoupon.code} applied: {appliedCoupon.freeProduct ? `Free ${appliedCoupon.freeProduct}` : appliedCoupon.freeShipping ? 'Free Shipping' : `$${appliedCoupon.discount.toFixed(2)} off`}
                </Alert>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Subtotal:</Typography>
                <Typography variant="subtitle1">${total.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Shipping:</Typography>
                <Typography variant="subtitle1">${appliedCoupon?.freeShipping ? '0.00' : '10.00'}</Typography>
              </Box>
              {appliedCoupon && appliedCoupon.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, color: 'error.main' }}>
                  <Typography variant="subtitle1">Discount:</Typography>
                  <Typography variant="subtitle1">-${appliedCoupon.discount.toFixed(2)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, color: 'success.main' }}>
                <Typography variant="subtitle1">Points Earned:</Typography>
                <Typography variant="subtitle1">{pointsEarned}</Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${(appliedCoupon ? total + (appliedCoupon.freeShipping ? 0 : 10) - appliedCoupon.discount : total + 10).toFixed(2)}</Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleCheckout}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Processing...' : `Place Order - $${(appliedCoupon ? total + (appliedCoupon.freeShipping ? 0 : 10) - appliedCoupon.discount : total + 10).toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;

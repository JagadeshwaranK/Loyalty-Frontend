import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getProducts } from '../services/api';
import { useCart } from '../contexts/CartContext';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

  const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pointsRate, setPointsRate] = useState(1);
    const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchProducts();
    fetchPointsRate();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Armor Products
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image || 'https://via.placeholder.com/300x200/1976d2/ffffff?text=Armor+Product'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price}
                </Typography>
                <Typography variant="body2" color="success.main">
                  Earn {Math.floor(product.price * pointsRate)} points
                </Typography>
                {product.stock > 0 ? (
                  <>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2, mb: 1 }}
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                      onClick={() => {
                        addToCart(product);
                        navigate('/checkout');
                      }}
                    >
                      Buy Now
                    </Button>
                  </>
                ) : (
                  <Button variant="outlined" fullWidth disabled sx={{ mt: 2 }}>
                    Out of Stock
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredProducts.length === 0 && !loading && (
          <Grid item xs={12}>
            <Typography variant="h6" align="center" color="text.secondary">
              No products found matching your search.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProductList;

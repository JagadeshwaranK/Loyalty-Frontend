




import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Menu as MenuIcon,
  AccountCircle as AccountIcon,
  LocalShipping as ShippingIcon,
  Security as SecureIcon,
  Verified as VerifiedIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await getProducts();
        // Take first 4 products as featured
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url('https://via.placeholder.com/1920x600/000/fff?text=Premium+Armor+Products')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Premium Armor Products
          </Typography>
          <Typography variant="h5" sx={{ mb: 3 }}>
            High-quality protective gear for ultimate safety
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/products')}>
            Shop Now
          </Button>
        </Container>
      </Box>

      {/* Featured Collections */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6 }}>
          Our Collections
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { icon: <FavoriteIcon sx={{ fontSize: 64 }} />, title: 'Body Armor', desc: 'Protective vests and plates' },
            { icon: <ShippingIcon sx={{ fontSize: 64 }} />, title: 'Helmets', desc: 'Advanced head protection' },
            { icon: <SecureIcon sx={{ fontSize: 64 }} />, title: 'Shields', desc: 'Riot and tactical shields' },
            { icon: <VerifiedIcon sx={{ fontSize: 64 }} />, title: 'Accessories', desc: 'Gloves and gear' }
          ].map((collection, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                {collection.icon}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {collection.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {collection.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Container sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6 }}>
          Our Featured Products
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image || 'https://via.placeholder.com/300x200/1976d2/fff?text=Armor+Product'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description?.substring(0, 100)}...
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                    ${product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/products')}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {featuredProducts.length === 0 && (
          <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            No featured products available. Check back soon!
          </Typography>
        )}
      </Container>

      {/* Trust Badges */}
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {[
            { icon: <ShippingIcon sx={{ fontSize: 48 }} />, text: 'Worldwide Shipping' },
            { icon: <SecureIcon sx={{ fontSize: 48 }} />, text: 'Secure Payment' },
            { icon: <VerifiedIcon sx={{ fontSize: 48 }} />, text: 'Quality Guaranteed' },
            { icon: <FavoriteIcon sx={{ fontSize: 48 }} />, text: 'Customer Support' }
          ].map((badge, index) => (
            <Grid item xs={6} sm={3} key={index} sx={{ textAlign: 'center' }}>
              {badge.icon}
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
                {badge.text}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Promo Banner */}
      <Box sx={{ backgroundColor: '#ff0000', color: 'white', py: 4, textAlign: 'center' }}>
        <Container>
          <Typography variant="h5" gutterBottom>
            Up to 50% OFF on All Armor Products!
          </Typography>
          <Button variant="outlined" color="inherit" size="large" onClick={() => navigate('/products')}>
            Shop Sale
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#000', color: 'white', py: 6 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                ARMOR X
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Premium protective gear for safety and security.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton color="inherit"><FavoriteIcon /></IconButton>
                <IconButton color="inherit"><VerifiedIcon /></IconButton>
                <IconButton color="inherit"><ShippingIcon /></IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <List>
                <ListItem button component={Link} to="/products">
                  <ListItemText primary="Products" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="About" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="Contact" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="Privacy Policy" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="FAQ" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Shipping" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Returns" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Orders" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Newsletter
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Subscribe for updates and offers.
              </Typography>
              <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Your email" />
                <Divider sx={{ mx: 0.5 }} orientation="vertical" />
                <Button type="submit" sx={{ p: '10px' }}>Subscribe</Button>
              </Paper>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, backgroundColor: 'grey.800' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              © 2024 Armor X. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;

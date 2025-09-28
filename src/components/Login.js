import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, setAuthToken } from '../services/api';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  Paper,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginUser({ username, password });
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setAuthToken(access);

      onLogin(access);  // Pass access token to parent App for decoding role

      navigate('/');  // Redirect to home after login

    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #dc004e 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={10}
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          borderRadius: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Sign in to your Armor E-Commerce account
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Sign In
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Don't have an account? Sign up
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;

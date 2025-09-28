import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/api';
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await registerUser({ username, email, password, tier: 'Bronze', points: 0 });
      setSuccess('Account created successfully! Please log in.');
      // Optionally, redirect to login or auto-login
    } catch (err) {
      setError(err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || err.response?.data?.non_field_errors?.[0] || 'Registration failed');
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
            <AccountCircleIcon />
          </Avatar>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Join Armor E-Commerce and start earning loyalty points
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
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Sign Up
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Already have an account? Sign in
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;

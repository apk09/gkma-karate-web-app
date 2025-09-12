import React, { useState } from 'react';
import { users } from '../secret';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const found = users.find(
      (u) => u.username === values.username && u.password === values.password
    );
    if (found) {
      setError('');
      if (onLogin) onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #232526 0%, #414345 100%)',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: {
            xs: '100%',
            sm: '80%',
            md: '60%',
            lg: '40%',
            xl: '30%'
          },
          maxWidth: 500,
          mx: 'auto',
          p: { xs: 3, sm: 6 },
          borderRadius: 5,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          background: 'rgba(255,255,255,0.95)',
        }}
      >
        <Typography
          align="center"
          gutterBottom
          sx={{
            mb: 3,
            fontFamily: 'Oswald, Arial, sans-serif',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          <Box component="span" sx={{
            display: 'block',
            fontWeight: 500,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            color: '#555',
            letterSpacing: 1,
          }}>
            Welcome to
          </Box>
          <Box component="span" sx={{
            display: 'block',
            fontWeight: 900,
            fontSize: { xs: '2.1rem', sm: '2.7rem', md: '3.2rem', lg: '3.7rem', xl: '4.2rem' },
            color: 'primary.main',
            letterSpacing: 2,
            textShadow: '0 2px 8px rgba(102,126,234,0.12)',
          }}>
            GKMA Karate
          </Box>
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ color: '#555', mb: 4 }}
        >
          Please login to your account
        </Typography>
        <Box component="form" onSubmit={handleLogin}>
          {error && (
            <Typography color="error" sx={{ mb: 2, fontWeight: 500 }}>
              {error}
            </Typography>
          )}
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={values.username}
            onChange={handleChange('username')}
            required
            sx={{ mb: 2 }}
            InputProps={{
              sx: { background: '#f5f7fa', borderRadius: 2 },
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={handleChange('password')}
            required
            sx={{ mb: 3 }}
            InputProps={{
              sx: { background: '#f5f7fa', borderRadius: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1.15rem',
              borderRadius: 2,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px 0 rgba(118,75,162,0.15)',
              textTransform: 'none',
              letterSpacing: 1,
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;

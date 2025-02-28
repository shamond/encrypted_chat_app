// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

function Login() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [message, setMessage]     = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        email,
        password,
      });
      const { access_token, user_id } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', user_id);
      navigate('/chat');
    } catch (error) {
      // Obsługa błędu 401
      if (error.response && error.response.status === 401) {
        setMessage("Nieprawidłowy email lub hasło");
      } else {
        setMessage("Wystąpił błąd podczas logowania");
      }
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Logowanie
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Zaloguj się
          </Button>
          {message && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Nie masz konta? <Link to="/register">Zarejestruj się</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;

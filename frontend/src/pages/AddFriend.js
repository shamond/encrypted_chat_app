// src/components/AddFriend.js
import React, { useState, useRef, useEffect } from 'react';
import { Container, Box, Typography, TextField, List, ListItem, ListItemText, Button, ListItemAvatar, Avatar, Divider } from '@mui/material';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function AddFriend() {
  // Stan wyszukiwania i wyników z backendu
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  // Lista znajomych, która będzie zaciągana z bazy po dodaniu nowego znajomego
  const [friendList, setFriendList] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const boxRef = useRef(null);
const userId = localStorage.getItem('user_id');
  // Obsługa kliknięcia poza kontenerem – powrót do /chat
  useEffect(() => {
    function handleClickOutside(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        navigate('/chat');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  // Wyszukiwanie użytkowników po frazie – wywołujemy endpoint GET /friends/search
  useEffect(() => {
    if (search.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    axios.get(`http://localhost:8000/friends/search?search=${encodeURIComponent(search)}`)
      .then(response => {
        // Backend zwraca listę użytkowników z polami: id, username, avatar
        setSearchResults(response.data);
      })
      .catch(error => {
        console.error('Błąd pobierania użytkowników:', error);
      });
  }, [search]);

  // Funkcja dodająca przyjaciela – wywołuje endpoint POST /friends/add
  const handleAddFriend = (user) => {
    // Sprawdzenie, czy użytkownik już jest dodany
    if (friendList.some(f => f.id === user.id)) {
      setMessage(`Użytkownik ${user.username} już jest dodany`);
      return;
    }
    // Wywołanie endpointu POST, przesyłamy tylko pole username
    const userId = localStorage.getItem('user_id');
    axios.post('http://localhost:8000/friends/add', { username: user.username }, { params: { user_id: userId } })
      .then(response => {
        // Otrzymujemy pełny obiekt dodanego znajomego (z bazy)
        const newFriend = {
          id: response.data.id,
          username: response.data.username,
          avatar: response.data.avatar || `https://via.placeholder.com/40?text=${response.data.username.charAt(0)}`
        };
        setFriendList(prev => [...prev, newFriend]);
        setMessage(`Dodano ${newFriend.username} jako znajomego!`);
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          setMessage(error.response.data.detail || 'Użytkownik już jest dodany');
        } else {
          setMessage('Wystąpił błąd podczas dodawania znajomego');
        }
        console.error(error);
      });
  };

  return (
    <Container maxWidth="sm">
      <Box ref={boxRef} sx={{ mt: 8, p: 4, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dodaj Znajomego
        </Typography>
        {message && (
          <Typography variant="body1" color="error" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}
        <TextField
          fullWidth
          variant="outlined"
          label="Szukaj użytkowników"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <List>
          {searchResults.map(user => (
            <React.Fragment key={user.id}>
              <ListItem
                secondaryAction={
                  <Button variant="contained" onClick={() => handleAddFriend(user)}>
                    Dodaj
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar} alt={user.username}>
                    {user.username.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
        {friendList.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Twoi Znajomi:</Typography>
            <List>
              {friendList.map(friend => (
                <ListItem key={friend.id}>
                  <ListItemAvatar>
                    <Avatar src={friend.avatar} alt={friend.username}>
                      {friend.username.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={friend.username} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default AddFriend;

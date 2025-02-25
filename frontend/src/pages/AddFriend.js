// src/pages/AddFriend.js
import React, { useState,useRef,useEffect } from 'react';
import { Container, Box, Typography, TextField, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

const users = [
  { id: 1, name: 'Marek Nowicki' },
  { id: 2, name: 'Kasia Kowalska' },
  { id: 3, name: 'Piotr Wiśniewski' },
  { id: 4, name: 'Anna Nowak' }
];

function AddFriend() {
  const [search, setSearch] = useState('');
  const [friendList, setFriendList] = useState([]);
  const navigate = useNavigate();

  const boxRef = useRef(null);
    useEffect(() => {
    function handleClickOutside(event) {
      // Jeśli kliknięto poza boxRef (czyli nasz kontener), przechodzimy do /chat
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        navigate('/chat');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);





  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFriend = (user) => {
    if (!friendList.some(f => f.id === user.id)) {
      setFriendList([...friendList, user]);
      alert(`Dodano ${user.name} jako znajomego!`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
          ref={boxRef}
          sx={{ mt: 8, p: 4, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dodaj Znajomego
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Szukaj użytkowników"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <List>
          {filteredUsers.map(user => (
            <ListItem
              key={user.id}
              secondaryAction={
                <Button variant="contained" onClick={() => handleAddFriend(user)}>
                  Dodaj
                </Button>
              }
            >
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List>
        {friendList.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Twoi Znajomi:</Typography>
            <List>
              {friendList.map(friend => (
                <ListItem key={friend.id}>
                  <ListItemText primary={friend.name} />
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

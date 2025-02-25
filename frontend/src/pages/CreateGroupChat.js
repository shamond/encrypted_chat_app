// src/pages/CreateGroupChat.js
import React, { useRef, useEffect, useState } from 'react';
import { Container, Box, Typography, TextField, List, ListItem, ListItemAvatar, ListItemText, Avatar, Checkbox, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const potentialFriends = [
  { id: 1, name: 'Marek Nowicki', avatar: 'https://via.placeholder.com/40' },
  { id: 2, name: 'Kasia Kowalska', avatar: 'https://via.placeholder.com/40' },
  { id: 3, name: 'Piotr Wiśniewski', avatar: 'https://via.placeholder.com/40' },
  { id: 4, name: 'Anna Nowak', avatar: 'https://via.placeholder.com/40' }
];

function CreateGroupChat() {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const navigate = useNavigate();

  // 1. Tworzymy referencję do „czerwonego kwadratu”
  const boxRef = useRef(null);

  // 2. Nasłuchujemy kliknięcia w całym dokumencie
  useEffect(() => {
    function handleClickOutside(event) {
      // Jeśli kliknięto poza boxRef (nasz kontener), przechodzimy do /chat
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        navigate('/chat');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const handleToggle = (id) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(friendId => friendId !== id) : [...prev, id]
    );
  };

  const handleCreateGroupChat = () => {
    // Na potrzeby demonstracji wypisujemy dane do konsoli
    console.log('Creating group chat:', groupName, selectedFriends);
    // Tutaj możesz wysłać dane do backendu
    navigate('/chat');
  };

  return (
    <Container maxWidth="sm">
      <Box
        ref={boxRef}
        sx={{ mt: 8, p: 4, boxShadow: 3}}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Create Group Chat
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" gutterBottom>
          Select Participants:
        </Typography>
        <List>
          {potentialFriends.map((user) => (
            <ListItem key={user.id} button onClick={() => handleToggle(user.id)}>
              <ListItemAvatar>
                <Avatar src={user.avatar} alt={user.name} />
              </ListItemAvatar>
              <ListItemText primary={user.name} />
              <Checkbox checked={selectedFriends.includes(user.id)} />
            </ListItem>
          ))}
        </List>
        <Button variant="contained" fullWidth onClick={handleCreateGroupChat} sx={{ mt: 2 }}>
          Create Group Chat
        </Button>
      </Box>
    </Container>
  );
}

export default CreateGroupChat;

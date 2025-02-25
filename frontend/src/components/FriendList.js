// src/components/FriendList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, TextField } from '@mui/material';

function FriendList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState([]);
  const userId = 1; // W praktyce pobierz ID aktualnie zalogowanego użytkownika

  useEffect(() => {
    axios.get(`http://localhost:8000/friends?user_id=${userId}`)
      .then(response => {
        setFriends(response.data);
      })
      .catch(error => {
        console.error('Błąd pobierania znajomych:', error);
      });
  }, [userId]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
        borderLeft: '1px solid #ccc',
        height: '100vh',
        overflowY: 'auto'
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
            Znajomi
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Szukaj..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ p: 2 }}
      />
      <List>
        {friends.map(friend => (
          <React.Fragment key={friend.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={friend.avatar} alt={friend.username}>
                  {friend.username.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={friend.username} />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default FriendList;

// src/components/FriendList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, TextField } from '@mui/material';

function FriendList({ onSelectFriend }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState([]);
  const currentUserId = parseInt(localStorage.getItem('user_id'), 10);

  useEffect(() => {
    axios.get(`http://localhost:8000/friends?user_id=${currentUserId}`)
      .then(response => {
        setFriends(response.data);
      })
      .catch(error => {
        console.error('Error from getting friends', error);
      });
  }, [currentUserId]);

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase()) && friend.id !== currentUserId
  );

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
        Twoi Znajomi
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
        {filteredFriends.map(friend => (
          <React.Fragment key={friend.id}>
            <ListItem button onClick={() => onSelectFriend(friend)}>
              <ListItemAvatar>
                <Avatar src={friend.avatar} alt={friend.username}>
                  {friend.username.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={friend.username} secondary={friend.online ? "Online" : "Offline"} />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default FriendList;

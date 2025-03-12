// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';

function Sidebar({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const currentUserId = parseInt(localStorage.getItem('user_id'), 10);

  // Funkcja pobierająca konwersacje
  const fetchConversations = () => {
    axios.get(`http://localhost:8000/conversations?user_id=${currentUserId}`)
      .then(response => {
        setConversations(response.data);
      })
      .catch(error => {
        console.error('Błąd pobierania konwersacji:', error);
      });
  };

  useEffect(() => {
    fetchConversations();
    // Opcjonalnie: ustawić interwał odświeżający listę konwersacji co kilka sekund
  }, [currentUserId]);

  return (
    <Box sx={{ width: 300, borderRight: '1px solid #ccc', height: '100vh', overflowY: 'auto' }}>
      <Typography variant="h6" sx={{ p: 2 }}>Konwersacje</Typography>
      <List>
        {conversations.map(conv => (
          <ListItem button key={conv.id} onClick={() => onSelectConversation(conv)}>
            <ListItemText
              primary={conv.name ? conv.name : conv.participants.map(p => p.username).join(', ')}
              secondary={`Ostatnia aktywność: ${new Date(conv.last_updated).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;

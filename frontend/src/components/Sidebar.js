// src/components/Sidebar.js
import React, { useState } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, TextField } from '@mui/material';

function Sidebar({ conversations = [], onSelectConversation }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Funkcja pomocnicza do pobierania tytułu rozmowy
  const getConversationTitle = (conv) => {
    if (conv.groupName) return conv.groupName;
    if (conv.name) return conv.name;
    return conv.participants?.map(user => user.name).join(', ') || 'Brak tytułu';
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationTitle(conv).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
        borderRight: '1px solid #ccc',
        height: '100vh',
        overflowY: 'auto'
      }}
    >
      <Typography variant="h6" sx={{ p: 2 }}>
        Conversations
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ p: 2 }}
      />
      <List>
        {filteredConversations.map(conv => (
          <ListItem key={conv.id} button onClick={() => onSelectConversation(conv.id)}>
            <ListItemAvatar>
              <Avatar
                src={
                  conv.participants && conv.participants[0]
                    ? conv.participants[0].avatar
                    : conv.avatar
                }
                alt={getConversationTitle(conv)}
              />
            </ListItemAvatar>
            <ListItemText
              primary={getConversationTitle(conv)}
              secondary={
                conv.messages && conv.messages.length > 0
                  ? conv.messages[conv.messages.length - 1].text
                  : ''
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;

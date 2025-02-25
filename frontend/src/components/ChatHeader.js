// src/components/ChatHeader.js
import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Stack, Menu, MenuItem } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

function ChatHeader({ conversation }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Używamy operatora optional chaining – jeśli conversation.participants nie istnieje, ustawiamy pustą tablicę.
  const participants = conversation?.participants || [];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddFriend = () => {
    navigate('/add-friend');
    handleMenuClose();
  };

  const handleCreateGroup = () => {
    navigate('/create-group-chat');
    handleMenuClose();
  };

  if (!conversation) return null;

  // Zamiast conversation.participants.slice(0, 3), używamy naszej zmiennej participants.
  const participantAvatars = participants.slice(0, 3);

  const title = conversation?.groupName || (
    participants.length > 0
      ? participants.map((p) => p.name).join(', ')
      : "Brak rozmowy"
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #ccc' }}>
      <Stack direction="row" spacing={1}>
        {participantAvatars.map(user => (
          <Avatar key={user.id} src={user.avatar} alt={user.name} />
        ))}
      </Stack>
      <Box sx={{ ml: 2, flex: 1 }}>
        <Typography variant="h6">
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {conversation.online ? 'Online' : 'Offline'}
        </Typography>
      </Box>
      <IconButton aria-label="video call">
        <VideoCallIcon />
      </IconButton>
      <IconButton aria-label="more options">
        <MoreVertIcon />
      </IconButton>
      <IconButton aria-label="add options" onClick={handleMenuOpen}>
        <AddIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleAddFriend}>Add Friend</MenuItem>
        <MenuItem onClick={handleCreateGroup}>Create Group</MenuItem>
      </Menu>
    </Box>
  );
}

export default ChatHeader;

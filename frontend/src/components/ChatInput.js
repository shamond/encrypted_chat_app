// src/components/ChatInput.js
import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() !== '') {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <TextField
        fullWidth
        placeholder="Wpisz wiadomość..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        multiline
        maxRows={4}
      />
      <Button variant="contained" onClick={handleSend} sx={{ ml: 1 }}>
        Wyślij
      </Button>
    </Box>
  );
}

export default ChatInput;

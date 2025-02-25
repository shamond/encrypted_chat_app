// src/components/ChatMessage.js
import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

function ChatMessage({ id, text, author, timestamp, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(id, editText);
    setIsEditing(false);
  };

  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: author === 'Ty' ? '#e3f2fd' : '#f5f5f5',
        p: 1,
        borderRadius: 1
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
          {author}:
        </Typography>
        {isEditing ? (
          <TextField
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            size="small"
            sx={{ ml: 1 }}
          />
        ) : (
          <Typography variant="body1" component="span" sx={{ ml: 1 }}>
            {text}
          </Typography>
        )}
        {timestamp && (
          <Typography variant="caption" display="block">
            {timestamp}
          </Typography>
        )}
      </Box>
      {author === 'Ty' && (
        <Box>
          {isEditing ? (
            <IconButton onClick={handleSave} size="small" aria-label="Zapisz">
              <CheckIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton onClick={handleEdit} size="small" aria-label="Edytuj">
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton onClick={() => onDelete(id)} size="small" aria-label="Usuń">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

export default ChatMessage;


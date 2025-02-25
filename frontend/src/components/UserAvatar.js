// src/components/UserAvatar.js
import React from 'react';
import { Avatar } from '@mui/material';

function UserAvatar({ src, alt, size = 40 }) {
  return <Avatar src={src} alt={alt} sx={{ width: size, height: size }} />;
}

export default UserAvatar;

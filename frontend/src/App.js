// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AddFriend from './pages/AddFriend';
import CreateGroupChat from './pages/CreateGroupChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/add-friend" element={<AddFriend />} />
        <Route path="/create-group-chat" element={<CreateGroupChat />} />
      </Routes>
    </Router>
  );
}

export default App;

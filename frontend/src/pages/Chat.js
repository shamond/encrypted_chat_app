// src/pages/Chat.js
import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import FriendList from '../components/FriendList';
import axios from 'axios';

function Chat() {
  // Inicjalizacja rozmów jako pustej tablicy
  const [conversations, setConversations] = useState([]);
  // Dla uproszczenia ustawiamy wybraną rozmowę jako pierwszą (lub stałe id = 1)
  const selectedConversationId = 1;
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  // Pobieranie wiadomości z backendu
  useEffect(() => {
    axios.get('http://localhost:8000/chat/messages')
      .then(response => {
        // Filtrujemy wiadomości dla wybranej rozmowy
        const convMessages = response.data.filter(
          (msg) => msg.conversation_id === selectedConversationId
        );
        const mapped = convMessages.map(msg => ({
          id: msg.id,
          text: msg.content,
          author: msg.user_id, // Możesz rozbudować, aby pobrać nazwę użytkownika
          timestamp: new Date(msg.timestamp).toLocaleTimeString()
        }));
        setMessages(mapped);
      })
      .catch(error => {
        console.error("Błąd pobierania wiadomości:", error);
      });
  }, [selectedConversationId]);

  // Automatyczne scrollowanie do ostatniej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicjalizacja połączenia WebSocket
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/chat/ws');
    socket.onopen = () => {
      console.log('WebSocket połączony');
    };
    socket.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.conversation_id === selectedConversationId) {
          setMessages(prev => [
            ...prev,
            {
              id: messageData.id || Date.now(),
              text: messageData.content,
              author: messageData.user_id,
              timestamp: new Date(messageData.timestamp).toLocaleTimeString()
            }
          ]);
        }
      } catch (error) {
        console.error("Błąd parsowania wiadomości z WebSocket:", error);
      }
    };
    socket.onerror = (error) => {
      console.error("Błąd WebSocket:", error);
    };
    socket.onclose = () => {
      console.log('WebSocket zamknięty');
    };

    setWs(socket);
    return () => {
      socket.close();
    };
  }, [selectedConversationId]);

  // Funkcja wysyłająca wiadomość przez WebSocket
  const handleSendMessage = (newMessage) => {
    // Przyjmujemy, że aktualny użytkownik ma user_id = 1
    const messageObject = {
      content: newMessage,
      user_id: 1,
      conversation_id: selectedConversationId,
      timestamp: new Date().toISOString()
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageObject));
    } else {
      console.error("WebSocket nie jest połączony");
    }

    // Aktualizacja lokalnego stanu dla natychmiastowego feedbacku
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: newMessage,
        author: 1,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Przekazujemy conversations jako prop, zabezpieczając się przed undefined */}
      <Sidebar conversations={conversations || []} onSelectConversation={() => {}} />
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 0 }}>
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ChatHeader conversation={{ id: selectedConversationId, groupName: 'Projekt Zespołowy' }} />
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, background: '#fafafa' }}>
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                text={msg.text}
                author={msg.author}
                timestamp={msg.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 2 }}>
            <ChatInput onSend={handleSendMessage} />
          </Box>
        </Paper>
      </Container>
      <FriendList> </FriendList>
    </Box>
  );
}

export default Chat;

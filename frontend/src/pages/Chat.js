import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import FriendList from '../components/FriendList';
import axios from 'axios';

function Chat() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const currentUserId = parseInt(localStorage.getItem('user_id'), 10);
    const token = localStorage.getItem('token');

     useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (!token) {
            console.error("Brak tokena, nie otwieram WebSocket!");
            return;
        }

        if (ws) {
            console.log("WebSocket już istnieje, nie tworzymy nowego.");
            return;
        }

        let socket = new WebSocket(`ws://localhost:8000/chat/ws?token=${token}`);

        socket.onopen = () => {
            console.log('WebSocket połączony');
            setWs(socket);
            setWsConnected(true);

            if (selectedConversation?.id) {
                socket.send(JSON.stringify({
                    type: "join",
                    conversation_id: selectedConversation.id
                }));
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Otrzymano wiadomość WebSocket:", data);

                if (data.type === "history") {
                    setMessages(data.messages.map((m) => ({
                        id: m.id,
                        text: m.text,
                        author: m.user_id,
                        timestamp: new Date(m.timestamp).toLocaleTimeString(),
                    })));
                } else if (data.type === "message") {
                    setMessages(prevMessages => [
                        ...prevMessages,
                        {
                            id: data.id,
                            text: data.text,
                            author: data.user_id,
                            timestamp: new Date(data.timestamp).toLocaleTimeString(),
                        }
                    ]);
                }
            } catch (error) {
                console.error("Błąd parsowania wiadomości z WebSocket:", error);
            }
        };

        socket.onclose = (event) => {
            console.log("WebSocket zamknięty", event);
            setWsConnected(false);
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [token]);

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        setSelectedConversation(null);
        setMessages([]);

        axios.get(`http://localhost:8000/conversations/private`, {
            params: { user1: currentUserId, user2: friend.id }
        })
        .then(response => {
            if (response.data && response.data.id) {
                setSelectedConversation(response.data);
                if (ws && wsConnected) {
                    ws.send(JSON.stringify({
                        type: "join",
                        conversation_id: response.data.id
                    }));
                }
            }
        })
        .catch(error => console.error("Błąd pobierania konwersacji:", error));
    };

    const handleSendMessage = (newMessage) => {
        if (!selectedConversation) return;
        if (ws && wsConnected) {
            ws.send(JSON.stringify({
                type: "message",
                text: newMessage,
                conversation_id: selectedConversation.id,
                timestamp: new Date().toISOString()
            }));
        } else {
            axios.post(`http://localhost:8000/chat/messages`, {
                user_id: currentUserId,
                conversation_id: selectedConversation.id,
                content: newMessage,
                timestamp: new Date().toISOString()
            })
            .then(response => {
                setMessages(prev => [
                    ...prev,
                    { id: Date.now(), text: newMessage, author: currentUserId, timestamp: new Date().toLocaleTimeString() }
                ]);
            })
            .catch(error => console.error("Błąd wysyłania wiadomości:", error));
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar onSelectConversation={(conv) => setSelectedConversation(conv)} />
            <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 0 }}>
                {selectedConversation ? (
                    <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <ChatHeader conversation={selectedConversation} wsStatus={wsConnected ? "Połączony" : "Rozłączony"} />
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, background: '#fafafa' }}>
                            {messages.map(msg => (
                                <ChatMessage key={msg.id} id={msg.id} text={msg.text} author={msg.author} timestamp={msg.timestamp} />
                            ))}
                            <div ref={messagesEndRef} />
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <ChatInput onSend={handleSendMessage} disabled={!selectedConversation} />
                        </Box>
                    </Paper>
                ) : (
                    <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6">Wybierz konwersację</Typography>
                    </Paper>
                )}
            </Container>
            <FriendList onSelectFriend={handleSelectFriend} />
        </Box>
    );
}

export default Chat;
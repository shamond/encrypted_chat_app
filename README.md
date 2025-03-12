<<<<<<< HEAD
Encrypted Chat App

[This project is still in development]

Introduction

Welcome! If you're reading this, you're probably interested in my profile as a potential recruiter. This project is an encrypted chat application designed to provide secure communication.

Tech Stack

JavaScript

Python

ReactJS

FastAPI

WebSocket

Cryptography

Project Features

Frontend

Login Page

Create Account Page

Main Chat Page

Chat Header: Includes buttons for adding friends, live streaming, and settings.

Chat Messages: Displays messages between users.

Sidebar: Shows your active conversations.

Friend List: Displays a list of your friends.

Add Friends Page: Search and add friends from the database.

Group Chat Support: Invite participants to group conversations.

Backend

Structure

=======
# Encrypted Chat App

**[This project is still in development]**

## Introduction
Welcome! If you're reading this, you're probably interested in my profile as a potential recruiter. This project is an encrypted chat application designed to provide secure communication.

## Tech Stack
- **JavaScript**
- **Python**
- **ReactJS**
- **FastAPI**
- **WebSocket**
- **Cryptography**

## Project Features
### Frontend
1. **Login Page**
2. **Create Account Page**
3. **Main Chat Page**
   - **Chat Header**: Includes buttons for adding friends, live streaming, and settings.
   - **Chat Messages**: Displays messages between users.
   - **Sidebar**: Shows your active conversations.
   - **Friend List**: Displays a list of your friends.
4. **Add Friends Page**: Search and add friends from the database.
5. **Group Chat Support**: Invite participants to group conversations.

### Backend
#### Structure
```
>>>>>>> a385a1d (added conversation between users)
app/
  core/
    config.py       # Loads environment variables
    security.py     # Creates and verifies session tokens
  db/
    base.py         # Base database setup
    session.py      # Database session handling
  routers/         # API Endpoints
    auth.py         # Authentication
    chat.py         # Chat functionality
    conversation.py # Conversations management
    friends.py      # Friend search and management
    groups.py       # Group chat management
    users.py        # User management
  models.py         # Database models
<<<<<<< HEAD

API Endpoints

Authentication (auth.py)

Hashes and verifies passwords

Creates and decodes access tokens

Handles user login and registration

Chat (chat.py)

Implements ConnectionManager for WebSocket connections

Defines the message model

Endpoints for sending and storing messages

Conversations (conversation.py)

Models for participants and conversations

Endpoints for retrieving and creating conversations

Friends (friends.py)

Search and manage friends

Groups (groups.py)

Group chat functionality (in progress)

Users (users.py)

User-related endpoints

Future Plans (TODO)

Live streaming support

Encrypted voice/video streaming

End-to-end encrypted text messaging

Support for group messaging
=======
```

#### API Endpoints
- **Authentication (auth.py)**
  - Hashes and verifies passwords
  - Creates and decodes access tokens
  - Handles user login and registration
- **Chat (chat.py)**
  - Implements `ConnectionManager` for WebSocket connections
  - Defines the message model
  - Endpoints for sending and storing messages
- **Conversations (conversation.py)**
  - Models for participants and conversations
  - Endpoints for retrieving and creating conversations
- **Friends (friends.py)**
  - Search and manage friends
- **Groups (groups.py)**
  - Group chat functionality (in progress)
- **Users (users.py)**
  - User-related endpoints

## Future Plans (TODO)
- **Live streaming support**
- **Encrypted voice/video streaming**
- **End-to-end encrypted text messaging**
- **Support for group messaging**

---
If you're interested in this project, feel free to contribute or reach out! 🚀
>>>>>>> a385a1d (added conversation between users)

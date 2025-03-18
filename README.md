# encrypted_chat_app
[this project isn't complete right now]
hi, if you are here. you're interesing my profile to my future recutier

Stack:
1.JavaScript
2.Python
3.reactJS
4.FastAPI
5.websocket
6.cryptography

project requirements:
[frontend]
1.login panel - page
2.create account - page
3.chat - MAIN page
3a.compontnets
-chatHeader with buttons (add friend, live stream, settings)
-chatMessage - display your and your strange friend messages
-sidebar display your conversation
-friendList - display your friends
4.addFriends- page and searching from database
5.add group chat- you can invite participate
[backend]
structure
-app
  -core
    --config.py loads data from env file
    --security.py creating token to session and verifing token 
-db 
    --base.py
    --session.py 
-routers [endpoints]
    --auth.py 
    1.hash password
    2.verify password
    3. creating access token
    4. decode access token
    5. getting db from session
    6. model data to login && registration && token
    7. creating access token
    --chat.py
    1. implements ConnectionManager (connecting and broadcasting messages)
    2. implements message model
    3. endpoint to post messages & save in db
    4. endpoint to websocket
    --conversation.py
    
    --friends.py
    --groups.py
    --users.py
-models.py








TODO in future:
posibillity to talking on live stream
cipher stream
cipheres text message
group messaging support
[backend]
1.




4.add friends -
3.information about users in database
4.hashing passwords to store database
5.

use project





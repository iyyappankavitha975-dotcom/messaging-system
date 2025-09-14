// DOM elements
        const authView = document.getElementById('auth-view');
        const chatView = document.getElementById('chat-view');
        const authTitle = document.getElementById('auth-title');
        const authBtn = document.getElementById('auth-btn');
        const authToggleLink = document.getElementById('auth-toggle-link');
        const authToggleText = document.getElementById('auth-toggle-text');
        const registerFields = document.getElementById('register-fields');
        const chatWindow = document.getElementById('chat-window');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const userList = document.getElementById('user-list');
        
        // App state
        let isLoginMode = true;
        let currentUser = null;
        let socket = null;
        let users = [];
        let messages = [];
        
        // Initialize the app
        function init() {
            // Set up event listeners
            authBtn.addEventListener('click', handleAuth);
            authToggleLink.addEventListener('click', toggleAuthMode);
            sendBtn.addEventListener('click', sendMessage);
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Render initial users
            renderUsers();
        }
        
        // Toggle between login and register modes
        function toggleAuthMode() {
            isLoginMode = !isLoginMode;
            
            if (isLoginMode) {
                authTitle.textContent = 'Login to your account';
                authBtn.textContent = 'Login';
                authToggleText.innerHTML = 'Don\'t have an account? <a id="auth-toggle-link">Register</a>';
                registerFields.style.display = 'none';
            } else {
                authTitle.textContent = 'Create an account';
                authBtn.textContent = 'Register';
                authToggleText.innerHTML = 'Already have an account? <a id="auth-toggle-link">Login</a>';
                registerFields.style.display = 'block';
            }
            
            // Re-attach event listener to the new link
            document.getElementById('auth-toggle-link').addEventListener('click', toggleAuthMode);
        }
        
        // Handle authentication (login/register)
        function handleAuth() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            // For this demo we'll skip actual authentication
            currentUser = { username };
            
            // Connect to WebSocket server
            const wsUrl = window.location.hostname === 'localhost' 
                ? 'ws://localhost:8080' 
                : 'wss://your-deployed-websocket-server.com'; // Replace with your actual WebSocket server URL
            socket = new WebSocket(wsUrl);
            
            socket.onopen = () => {
                // Send login message
                socket.send(JSON.stringify({
                    type: 'login',
                    username: currentUser.username
                }));
                
                showChatView();
            };
            
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                switch(data.type) {
                    case 'users':
                        users = data.users;
                        renderUsers();
                        break;
                        
                    case 'chat':
                        messages.push(data);
                        renderMessages();
                        break;
                }
            };
            
            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                alert('Failed to connect to chat server');
            };
        }
        
        // Show chat view after successful authentication
        function showChatView() {
            authView.style.display = 'none';
            chatView.style.display = 'block';
            
            // Render existing messages
            renderMessages();
            
            // Simulate WebSocket connection
            simulateWebSocket();
        }
        
        // Render messages in the chat window
        function renderMessages() {
            chatWindow.innerHTML = '';
            
            messages.forEach(message => {
                const isCurrentUser = message.sender === currentUser.username;
                const messageEl = document.createElement('div');
                messageEl.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
                
                if (!isCurrentUser) {
                    const senderEl = document.createElement('div');
                    senderEl.className = 'message-sender';
                    senderEl.textContent = message.sender;
                    messageEl.appendChild(senderEl);
                }
                
                const textEl = document.createElement('div');
                textEl.className = 'message-text';
                textEl.textContent = message.text;
                messageEl.appendChild(textEl);
                
                const timeEl = document.createElement('div');
                timeEl.className = 'message-time';
                timeEl.textContent = message.time;
                messageEl.appendChild(timeEl);
                
                chatWindow.appendChild(messageEl);
            });
            
            // Scroll to bottom
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
        
        // Render users in the sidebar
        function renderUsers() {
            userList.innerHTML = '';
            
            users.forEach(user => {
                const userEl = document.createElement('li');
                userEl.className = 'user-item';
                
                userEl.innerHTML = `
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <div class="user-info">
                        <div class="user-name">${user.username}</div>
                        <div class="user-status">
                            <span class="status-indicator ${user.online ? 'online' : 'offline'}"></span>
                            ${user.online ? 'Online' : 'Offline'}
                        </div>
                    </div>
                `;
                
                userList.appendChild(userEl);
            });
        }
        
        // Send a new message
        function sendMessage() {
            const text = messageInput.value.trim();
            
            if (!text) return;
            
            // Send message through WebSocket
            socket.send(JSON.stringify({
                type: 'message',
                sender: currentUser.username,
                text: text
            }));
            
            // Clear input
            messageInput.value = '';
        }

        // Placeholder for future WebSocket-related functions
        function simulateWebSocket() {
            // Real WebSocket implementation now handles this functionality
        }

        window.addEventListener('load', init);
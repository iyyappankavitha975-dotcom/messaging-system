try {
    var WebSocket = require('ws');
} catch (error) {
    console.error('WebSocket package not found. Please run "npm install" first.');
    process.exit(1);
}

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

const clients = new Map();

server.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch(data.type) {
                case 'login':
                    clients.set(data.username, ws);
                    broadcastUserList();
                    console.log(`User ${data.username} logged in`);
                    break;
                    
                case 'message':
                    broadcastMessage(data);
                    console.log(`Message from ${data.sender}: ${data.text}`);
                    break;
                    
                case 'logout':
                    clients.delete(data.username);
                    broadcastUserList();
                    console.log(`User ${data.username} logged out`);
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        // Remove client from active connections
        for (let [username, client] of clients.entries()) {
            if (client === ws) {
                clients.delete(username);
                console.log(`User ${username} disconnected`);
                break;
            }
        }
        broadcastUserList();
    });
});

function broadcastUserList() {
    const userList = Array.from(clients.keys());
    const message = JSON.stringify({
        type: 'users',
        users: userList.map(username => ({
            username,
            online: true
        }))
    });
    
    broadcast(message);
}

function broadcastMessage(message) {
    broadcast(JSON.stringify({
        type: 'chat',
        sender: message.sender,
        text: message.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
}

function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log(`WebSocket server running on port ${PORT}`);
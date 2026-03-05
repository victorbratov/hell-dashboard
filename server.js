const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Tail } = require('tail');
const path = require('path');
const fs = require('fs');

if (process.argv.length < 3) {
    console.error("Usage: node server.js <path_to_monitor.jsonl>");
    process.exit(1);
}

const logFilePath = path.resolve(process.argv[2]);

if (!fs.existsSync(logFilePath)) {
    console.error(`Error: File not found at ${logFilePath}`);
    console.error("Please make sure your C++ program has created the file.");
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

console.log(`Watching file: ${logFilePath}`);
const tail = new Tail(logFilePath, { fromBeginning: false });

tail.on('line', (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
});

tail.on('error', (err) => console.error('Tail error:', err));

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
});

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const dgram = require('dgram');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const TELEMETRY_PORT = Number(process.env.TELEMETRY_PORT || 9100);
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg) => {
    const line = msg.toString();
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(line);
        }
    });
});

udpServer.on('error', (err) => {
    console.error('UDP error:', err);
    udpServer.close();
});

udpServer.bind(TELEMETRY_PORT, '127.0.0.1', () => {
    console.log(`Listening for telemetry on UDP port ${TELEMETRY_PORT}`);
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
});

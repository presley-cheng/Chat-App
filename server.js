const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = 3000;
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
let users = {}; // store current users in the chat room

// set static file for visibility
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('send message', (data) => {
    if (data.message !== '') {
        socket.broadcast.emit('chat message', `${data.name}: ${data.message}`);
    }
  });

  socket.on('user enter', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user connect', name);
  })

  socket.on('typing', data => {
      socket.broadcast.emit('typing display', data);
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('user disconnect', users[socket.id]);
    delete users[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
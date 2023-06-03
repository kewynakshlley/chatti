const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessage, createLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDir));

let msg = 'Welcome!';

io.on('connection', (socket) => {
  console.log('new connection');

  socket.on('join', ({ nickname, room }) => {
    console.log(room, nickname);
    socket.join(room);

    socket.emit('message', createMessage(`Welcome to Chatti, ${nickname}!`));
    socket.broadcast
      .to(room)
      .emit('message', createMessage(`${nickname} has joined!`));
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed.');
    }

    io.to('123').emit('message', createMessage(message));
    callback('Message delivered!');
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('welcome', createMessage('User has left'));
  });

  socket.on('location', (position, callback) => {
    console.log(position);
    io.emit(
      'locationMessage',
      createLocationMessage(
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );

    callback('Location shared!');
  });
});

server.listen(port, () => {
  console.log('Server running!');
});

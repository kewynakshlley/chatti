const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessage, createLocationMessage } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDir));

io.on('connection', (socket) => {
  console.log('new connection');

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      'message',
      createMessage(user.nickname, `Welcome to Chatti, ${user.nickname}!`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        createMessage(user.nickname, `${user.nickname} has joined!`)
      );

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      message = filter.clean(message);
    }

    io.to(user.room).emit('message', createMessage(user.nickname, message));
    callback('Message delivered!');
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        createMessage(user.nickname, `${user.nickname} has left.`)
      );
    }
  });

  socket.on('location', (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      createLocationMessage(
        user.nickname,
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );

    callback('Location shared!');
  });
});

server.listen(port, () => {
  console.log('Server running!');
});

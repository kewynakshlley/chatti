const users = [];

const addUser = ({ id, nickname, room }) => {
  nickname = nickname.toString().trim().toLowerCase();
  room = room.toString().trim().toLowerCase();

  if (!nickname || !room) {
    return {
      error: 'Nickname and room are required.',
    };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.nickname === nickname;
  });

  if (existingUser) {
    return {
      error: 'Nickname already taken',
    };
  }

  const user = { id, nickname, room };
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id;
  });

  return user;
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };

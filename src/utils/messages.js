const createMessage = (nickname, text) => {
  return {
    nickname,
    text,
    createdAt: new Date().getTime(),
  };
};

const createLocationMessage = (nickname, url) => {
  return {
    nickname,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  createMessage,
  createLocationMessage,
};

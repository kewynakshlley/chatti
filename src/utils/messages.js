const createMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime(),
  };
};

const createLocationMessage = (url) => {
  return {
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  createMessage,
  createLocationMessage,
};

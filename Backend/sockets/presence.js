const onlineUsers = new Map();

const addUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);

  return onlineUsers.get(userId).size;
};

const removeUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    return 0;
  }

  const userSockets = onlineUsers.get(userId);

  userSockets.delete(socketId);

  if (userSockets.size === 0) {
    onlineUsers.delete(userId);
    return 0;
  }

  return userSockets.size;
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Get all active socket IDs of a specific user
const getUserSockets = (userId) => {
  if (!onlineUsers.has(userId)) {
    return [];
  }

  return Array.from(onlineUsers.get(userId));
};

export {
  addUser,
  removeUser,
  getOnlineUsers,
  getUserSockets,
};
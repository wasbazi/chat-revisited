var Sequelize = require('sequelize');

var client = require("./client")();

var Users = client.define("users", {
  id: {
    type: Sequelize.UUID(),
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING(),
    unique: "username"
  },
  connected: Sequelize.BOOLEAN(),
  socket_id: {
    type: Sequelize.STRING(),
    unique: "socket_id"
  }
});

var Conversations = client.define("conversations", {
  id: {
    type: Sequelize.UUID(),
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  message: Sequelize.TEXT(),
});

var Rooms = client.define("rooms", {
  id: {
    type: Sequelize.UUID(),
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  room_id: Sequelize.STRING(),
  type: Sequelize.STRING(),
});

Conversations.belongsTo(Users, {as: "user_id"});
Rooms.belongsTo(Users, {as: "user_id"});

// TECHINCAL DEBT
// TODO: Create database mechanism to look up a user by more than the
// most recent id that connects.
// TECHINCAL DEBT

module.exports = {
  Users: Users,
  Conversations: Conversations,
  Rooms: Rooms,
  client: client
};

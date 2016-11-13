var _ = require("lodash-node");

var models = require("./data/models");


function disconnectUser(socketId){
  return models.Users
    .update({connected: false}, {where: {socket_id: socketId}})
    .then(function(){
      return getUser(socketId);
    });
}

function getUser(socketId){
  return models.Users.findOne({where: {socket_id: socketId}});
}

function messageSent(socket, io, data) {
  getUser(socket.id).then(function(user){
    var room = data.room;
    var message = {
      message: data.text,
      username: user.username,
      type: room.type,
      id: room.id
    };

    socket.emit("message", message);
    models.Conversations.create({
      message: data.text,
      room_id: data.id,
      type: room.type,
      user_id: getUser(socket.id)});

    socket
      .broadcast.to(`${room.type}::${room.id}`)
      .emit("message", message);

    console.log("sent message to ", `${room.type}::${room.id}`);
    if (room.type === "friend") {
      data.id = user.id;
      models.Conversations.create({
        message: data.text,
        room_id: data.id,
        type: room.type,
        user_id: getUser(socket.id)});


      message = {
        message: data.text,
        username: user.username,
        type: room.type,
        id: user.id
      };
      socket
        .broadcast.to(`${room.type}::${user.id}`)
        .emit("message", message);
      console.log("sent message to ", `${room.type}::${user.id}`);
    }
  });
}

function setNick(socket, io, data){
  var nickname = data.name;
  if (!nickname) {
    return
  }

  socket.broadcast.emit("message", {message: nickname + " Logged On", username: "SERVER"});

  models.Users.upsert({username: nickname, connected: true, socket_id: socket.id})
    .then(function(modified) {
      return models.Users.findOne({where: {username: nickname}});
    }).then(function(user) {
      joinRoom(socket, io, {type:"friend", id: user.id});
      socket.broadcast.emit("friendJoined", _.omit(user, ["socket_id"]));
      // socket.emit("confirmNickname", {name: nickname, id: user.id});
    });
  }

function disconnect(socket, io){
  disconnectUser(socket.id).then(function(user){
    if (!user) {
      return;
    }

    getAllUsers(function(err, users) {
      io.sockets.emit("friendDisconnected", {users: users});
    });

    var messageObj = {
      message: `${user.username} Logged Off`,
      username: "SERVER"
    };
    io.sockets.emit("message", messageObj);
  });
}

function joinRoom(socket, io, data) {
  var room = {
    room_id: data.id,
    type: data.type,
    user_id: getUser(socket.id),
    where: {room_id: data.id}
  };
  models.Rooms.findOrCreate(room);
  socket.join(`${data.type}::${data.id}`);
}

function getAllUsers(cb){
  models.Users.findAll().then(function(users){
    cb(null, users.map(function(user){
      return _.omit(user, ["socket_id"]);
    }));
  });
}

function handler(io){
  io.sockets.on("connection", function(socket){
    joinRoom(socket, io, {type:"room", id: "lobby"});

    getAllUsers(function(err, users) {
      socket.emit("friendsList", users);
    });

    socket.on("disconnect", wrap(disconnect));
    socket.on("messageSent", wrap(messageSent));
    socket.on("setNick", wrap(setNick));
    socket.on("joinRoom", wrap(joinRoom));

    function wrap(fn) {
      return fn.bind(null, socket, io);
    }
  });
}

exports.handler = handler;

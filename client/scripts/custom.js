var socket = io.connect("/");

var ReservedWordsViewModel = function (){
  this.init();
}

var Message = function(data, selected){
  this.sender = data.username;
  this.message = data.message;
}

ReservedWordsViewModel.prototype = {
  init: function(){
    var self = this;

    this.chats = {"room::lobby": ko.observableArray()};
    this.friends = ko.observableArray();
    this.nick = ko.observable("");

    this.messageText = ko.observable();
    this.messageText.subscribe(this.sendMessage, this);

    this.setSocketListeners();

    this.room_type = ko.observable("room");
    this.room_id = ko.observable("lobby");
  },
  setSocketListeners: function(){
    var self = this;

    this.nick.subscribe(function(val){
      self.friendsList(self.friends());
      socket.emit("setNick", { name: val} );
    });

    socket.on("friendsList", this.friendsList.bind(this));
    socket.on("friendJoined", this.friendJoined.bind(this));
    socket.on("message", this.message.bind(this));
    socket.on("friendDisconnected", this.friendDisconnected.bind(this));
  },

  friendJoined: function(f){
    var user = this.friends().filter(function(friend) {
      return friend.username == f.name;
    });

    if (!user.length) {
      this.friends.push(f);
    }
  },
  friendsList: function(f){
    var self = this;
    this.friends(f.filter(function(friend){
      return friend.username != self.nick();
    }));
  },

  message: function(data){
    console.log("data", data);
    var message = new Message(data, this.selectedRoom);
    var type = data.type || "room";
    var id = data.id || "lobby";

    var room = this.formatRoomName(type, id);
    if (!this.chats[room]){
      this.chats[room] = ko.observableArray();
    }
    this.chats[room].push(message);
  },
  isActive: function(type, id){
    return this.room_type() == type && this.room_id() == id;
  },
  formatRoomName: function(type, id) {
    return type + "::" + id;
  },
  currentChats: function(){
    return this.chats[this.formatRoomName(this.room_type(), this.room_id())];
  },
  selectRoom: function(type, id){
    var room = this.formatRoomName(type, id)
    if (!this.chats[room]){
      this.chats[room] = ko.observableArray();
    }

    this.room_type(type).room_id(id);
    socket.emit("joinRoom", {type: this.room_type(), id: this.room_id()});
  },
  sendMessage: function(value){
    value = value || this.messageText();

    if(value !== ""){
      var message = {
        text: value,
        room: {type: this.room_type(), id: this.room_id()}
      };
      socket.emit("messageSent",  message);
      this.messageText("");
    }
  },
  friendDisconnected: function(data){
    this.friends(data.users);
  }

};

ko.applyBindings( new ReservedWordsViewModel() );

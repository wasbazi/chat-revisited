var users = [];

function findUser(id){
    if(!users.length)
        return false;

    var user = users.filter(function(x){
        return x.id == id;
    });
    return user && user[0];
}

function deleteUser(id){
    var user = findUser(id);
    if(!user)
        return false;

    var idx = users.indexOf(user);
    var removed = users.splice(idx, 1);
    return removed && removed[0];
}

function SocketConnection(io, socket){
    this.io = io;
    this.socket = socket;
}

SocketConnection.prototype = {
    disconnect: function(){
        var disconnectedUser = deleteUser(this.id);
        if(disconnectedUser){
            this.io.sockets.emit('friendDisconnected', { users: users, id: disconnectedUser.id});
            var messageObj = { message: this.nickname + " Logged Off", name: 'SERVER' };
            this.io.sockets.emit('newMessage', messageObj);
        }
    },
    messageSent: function (data){
        if (data.type == 'room')
                this.publicMessage(data);
        if (data.type == 'user')
                this.privateMessage(data);
    },
    publicMessage: function(data){
        var message = {message: data.text, name: this.nickname, sender: this.id, room: 'lobby'};
        this.socket.emit('message', message);
        this.socket.broadcast.emit('message', message);
    },
    privateMessage: function(data){
        var user = findUser(data.id);
        if(user){
            var message = {message: data.text, name: this.nickname, sender: this.id, receiver: user.id};
            this.socket.emit('message', message);
            var individualSocket = this.io.sockets.socket(user.sid);
            individualSocket.emit('message', message);
        }
    },
    setNick: function(data){
        this.nickname = data.name;
        this.id = users.length + 1;

        users.push({ sid: this.socket.id, name: this.nickname, id: this.id });
        this.socket.broadcast.emit('friendJoined', {name: this.nickname, id: this.id});
        this.socket.emit('confirmNickname', {name: this.nickname, id: this.id});
    }

};

function handler(io){
    io.sockets.on('connection', function(socket){
        socket.emit('friendsList', users);

        var listener = new SocketConnection(io, socket);

        socket.on('disconnect', listener.disconnect.bind(listener));
        socket.on('messageSent', listener.messageSent.bind(listener));
        socket.on('setNick', listener.setNick.bind(listener));
    });
}

exports.handler = handler;
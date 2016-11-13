var express = require("express");
var socketIO = require("socket.io");
var config = require("config");

var app = express();
var server = require("http").createServer(app);

var io = socketIO.listen(server);

function start(socketsHandler) {
    app.use(express.static(__dirname + "/../client"));
    app.get("/", function (request, response) {
        response.sendfile(__dirname + "/../client/index.html");
    });

    socketsHandler(io);

    var port = config.port;
    server.listen(port);
    console.log("Server has started on port", config.port);
}

exports.start = start;

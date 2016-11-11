var server = require("./lib/server"),
    socketsHandlers = require("./lib/socketsHandlers");

server.start(socketsHandlers.handler);

var Sequelize = require("sequelize");

var models = require("./models");


models.client.sync({force: true})
  .then(function(err) {
      console.log("It worked!");
      process.exit(0);
    }, function (err) {
      console.log("An error occurred while creating the table:", err);
      process.exit(1);
    });

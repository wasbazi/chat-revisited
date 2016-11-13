var Sequelize = require("sequelize");
var config = require("config");

function createClient() {
  return new Sequelize(config.postgres.database, config.postgres.username, config.postgres.password, {
    host: config.postgres.host,
    dialect: "postgres"
  });
}

module.exports = createClient;

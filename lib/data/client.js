var Sequelize = require('sequelize');

function createClient() {
  return new Sequelize('postgres', 'postgres', 'mysecretpassword', {
    host: 'localhost',
    dialect: 'postgres'
  });
}

module.exports = createClient

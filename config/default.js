module.exports = {
  port: process.env.PORT || 3000,
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    username: process.env.POSTGRES_USERNAME || "postgres",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DATABASE || "postgres"
  }
};

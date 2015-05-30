var knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

module.exports = require('bookshelf')(knex);

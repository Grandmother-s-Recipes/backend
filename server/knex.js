const config = require('../knexfile');
//const env = process.env.NODE_ENV || 'development'
const knex = require('knex')(config);

module.exports = knex;
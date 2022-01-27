const {Pool} = require('pg');
require('dotenv').config()
module.exports = new Pool({
  max: 10,
  connectionString: process.env.DATABASE_URL
});


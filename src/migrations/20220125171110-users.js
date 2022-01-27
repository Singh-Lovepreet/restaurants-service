const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();  
  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name varchar(200),
    cash_balance float(8)
  );`);

  await client.release(true);
  next();
};

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE users;
  `);

  await client.release(true);
  next();
};

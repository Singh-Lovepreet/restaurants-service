const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();
  await client.query(`
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
`);
  
  await client.query(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_name varchar(200),
    cash_balance float(8)
  );`);

  await client.release(true);
  next();
};

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE restaurants;
  `);

  await client.release(true);
  next();
};

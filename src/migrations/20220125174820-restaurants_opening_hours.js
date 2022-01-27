const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();  
  await client.query(`
  CREATE TABLE IF NOT EXISTS restaurants_opening_hours (
    restaurant_id uuid references restaurants(id),
    day varchar(15) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL
  );`);

  await client.release(true);
  next();
};

module.exports.down = async function (next) {
  const client = await db.connect();
  await client.query(`
    DROP TABLE restaurants_opening_hours;
`);
  await client.release(true);
  next();
};

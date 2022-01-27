const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();  
  await client.query(`
  CREATE TABLE IF NOT EXISTS menus (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id uuid references restaurants(id),
    dish_name varchar(1000) ,
    price float(8)
  );`);

  await client.release(true);
  next();
};

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE menus;
  `);

  await client.release(true);
  next();
};

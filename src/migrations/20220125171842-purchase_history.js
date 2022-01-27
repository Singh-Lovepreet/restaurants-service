const db = require('../persistence/db');

module.exports.up = async function (next) {
  const client = await db.connect();  
  await client.query(`
  CREATE TABLE IF NOT EXISTS purchase_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id SERIAL references users(user_id),
    dish_name varchar(300),
    restaurant_name varchar(200),
    transaction_amount float(8),
    transaction_date timestamp
  );`);

  await client.release(true);
  next();
};
module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE purchase_history;
  `);

  await client.release(true);
  next();
};

const moment = require('moment-timezone');
const userData = require("../sample_data/users_with_purchase_history.json")
const pgQueries=require("../../src/persistence/pgQueries").getInstance()
const pgRepo = require('../../src/persistence/repository');

  async function dumpData(){
    
      for (const user of userData) {
          const cash_balance = user.cashBalance
          const user_name = user.name
          const purchase_history = user.purchaseHistory
          const insertUserQuery = pgQueries.createEntryUserQuery()
          const _user = [user_name, cash_balance]
          const { rows } = await pgRepo.create({ query: insertUserQuery, values: _user })
          console.log("User inserted ",rows)
          const user_id =rows[0].user_id
          for (const dish of purchase_history) {
              const dish_name = dish.dishName
              const restaurant_name = dish.restaurantName
              const transaction_amount = dish.transactionAmount
              const transaction_date = moment(dish.transactionDate).toDate()
              const insertPurchaseQuery = pgQueries.createEntryPurchaseQuery()
              const _purchase = [user_id, dish_name, restaurant_name, transaction_amount, transaction_date]
              const { rows } = await pgRepo.create({ query: insertPurchaseQuery, values: _purchase })
              console.log(`Purchase item inserted for user_id: ${user_id}`,rows[0])
          }
      }
  }


dumpData()
  .then(() => {
    console.log('User data dump successfully');
    process.exit();
  })
  .catch((e) => {
    console.log('Data export error', e);
    process.exit();
  });

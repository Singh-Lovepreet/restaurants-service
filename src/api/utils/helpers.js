const pgQueries = require('../../persistence/pgQueries').getInstance()
const pgRepo = require('../../persistence/repository');
module.exports = {
    async getDishDetails({dish_id}) {    
        const query = pgQueries.getDishDetailQuery()
    
       return await pgRepo.find({query,values:[dish_id]}) 
    },
   async getRestaurantDetails({restaurant_id}) {
      const query = pgQueries.getRestaurantDetailsQuery()
     return await pgRepo.find({ query, values: [restaurant_id] })   
    },
    async getUserDetails({user_id}) {
        const query = pgQueries.getUserDetailsQuery()
        return await pgRepo.find({query,values:[user_id]})
    },
    async insertIntoPurchaseHistory(db,{user_id, dish_name, restaurant_name, transaction_amount, transaction_date}) {
        const query = pgQueries.createEntryPurchaseQuery()
        const values=[user_id, dish_name, restaurant_name, transaction_amount, transaction_date]
        return await pgRepo.create({_db:db, query,values})
    }
};
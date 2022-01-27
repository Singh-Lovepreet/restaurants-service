const { Router } = require('express');
const moment = require('moment-timezone');
const Decimal=require('decimal.js')
const pgQueries = require('../persistence/pgQueries').getInstance()
const pgRepo = require('../persistence/repository');
const utils=require('./utils/helpers');

const router = new Router();

router.get('/listRestaurants', async (request, response) => {
    const { dateTime } = request.query
    try {
        const { dateTime } = request.query
        if (!dateTime | dateTime && dateTime.length < 0) {
            return response.status(400).json({msg:"Invalid input !!"})
        }
        const day = moment(dateTime).format('dddd')
        const time=moment(dateTime).format('HH:mm:ss')
        const getRestaurentListQuery =pgQueries.getRestaurantListWithDateAndTime()
        const queryValue=[day,time]
        const res=await pgRepo.find({query:getRestaurentListQuery,values:queryValue})
        
        return response.status(200).json({ data: res });
    } catch (error) {
        console.log({
            searchString: 'LIST_RESTAURANTS_API_FAIL',
            input: { dateTime },
            error,
            errorStack: error.stack
        })
   return  response.status(500).json({msg:"Some thing went worng !!"});
  }
});

router.get('/listTopRestaurants', async (request, response) => {
    const { startRange, endRange, dishesQty, top } = request.query
    try {
       
        if (!startRange || !endRange || !dishesQty || !top ) {
            return response.status(400).json({msg:"Invalid input !!"})
        }
        const getRestaurentListQuery = pgQueries.getTopYRestaurants()
        const queryValue = [startRange, endRange, dishesQty, top]
        const res = await pgRepo.find({ query: getRestaurentListQuery, values: queryValue })
        return response.status(200).json({ data:res});

    } catch (error) {
        console.log({
            searchString: 'LIST_TOP_RESTAURANTS_API_FAIL',
            input: { startRange, endRange, dishesQty, top },
            error,
            errorStack: error.stack
        })
   return  response.status(500).json({msg:"Some thing went worng !!"});
  }
});


router.post('/purchaseDish', async (request, response) => {
    const { user_id, dish_id, restaurant_id } = request.body
    try {
       
        if (!user_id || !dish_id || !restaurant_id) {
            return response.status(400).json({ msg: "Invalid input !!" })
        }
        const dishDetail = await utils.getDishDetails({ dish_id })
        if (!dishDetail.length) {
            return response.status(400).json({msg:"dish not found"})
        }
        const dishName = dishDetail[0].dish_name
        const dishPrice=dishDetail[0].price
        const restaurantDetails = await utils.getRestaurantDetails({ restaurant_id })
        if (!restaurantDetails.length) {
            return response.status(400).json({msg:"restaurant not found"})
        }
        const restaurantName = restaurantDetails[0].restaurant_name
        const restaurantCashBalance = restaurantDetails[0].cash_balance
        const userDetails = await utils.getUserDetails({ user_id })

        if (!userDetails.length) {
            return response.status(400).json({msg:"user not found"})
        }
        const userCashBanlace = userDetails[0].cash_balance
        
        if (userCashBanlace < dishPrice) {
            return response.status(400).json({msg:"Low Balance "})
        }

        await pgRepo.transaction(async (db) => {
            try {
                await utils.insertIntoPurchaseHistory(db, {
                    user_id, dish_name: dishName,
                    restaurant_name: restaurantName,
                    transaction_amount: dishPrice,
                    transaction_date: moment().toDate()
                })
                const updateUserCashAmount = Number(new Decimal(userCashBanlace).sub(dishPrice).toFixed(2))
                const updateRestaurantCashAmount = Number(new Decimal(restaurantCashBalance).add(dishPrice).toFixed(2))
                const updateUserCashQuery = pgQueries.updateUserCashQuery()
                await pgRepo.update({ _db: db, query: updateUserCashQuery, values: [ updateUserCashAmount,user_id] })
                const updateRestaurantCashAmountQuery = pgQueries.updateRestaurantCashQuery()
                await pgRepo.update({ _db: db, query: updateRestaurantCashAmountQuery, values: [updateRestaurantCashAmount, restaurant_id,] })
            } catch (e) {
                throw new Error(e)
            }
        })
        return response.status(200).json({
            data: {
                dish_id,
                dish_name: dishName,
                dish_price: dishPrice,
                restaurant_name: restaurantName,
            }
        });
    } catch (error) {
        console.log({
            searchString: 'PURCHASE_DISH_API_FAIL',
            input: { user_id, dish_id, restaurant_id },
            error,
            errorStack: error.stack
        })
   return  response.status(500).json({msg:"Some thing went worng !!"});
  }
});


router.get('/search', async (request, response) => {
    const { searchText } = request.query
    try {
       
        if (!searchText) {
            return response.status(400).json({ msg: "Invalid input !!" })
        }
        const formatedSearchText = searchText.split(' ').join(' & ')
        const searchDishQuery=pgQueries.searchByRestaurantAndDishName()
        const queryValue = [formatedSearchText]
        const res=await pgRepo.find({query:searchDishQuery,values:queryValue})
        return response.status(200).json({ data:res});

    } catch (error) {
        console.log({
            searchString: 'SEARCH_DISH_API_FAIL',
            input: { searchText },
            error,
            errorStack: error.stack
        })
     return response.status(500).json({msg:"Some thing went worng !!"});
    }    
});

module.exports = router;

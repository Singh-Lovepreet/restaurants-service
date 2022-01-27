
const sql = require('sql-template-strings');
let instance;
class PgQueries {

    creatEntryInrestaurantsQuery() {
      return `INSERT INTO public.restaurants
      (id, restaurant_name, cash_balance)
      VALUES($1,$2,$3) RETURNING *;
      `
    }

    creatEntryInMenusQuery() {
        return`
        INSERT INTO public.menus (restaurant_id, dish_name, price) 
        VALUES($1,$2,$3) RETURNING *;
        `
    }

    creatEntryInOpeningHoursQuery() {
        return `INSERT INTO public.restaurants_opening_hours
        (restaurant_id, "day", open_time, close_time)
        VALUES($1,$2,$3,$4) RETURNING *;
        `
    }

    createEntryUserQuery() {
        return `
        INSERT INTO public.users (name, cash_balance) 
        VALUES($1,$2) RETURNING *;   `
    }

    createEntryPurchaseQuery() {
        return `INSERT INTO public.purchase_history
        (user_id ,dish_name, restaurant_name, transaction_amount, transaction_date)
        VALUES($1,$2,$3,$4,$5) RETURNING *;`
    }
  
  getRestaurantListWithDateAndTime() {
      return `with extra_restaurants as (
        SELECT restaurant_id FROM public.restaurants_opening_hours
        where 
        open_time::time >close_time ::time 
        and close_time::time < $2 
        and day=$1
        union 
        SELECT restaurant_id FROM public.restaurants_opening_hours
        where 
        close_time::time >$2
        and day=$1
        )
        select er.*,r.restaurant_name,r.cash_balance from extra_restaurants er
        join public.restaurants r on er.restaurant_id=r.id
        `
  }

  getTopYRestaurants() {
    return ` with aggRest as (
      SELECT  restaurant_id, count(dish_name) as dishQty FROM public.menus
      where  price>=$1 and price<=$2 
      group  by restaurant_id
      )
      select ar.*,r.restaurant_name from aggRest ar
      join public.restaurants r on r.id=ar.restaurant_id
      where ar.dishQty<$3 or ar.dishQty<$3 limit $4 offset 0`
  }

  getDishDetailQuery() {
    return `SELECT id, restaurant_id, dish_name, price FROM public.menus where id=$1`
  }

  getRestaurantDetailsQuery() {
    return `SELECT * FROM public.restaurants where id=$1 `
  }

  getUserDetailsQuery() {
    return `SELECT * FROM public.users where user_id=$1 `
  }

  insertIntoPurchaseHistoryQuery() {
    return `INSERT INTO public.purchase_history
          ( user_id, dish_name,restaurant_name,transaction_amount,transaction_date)
          VALUES( $1,$2,$3,$4,now());`
  }
 
  updateRestaurantCashQuery() {
    return `UPDATE public.restaurants SET cash_balance=$1 WHERE id=$2
    `
  }

  updateUserCashQuery() {
  return `UPDATE public.users SET cash_balance=$1 WHERE user_id=$2
  `
  }

  searchByRestaurantAndDishName() {
    return `SELECT r.id as restaurant_id ,
    restaurant_name ,
    m.dish_name ,
    m.id as dish_id ,
    m.price ,
    ts_rank(to_tsvector(concat(r.restaurant_name,m.dish_name)),to_tsquery($1)) as rank  
    FROM public.restaurants as r 
    join public.menus  as m on r.id=m.restaurant_id 
    WHERE
    to_tsvector(r.restaurant_name) @@ to_tsquery($1)
    or to_tsvector(m.dish_name) @@ to_tsquery($1)`
  }
  static getInstance() {
    if (!instance) instance = new PgQueries();
    return instance;
  }
}

exports.getInstance = PgQueries.getInstance;

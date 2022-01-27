const _ = require('lodash');
const moment = require('moment-timezone');
const { v4:uuidv4 } = require('uuid');
const restaurantData = require("../sample_data/restaurant_with_menu.json")
const { weekDays } = require("../helpers/maps")
const pgQueries=require("../../src/persistence/pgQueries").getInstance()
const pgRepo = require('../../src/persistence/repository');
function getShortDayNameList() {
    return ['Mon','Tues','Weds','Thurs','Fri','Sat','Sun']
}

function daysAndTimeMap(res,openingHoursData) {
   
    const completeWeekDayTimeMapList=[]
      for (const day of openingHoursData) {
 
          const daysList = day.split(' ').filter(ele => {
              const removeComma = ele.split(',')
              if (getShortDayNameList().includes(removeComma[0])) {
                  return removeComma[0];
              }
          })
          const splitedCommonTimeDays = day.split(',')
              const splitForTime = splitedCommonTimeDays[splitedCommonTimeDays.length - 1].split(' ')
              const openinAndClosingRawTime = splitForTime.slice(splitForTime.length - 6, splitForTime.length);
              const openingTime = openinAndClosingRawTime[0]
              const openingAbbreviation = openinAndClosingRawTime[1]
              const closingTime = openinAndClosingRawTime[openinAndClosingRawTime.length-3]
              const closingAbbreviation = openinAndClosingRawTime[openinAndClosingRawTime.length - 2]
              const openingTime24hr = moment(`${openingTime.length===1?`${openingTime}:00`:openingTime} ${openingAbbreviation.toUpperCase()}`, ["h:mm A"]).format("HH:mm");
              const closingTime24hr =  moment(`${closingTime.length===1?`${closingTime}:00`:closingTime} ${closingAbbreviation.toUpperCase()}`, ["h:mm A"]).format("HH:mm");
          const mapDayWithTime = daysList.map(_day => {
                  
                return {
                    day: _day,
                    openingTime: openingTime24hr,
                    closingTime:closingTime24hr
                }
              })
              completeWeekDayTimeMapList.push(...mapDayWithTime)
      }
        return completeWeekDayTimeMapList
    }

  async function dumpData(){
    
      for (const restaurant of restaurantData) {
         const restaurentUUID=uuidv4()
          const openingHourseWithTime = restaurant.openingHours.split('/')
          const daysAndTimeMappedData = daysAndTimeMap(restaurant,openingHourseWithTime)
          const restaurant_name = restaurant.restaurantName
          const cash_balance = restaurant.cashBalance
          const insertIntoRestaurentQuery = pgQueries.creatEntryInrestaurantsQuery()
          const values = [restaurentUUID, restaurant_name, cash_balance]
        const { rows }= await pgRepo.create({ query: insertIntoRestaurentQuery, values })
        console.log(`Restaurent item inserted for restaurent_id: ${restaurentUUID}`,rows[0])

            
          const menu = restaurant.menu
          for (dish of menu) {
              const dish_name = dish.dishName
              const dish_price = dish.price
              const insertIntoMenuQuery = pgQueries.creatEntryInMenusQuery()
              const menusItem = [restaurentUUID, dish_name, dish_price]
              const {rows}= await pgRepo.create({ query: insertIntoMenuQuery, values: menusItem })
            console.log(`Menu item inserted for restaurent_id: ${restaurentUUID}`,rows[0])

          }

          for (const day of daysAndTimeMappedData) {
              const _day = day.day.split(',')
              const open_time = day.openingTime
              const closing_time = day.closingTime
              const insertIntoOpeningHoursQuery = pgQueries.creatEntryInOpeningHoursQuery()
              const items = [restaurentUUID, weekDays[_day[0]], open_time, closing_time]
             const {rows} = await pgRepo.create({ query: insertIntoOpeningHoursQuery, values: items })
            console.log(`Opening hours item inserted for restaurent_id: ${restaurentUUID}`,rows[0])

          }
     }
  }


dumpData()
  .then(() => {
    console.log('Data exported successfully');
    process.exit();
  })
  .catch((e) => {
    console.log('Data export error', e);
    process.exit();
  });

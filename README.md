# Restaurent-Service 

> A Restaurent-Service project for Node.js with Express and Postgres

## Setup

Pre-requisites:

- Docker for Desktop

Copy local.env and create .env file

Run `docker-compose up` in the root of the project.

It will bring up Postgres and the Express application server in development mode.

It binds the application server to `localhost:3000`, this can be re-mapped this by changing the first 3000 in `3000:3000` of [./docker-compose.yaml](./docker-compose.yaml)).

The default Docker `CMD` is `npm start`, [./docker-compose.yaml](./docker-compose.yaml) overrides this to `npm run dev` which runs the application using nodemon (auto-restart on file change).

## Database setup + management

`npm run migrate up` will run the migrations this will be automate run with docker.

`npm run dump-restuarents-data` will dump restuarants data in DB.

`npm run dump-user-data` will dump user data in DB .

Postgres is exposed on port `5438`. The connection string is `postgres://user:pass@localhost:5438/db` (username, password and database name are defined in [./docker-compose.yaml](./docker-compose.yaml)).

You can connect to Postgres using the psql client:

```sh
psql postgres://user:pass@localhost:5438/db
```

## Express API setup

The Express API is located in [./src/api](./src/api).

Applications routes for resources are defined in [./src/api/index.js](./src/api/index.js).

Global concerns like security, cookie parsing, body parsing and request logging are handled in [./server.js](./server.js).


Whoo your project is setup now !!

Let's Explore its functionaties

## API docmentation

1. Search for restaurants or dishes by name, ranked by relevance to search term

```sh
 GET API: http://localhost:3000/api/restaurant/search?searchText=Fried Oysters
```

```sh
 Input params : {searchText:""}
```

```sh
 Response Sample:- {
    "data": [
        {
            "restaurant_id": "c37a3793-d967-45a8-89e0-f122b505c52e",
            "restaurant_name": "BD's Mongolian Grill – Arena",
            "dish_name": "Fried Oysters Boston Style",
            "dish_id": "c158d998-0354-41b1-81ab-219a9840a504",
            "price": 10.25,
            "rank": 1e-20
        },
        {
            "restaurant_id": "ff068d38-b61f-4d6a-892b-9f0e218eec05",
            "restaurant_name": "BRAVO Cucina Italiana - Columbus - Bethel Road",
            "dish_name": "Fried Oysters",
            "dish_id": "571974cc-d3a5-4e12-8ae2-f04a4c4764a7",
            "price": 11.79,
            "rank": 1e-20
        }
    ]
 }
 ```

 2. List top y restaurants that have more or less than x number of dishes within a price range

```sh
 GET API: http://localhost:3000/api/restaurant/listTopRestaurants?top=10&dishesQty=14&startRange=10&endRange=2000
```

```sh
 Inpute Params : 
 {
    startRange: type number
    endRange:type number
    dishesQty:type number
    top:type number
 }
 ```
```sh
 Sample Response:-

 {
    "data": [
        {
            "restaurant_id": "57c0ac19-f2b9-4b82-952a-053f6841bac7",
            "dishqty": "4",
            "restaurant_name": "Laundry"
        },
        {
            "restaurant_id": "90d04fc7-5ce7-4fcb-b94d-c9ceabe9a81f",
            "dishqty": "5",
            "restaurant_name": "Lox Stock & Bagel"
        }
    ]
}
```

3. List all restaurants that are open at a certain datetime

```sh
GET API: http://localhost:3000/api/restaurant/listRestaurants?dateTime=2021-01-26T14:30:00
```

```sh
Inpute Params: -

{
    dateTime: YYYY-MM-DDTHH:mm:ss
}
```
```sh
Sample Reponse:-

{
    "data": [
        {
            "restaurant_id": "d3d11c8a-8efc-4925-8fbd-5099e995d87f",
            "restaurant_name": "024 Grille",
            "cash_balance": 4882.81
        },
        {
            "restaurant_id": "a3115172-0595-494b-85e6-03a08a715891",
            "restaurant_name": "100% Mexicano Restaurant",
            "cash_balance": 1320.19
        }
    ]
}
```

4. Process a user purchasing a dish from a restaurant, handling all relevant data changes in an atomic transaction

```sh
POST API:-http://localhost:3000/api/restaurant/purchaseDish
```

```sh
Input Payload :-
{
    "dish_id": type uuuid eg: 168e5e1c-9c51-42ce-af3f-36b645a43284
    "user_id": Type integer eg:113
    "restaurant_id": type uuuid eg:3f741fff-e31a-41f0-9f3d-1994988296ac
}
```
```sh
Sample Reponse:

{
    "data": {
        "dish_id": "168e5e1c-9c51-42ce-af3f-36b645a43284",
        "dish_name": "GAI TOM KA: CHICKEN IN COCONUT CREAM SOUP WITH LIME JUICE GALANGA AND CHILI",
        "dish_price": 10.64,
        "restaurant_name": "'Ulu Ocean Grill and Sushi Lounge"
    }
}
```
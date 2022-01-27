const express = require('express');

const {Router} = express;
const router = new Router();

const restaurant=require('./restaurant')


router.use('/api/restaurant',restaurant)

module.exports = router;

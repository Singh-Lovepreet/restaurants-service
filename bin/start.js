require('dotenv').config()
const Server = require('../server');

Server.start(process.env.PORT);

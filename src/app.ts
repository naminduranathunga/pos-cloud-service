/**
 * This is the starting point of the application. This will loads env variables, modules, middlewares, routes and starts the server.
 * @module app
 * @requires express
 * @requires dotenv
 * @requires path
 * 
 */


// load env variables + Configuration variables
import { config } from 'dotenv';
config();

import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

//--------------------------------------------
// initilize middlewares here
//--------------------------------------------



//--------------------------------------------
// initilize event handler here
//--------------------------------------------



app.get('/', (req, res) => {
  res.send('Hello World! 3');
});


//--------------------------------------------
// define api endpoint routes here
//--------------------------------------------
const router = express.Router();

app.get('/api/v1/', router);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

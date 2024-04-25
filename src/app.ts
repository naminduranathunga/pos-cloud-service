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
import UserLogin from './user_login';
import { auth } from './middleware/auth';

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

// login route
router.get('/login', UserLogin);

/**
 * these route are only accessible via a valid token in header
 * @see middleware/auth.ts
 */
const protected_routes = express.Router();
protected_routes.use(auth); 


app.use('/api/v1', router);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

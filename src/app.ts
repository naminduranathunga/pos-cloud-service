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
import { add_api_endpoints, load_modules } from './modules/app_manager';

const app = express();
const port = process.env.PORT || 3000;

//--------------------------------------------
// initilize middlewares here
//--------------------------------------------



//--------------------------------------------
// initilize event handler here
//--------------------------------------------
load_modules();


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
const protected_router = express.Router();
protected_router.use(auth); 

add_api_endpoints(router, protected_router);

app.use('/api/v1', router);
app.use('/api/v1', protected_router);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

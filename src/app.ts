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
import bodyParser from 'body-parser';
import { db_connect } from './middleware/db_connect';
import cors, { CorsOptions } from 'cors';
import multer from 'multer';

const app = express();
const port = process.env.PORT || 3000;

//--------------------------------------------
// initilize middlewares here
//--------------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions:CorsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
//
const memoryStorage = multer.memoryStorage();
const uploads = multer({ storage: memoryStorage, limits: {
  fileSize: process.env.UPLOADS_MAX_SIZE ? parseInt(process.env.UPLOADS_MAX_SIZE) : 1024 * 1024
}});
//app.use(uploads.any());
app.use(cors(corsOptions));
app.use(db_connect);


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
//router.get('/login', UserLogin);
router.post('/login', UserLogin);

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

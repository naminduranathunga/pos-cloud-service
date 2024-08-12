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
import { add_api_endpoints, load_modules, organize_events } from './modules/app_manager';
import bodyParser from 'body-parser';
import { db_connect } from './middleware/db_connect';
import cors, { CorsOptions } from 'cors';
import multer from 'multer';
import errorHandler from './middleware/error_handler';
import ConnectMongoDB from './lib/connect_mongodb';
import system_check from './lib/system_check';

const app = express();
const port = process.env.PORT || 3000;

//--------------------------------------------
// initilize middlewares here
//--------------------------------------------
//app.use(preserveBody);
//app.use(bodyParser.raw({inflate: true, limit: '10mb', type: 'application/json'}));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
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
organize_events();





app.get('/', (req, res) => {
  res.send('Hello World! 3');
});

app.get('/test', (req, res) => {
  try {
    res.send('Hello World! 3');
    ConnectMongoDB();

  } catch (error:any) {
    console.error(error);
    res.status(500).send('Internal Server Error. '+ error.message);
  }
});
//--------------------------------------------
// define api endpoint routes here
//--------------------------------------------

const router = express.Router();
const router_unparsed = express.Router();

router_unparsed.use(express.raw({inflate: true, limit: '10mb', type: 'application/json'}));

// login route
//router.get('/login', UserLogin);
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.post('/login', UserLogin);

/**
 * these route are only accessible via a valid token in header
 * @see middleware/auth.ts
 */
const protected_router = express.Router();
const protected_router_unparsed = express.Router();

protected_router_unparsed.use(express.raw({inflate: true, limit: '10mb', type: 'application/json'}));
protected_router_unparsed.use(auth);

protected_router.use(bodyParser.json());
protected_router.use(bodyParser.urlencoded({ extended: true }));
protected_router.use(auth); 

add_api_endpoints(router, protected_router, router_unparsed, protected_router_unparsed);

app.use('/api/v1/unp', router_unparsed);
app.use('/api/v1/unp', protected_router_unparsed);
app.use('/api/v1', router);
app.use('/api/v1', protected_router);


// the last middleware to catch all errors
app.use(errorHandler);


system_check().then(() => {
  app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
  });
});

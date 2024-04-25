import { config } from 'dotenv';
config();

import express from 'express';
const app = express();
const port = process.env.PORT || 3000;


//console.log(process.env);

app.get('/', (req, res) => {
  res.send('Hello World! 3');
});


app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

const express = require("express");
require('dotenv').config();
const cors=require('cors');
const userRouter=require('./routers/user');
require('./db/mongoose');
const app = express();
app.use(cors());

const port=process.env.PORT || 3001;

app.use(userRouter);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
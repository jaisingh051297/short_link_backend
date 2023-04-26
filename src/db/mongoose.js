const mongoose=require('mongoose');
require('dotenv').config();
const connect_URL = process.env.MONGODB_CONNECTION_STRING;

mongoose.connect(connect_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error(err);
    });
require('http-status-codes');
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.IAM_METERED_ACCESS_KEY,
  secretAccessKey: process.env.IAM_METERED_SECRET_KEY,
  region: process.env.IAM_REGION,
});

app.use(express.json());
app.use(cors());

const chimeRouter = require('./routes/chime');

app.get('/', (req, res) => {
  res.send('chime telemedicine server');
});

app.use('/api/v1/chime', chimeRouter);

const PORT = process.env.PORT || 8080;
const start = async () => {
  try {
    app.listen(PORT, console.log('Server started at port ' + PORT));
  } catch (err) {
    console.error(err);
  }
};

start();

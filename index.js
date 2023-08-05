const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./model/User');
const Exercise = require('./model/Exercise');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




const db = mongoose.connection;
db.on('error', (error) => {
  console.error(console, 'MondoDB connection error:', error);
});
db.once('open',  async () => {
  console.log('Connected to MongoDB successfully!');
  await Exercise.deleteMany({});
  await User.deleteMany({});
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

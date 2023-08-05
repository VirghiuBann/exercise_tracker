const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()
const bodyParser = require('body-parser');

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./model/User');
const Exercise = require('./model/Exercise');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const username = req.body.username;

  const newUser = await User.create({ username: username });
  
  res.json({
    _id: newUser._id,
    username: newUser.username
  });
});

app.get('/api/users', async (req, res) => {
  const users = await User.find({});
  // console.log('GET USERS', users);

  res.json(users);
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params['_id'];
  
  const dateValidate = !date ? new Date() : new Date(date);
 
  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not Found!' });
    }
 
    const exercise = new Exercise({
      user_id: user._id,
      description: description,
      duration: +duration,
      date: dateValidate
    });
    await exercise.save();

    user.exercises.push(exercise);
    user = await user.save();
    
    const response = {
      _id: user._id,
      username: user.username,
      date: new Date(exercise.date).toDateString(),
      duration: exercise.duration,
      description: exercise.description,
    };
    
    // console.log('populate', response);

    res.json(response);
       
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
  
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params['_id'];

  const {from, to, limit} = req.query;

  try {
    const query = {};
    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      }
    }
    let queryLimit = {}
    if (limit) {
      queryLimit = { limit: limit } ;
    }

    const user = await User.findById(userId).populate({
      path: 'exercises',
      query,
      options: queryLimit
    }).exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const logs = {
      username: user.username,
      count: user.exercises.length,
      _id: user._id,
      log: user.exercises.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      })),
    }

    // console.log('logs', logs);
    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
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

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
  origin:["https://env-monitor.vercel.app","http://localhost:3000"],
  methods:["GET","PUT","POST","DELETE"],
  credentials:true
}));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://jebershon:OHnDfPaiRvidyxPl@cluster0.df4l8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
const decoded = jwt.decode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjkyMjk1OTMsImV4cCI6MTcyOTIzMzE5M30.9lnuPepMMX-sIRNWY7bCV3moXqQBLiRx5YfwZAGvja8");
// Start the server
app.listen(3001, () => {
  console.log("id : "+process.env.TWILIO_ACCOUNT_SID);
  console.log(`Server is running on port 3001`);
  console.log(decoded);
});

// ----------------------------------------Server configuration--------------------------------------
const User = require('./Models/userSchema');
const SensorData = require('./Models/readings'); 

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Find user by email
  const u = await User.findOne({ email });
  const user = u.email === email;
  if (!user) {
      return res.status(401).send('Invalid credentials');
  }
  // Check if password is correct
  const isPasswordValid = u.password === password;
  if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials');
  }
  // Generate JWT token
  const token = jwt.sign({ id: u.id, email: u.email, name:u.name }, process.env.JWT_SECRET, {expiresIn: '1h'});
  res.json({ token });
});

app.post('/send-sms', (req, res) => {
  const { to, message } = req.body;
  client.messages.create({
          body: message,
          from: '+919342629075', 
          to: to 
      })
      .then((message) => res.status(200).send(`Message sent: ${message.sid}`))
      .catch((error) => res.status(500).send(`Error: ${error.message}`));
});

// Create a new user and send a welcome SMS
app.post('/users', async (req, res) => {
  try {
    const { name, phone, email,password } = req.body;

    // Create new user in MongoDB
    const newUser = new User({ name, phone, email, password });
    await newUser.save();

    // Send welcome SMS using Twilio
    client.messages.create({
      body: `Hello ${name}, welcome to our application! your password : ${password}`,
      from: '+18568041545',
      to: phone,
    }).then(message => {
      console.log(`SMS sent: ${message.sid}`);
    }).catch(error => {
      console.error('Error sending SMS:', error);
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a single user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, email, password }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// CRUD Operations for Readings

// Create
app.post('/sensors', async (req, res) => {
  try {
    const sensor = new SensorData(req.body);
    await sensor.save();
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all
app.get('/sensors', async (req, res) => {
  try {
    const sensors = await SensorData.find();
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read one
app.get('/sensors/:id', async (req, res) => {
  try {
    const sensor = await SensorData.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor data not found' });
    }
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
app.put('/sensors/:id', async (req, res) => {
  try {
    const sensor = await SensorData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor data not found' });
    }
    res.json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
app.delete('/sensors/:id', async (req, res) => {
  try {
    const sensor = await SensorData.findByIdAndDelete(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor data not found' });
    }
    res.json({ message: 'Sensor data deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
// Initialize Express
const app = express();
// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Middleware
app.use(bodyParser.json());
app.use(express.json());


// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://jebershon:OHnDfPaiRvidyxPl@cluster0.df4l8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Start the server
app.listen(3001, () => {
  console.log("id : "+process.env.TWILIO_ACCOUNT_SID);
  console.log(`Server is running on port 3001`);
});

// Define the User schema
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,  // This will store the user's phone number for sending SMS
  email: String,
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Create a new user and send a welcome SMS
app.post('/users', async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    // Create new user in MongoDB
    const newUser = new User({ name, phone, email });
    await newUser.save();

    // Send welcome SMS using Twilio
    client.messages.create({
      body: `Hello ${name}, welcome to our application!`,
      from: '+18568041545', // Replace with your Twilio phone number
      to: phone, // Send SMS to user's phone
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
    const { name, phone, email } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, email }, { new: true });
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


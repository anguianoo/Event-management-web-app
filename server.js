const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'event_management',
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/eventFeedback', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/events', (req, res) => {
  const query = 'SELECT * FROM events';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/register', (req, res) => {
  const { userId, eventId } = req.body;
  const query = 'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)';
  db.query(query, [userId, eventId], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Registration successful' });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

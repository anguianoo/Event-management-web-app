const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password', // Replace with your MySQL password
    database: 'event_management',
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('MySQL connected...');
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/eventFeedback', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected...'))
    .catch((err) => console.error('MongoDB connection error:', err));

// MongoDB Schema and Model for Feedback
const feedbackSchema = new mongoose.Schema({
    eventId: Number,
    userId: Number,
    comment: String,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// API Routes

// Get All Events
app.get('/events', (req, res) => {
    const query = 'SELECT * FROM events';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            res.status(500).json({ error: 'Failed to fetch events' });
        } else {
            res.json(results);
        }
    });
});

// Add New Event
app.post('/events', (req, res) => {
    const { name, date, location, description } = req.body;
    const query = 'INSERT INTO events (name, date, location, description) VALUES (?, ?, ?, ?)';
    db.query(query, [name, date, location, description], (err) => {
        if (err) {
            console.error('Error adding event:', err);
            res.status(500).json({ error: 'Failed to add event' });
        } else {
            res.json({ message: 'Event added successfully' });
        }
    });
});

// Delete Event
app.delete('/events/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM events WHERE event_id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting event:', err);
            res.status(500).json({ error: 'Failed to delete event' });
        } else {
            res.json({ message: 'Event deleted successfully' });
        }
    });
});

// Register for an Event
app.post('/register', (req, res) => {
    const { userId, eventId } = req.body;
    const query = 'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)';
    db.query(query, [userId, eventId], (err) => {
        if (err) {
            console.error('Error registering for event:', err);
            res.status(500).json({ error: 'Failed to register' });
        } else {
            res.json({ message: 'Registration successful' });
        }
    });
});

// Get User Registrations
app.get('/registrations/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT events.* FROM events 
        JOIN registrations ON events.event_id = registrations.event_id 
        WHERE registrations.user_id = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching registrations:', err);
            res.status(500).json({ error: 'Failed to fetch registrations' });
        } else {
            res.json(results);
        }
    });
});

// Submit Feedback (MongoDB)
app.post('/feedback', (req, res) => {
    const feedback = new Feedback(req.body);
    feedback.save()
        .then(() => res.json({ message: 'Feedback submitted successfully' }))
        .catch((err) => res.status(500).json({ error: err.message }));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

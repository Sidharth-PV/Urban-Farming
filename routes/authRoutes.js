const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database connection

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate login using plain-text password matching
  db.validateLogin(username, password, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (user) {
      // User found, login successful
      res.json({
        message: 'Login successful',
        role: user.role,
        token: 'sample-token' // Replace with actual JWT token in production
      });
    } else {
      // Invalid credentials
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

// Signup route
router.post('/signup', (req, res) => {
  const { username, password } = req.body;

  // Insert new user into the database
  const query = 'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)';
  db.query(query, [username, password, 'user'], (err, result) => {
    if (err) {
      // Handle unique username constraint error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(201).json({ message: 'Account created successfully' });
  });
});

module.exports = router;

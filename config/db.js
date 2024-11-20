const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '373515', // Your MySQL password
  database: 'UrbanFarmingDB' // Your database name
});

db.connect((err) => {
  if (err) {
    console.log('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;

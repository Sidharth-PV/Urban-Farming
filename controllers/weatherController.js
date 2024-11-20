const db = require('../config/db');

exports.getWeathers = (req, res) => {
    db.query('SELECT * FROM Weather', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getWeatherById = (req, res) => {
    const weatherId = req.params.id;
    db.query('SELECT * FROM Weather WHERE weather_id = ?', [weatherId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Weather not found');
        res.json(result[0]);
    });
};

exports.addWeather = (req, res) => {
    const { weather_id, temperature, humidity, location, field_id } = req.body;
    db.query(
        'INSERT INTO Weather (weather_id, temperature, humidity, location, field_id) VALUES (?, ?, ?, ?, ?)', 
        [weather_id, temperature, humidity, location, field_id], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Weather record added successfully');
        }
    );
};

exports.updateWeather = (req, res) => {
    const weatherId = req.params.id;
    const { temperature, humidity, location, field_id } = req.body;
    db.query(
        'UPDATE Weather SET temperature = ?, humidity = ?, location = ?, field_id = ? WHERE weather_id = ?', 
        [temperature, humidity, location, field_id, weatherId], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Weather record updated successfully');
        }
    );
};

exports.deleteWeather = (req, res) => {
    const weatherId = req.params.id;
    db.query('DELETE FROM Weather WHERE weather_id = ?', [weatherId], (err) => {
        if (err) return res.status(500).json(err);
        res.send('Weather record deleted successfully');
    });
};
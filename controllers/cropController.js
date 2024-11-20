const db = require('../config/db');

exports.getCrops = (req, res) => {
    db.query('SELECT * FROM Crop', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getCropById = (req, res) => {
    const cropId = req.params.id;
    db.query('SELECT * FROM Crop WHERE crop_id = ?', [cropId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Crop not found');
        res.json(result[0]);
    });
};

exports.addCrop = (req, res) => {
    const { crop_id, variety, planted_month, harvesting_date, quantity, field_id } = req.body;
    db.query('INSERT INTO Crop (crop_id, variety, planted_month, harvesting_date, quantity, field_id) VALUES (?, ?, ?, ?, ?, ?)', 
        [crop_id, variety, planted_month, harvesting_date, quantity, field_id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Crop added successfully');
    });
};

exports.updateCrop = (req, res) => {
    const cropId = req.params.id;
    const { variety, planted_month, harvesting_date, quantity, field_id } = req.body;
    db.query('UPDATE Crop SET variety = ?, planted_month = ?, harvesting_date = ?, quantity = ?, field_id = ? WHERE crop_id = ?', 
        [variety, planted_month, harvesting_date, quantity, field_id, cropId], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Crop updated successfully');
    });
};

exports.deleteCrop = (req, res) => {
    const cropId = req.params.id;
    db.query('DELETE FROM Crop WHERE crop_id = ?', [cropId], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Crop deleted successfully');
    });
};

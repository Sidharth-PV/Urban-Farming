const db = require('../config/db');

exports.getCropFertilizers = (req, res) => {
    db.query('SELECT * FROM Crop_Fertilizer', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getCropFertilizerById = (req, res) => {
    const cropFertilizerId = req.params.id;
    db.query('SELECT * FROM Crop_Fertilizer WHERE crop_fertilizer_id = ?', [cropFertilizerId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Crop-Fertilizer combination not found');
        res.json(result[0]);
    });
};

exports.addCropFertilizer = (req, res) => {
    const { crop_fertilizer_id, crop_id, fertilizer_id } = req.body;
    db.query('INSERT INTO Crop_Fertilizer (crop_fertilizer_id, crop_id, fertilizer_id) VALUES (?, ?, ?)', 
        [crop_fertilizer_id, crop_id, fertilizer_id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Crop-Fertilizer combination added successfully');
    });
};

exports.updateCropFertilizer = (req, res) => {
    const cropFertilizerId = req.params.id;
    const { crop_id, fertilizer_id } = req.body;
    db.query('UPDATE Crop_Fertilizer SET crop_id = ?, fertilizer_id = ? WHERE crop_fertilizer_id = ?', 
        [crop_id, fertilizer_id, cropFertilizerId], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Crop-Fertilizer combination updated successfully');
    });
};

exports.deleteCropFertilizer = (req, res) => {
    const cropFertilizerId = req.params.id;
    db.query('DELETE FROM Crop_Fertilizer WHERE crop_fertilizer_id = ?', [cropFertilizerId], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Crop-Fertilizer combination deleted successfully');
    });
};

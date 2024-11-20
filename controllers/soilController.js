const db = require('../config/db');

exports.getSoils = (req, res) => {
    db.query('SELECT * FROM Soil', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getSoilById = (req, res) => {
    const soilId = req.params.id;
    db.query('SELECT * FROM Soil WHERE soil_id = ?', [soilId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Soil not found');
        res.json(result[0]);
    });
};

exports.addSoil = (req, res) => {
    const { soil_id, soil_type, soil_ph, soil_moisture, field_id } = req.body;
    db.query(
        'INSERT INTO Soil (soil_id, soil_type, soil_ph, soil_moisture, field_id) VALUES (?, ?, ?, ?, ?)', 
        [soil_id, soil_type, soil_ph, soil_moisture, field_id], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Soil added successfully');
        }
    );
};

exports.updateSoil = (req, res) => {
    const soilId = req.params.id;
    const { soil_type, soil_ph, soil_moisture, field_id } = req.body;
    db.query(
        'UPDATE Soil SET soil_type = ?, soil_ph = ?, soil_moisture = ?, field_id = ? WHERE soil_id = ?', 
        [soil_type, soil_ph, soil_moisture, field_id, soilId], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Soil updated successfully');
        }
    );
};

exports.deleteSoil = (req, res) => {
    const soilId = req.params.id;
    db.query('DELETE FROM Soil WHERE soil_id = ?', [soilId], (err) => {
        if (err) return res.status(500).json(err);
        res.send('Soil deleted successfully');
    });
};
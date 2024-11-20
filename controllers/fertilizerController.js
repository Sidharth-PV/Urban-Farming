const db = require('../config/db');

exports.getFertilizers = (req, res) => {
    db.query('SELECT * FROM Fertilizer', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getFertilizerById = (req, res) => {
    const fertilizerId = req.params.id;
    db.query('SELECT * FROM Fertilizer WHERE fertilizer_id = ?', [fertilizerId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Fertilizer not found');
        res.json(result[0]);
    });
};

exports.addFertilizer = (req, res) => {
    const { fertilizer_id, type, brand, rate } = req.body;
    db.query(
        'INSERT INTO Fertilizer (fertilizer_id, type, brand, rate) VALUES (?, ?, ?, ?)', 
        [fertilizer_id, type, brand, rate], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Fertilizer added successfully');
        }
    );
};

exports.updateFertilizer = (req, res) => {
    const fertilizerId = req.params.id;
    const { type, brand, rate } = req.body;
    db.query(
        'UPDATE Fertilizer SET type = ?, brand = ?, rate = ? WHERE fertilizer_id = ?', 
        [type, brand, rate, fertilizerId], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Fertilizer updated successfully');
        }
    );
};

exports.deleteFertilizer = (req, res) => {
    const fertilizerId = req.params.id;
    db.query('DELETE FROM Fertilizer WHERE fertilizer_id = ?', [fertilizerId], (err) => {
        if (err) return res.status(500).json(err);
        res.send('Fertilizer deleted successfully');
    });
};
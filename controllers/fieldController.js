const db = require('../config/db');

exports.getFields = (req, res) => {
    db.query('SELECT * FROM Field', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getFieldById = (req, res) => {
    const fieldId = req.params.id;
    db.query('SELECT * FROM Field WHERE field_id = ?', [fieldId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Field not found');
        res.json(result[0]);
    });
};

exports.addField = (req, res) => {
    const { field_id, location, size, farmer_id } = req.body;
    db.query('INSERT INTO Field (field_id, location, size, farmer_id) VALUES (?, ?, ?, ?)', 
        [field_id, location, size, farmer_id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Field added successfully');
    });
};

exports.updateField = (req, res) => {
    const fieldId = req.params.id;
    const { location, size, farmer_id } = req.body;
    db.query('UPDATE Field SET location = ?, size = ?, farmer_id = ? WHERE field_id = ?', 
        [location, size, farmer_id, fieldId], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Field updated successfully');
    });
};

exports.deleteField = (req, res) => {
    const fieldId = req.params.id;
    db.query('DELETE FROM Field WHERE field_id = ?', [fieldId], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Field deleted successfully');
    });
};

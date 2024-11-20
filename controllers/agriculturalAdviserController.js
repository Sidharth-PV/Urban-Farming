const db = require('../config/db');

exports.getAdvisers = (req, res) => {
    db.query('SELECT * FROM Agricultural_Adviser', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.getAdviserById = (req, res) => {
    const expertId = req.params.id;
    db.query('SELECT * FROM Agricultural_Adviser WHERE expert_id = ?', [expertId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Adviser not found');
        res.json(result[0]);
    });
};

exports.addAdviser = (req, res) => {
    const { expert_id, name, contact_no, address } = req.body;
    db.query(
        'INSERT INTO Agricultural_Adviser (expert_id, name, contact_no, address) VALUES (?, ?, ?, ?)', 
        [expert_id, name, contact_no, address], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Adviser added successfully');
        }
    );
};

exports.updateAdviser = (req, res) => {
    const expertId = req.params.id;
    const { name, contact_no, address } = req.body;
    db.query(
        'UPDATE Agricultural_Adviser SET name = ?, contact_no = ?, address = ? WHERE expert_id = ?', 
        [name, contact_no, address, expertId], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Adviser updated successfully');
        }
    );
};

exports.deleteAdviser = (req, res) => {
    const expertId = req.params.id;
    db.query('DELETE FROM Agricultural_Adviser WHERE expert_id = ?', [expertId], (err) => {
        if (err) return res.status(500).json(err);
        res.send('Adviser deleted successfully');
    });
};
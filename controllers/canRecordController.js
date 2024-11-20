const db = require('../config/db');

exports.getCanRecords = (req, res) => {
    // Using JOIN to get related information
    const query = `
        SELECT cr.*, 
               f.name as farmer_name,
               c.variety as crop_variety,
               s.soil_type,
               fert.type as fertilizer_type,
               w.location as weather_location,
               e.name as expert_name
        FROM Can_Record cr
        LEFT JOIN Farmer f ON cr.farmer_id = f.farmer_id
        LEFT JOIN Crop c ON cr.crop_id = c.crop_id
        LEFT JOIN Soil s ON cr.soil_id = s.soil_id
        LEFT JOIN Fertilizer fert ON cr.fertilizer_id = fert.fertilizer_id
        LEFT JOIN Weather w ON cr.weather_id = w.weather_id
        LEFT JOIN Agricultural_Adviser e ON cr.expert_id = e.expert_id
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

exports.getCanRecordById = (req, res) => {
    const recordId = req.params.id;
    const query = `
        SELECT cr.*, 
               f.name as farmer_name,
               c.variety as crop_variety,
               s.soil_type,
               fert.type as fertilizer_type,
               w.location as weather_location,
               e.name as expert_name
        FROM Can_Record cr
        LEFT JOIN Farmer f ON cr.farmer_id = f.farmer_id
        LEFT JOIN Crop c ON cr.crop_id = c.crop_id
        LEFT JOIN Soil s ON cr.soil_id = s.soil_id
        LEFT JOIN Fertilizer fert ON cr.fertilizer_id = fert.fertilizer_id
        LEFT JOIN Weather w ON cr.weather_id = w.weather_id
        LEFT JOIN Agricultural_Adviser e ON cr.expert_id = e.expert_id
        WHERE cr.can_record_id = ?
    `;
    
    db.query(query, [recordId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).send('Record not found');
        res.json(result[0]);
    });
};

exports.addCanRecord = (req, res) => {
    const { 
        can_record_id, 
        farmer_id, 
        crop_id, 
        soil_id, 
        fertilizer_id, 
        weather_id, 
        expert_id 
    } = req.body;

    const query = `
        INSERT INTO Can_Record (
            can_record_id, farmer_id, crop_id, soil_id, 
            fertilizer_id, weather_id, expert_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query, 
        [can_record_id, farmer_id, crop_id, soil_id, fertilizer_id, weather_id, expert_id], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Record added successfully');
        }
    );
};

exports.updateCanRecord = (req, res) => {
    const recordId = req.params.id;
    const { 
        farmer_id, 
        crop_id, 
        soil_id, 
        fertilizer_id, 
        weather_id, 
        expert_id 
    } = req.body;

    const query = `
        UPDATE Can_Record 
        SET farmer_id = ?, 
            crop_id = ?, 
            soil_id = ?, 
            fertilizer_id = ?, 
            weather_id = ?, 
            expert_id = ?
        WHERE can_record_id = ?
    `;

    db.query(
        query, 
        [farmer_id, crop_id, soil_id, fertilizer_id, weather_id, expert_id, recordId], 
        (err) => {
            if (err) return res.status(500).json(err);
            res.send('Record updated successfully');
        }
    );
};

exports.deleteCanRecord = (req, res) => {
    const recordId = req.params.id;
    db.query('DELETE FROM Can_Record WHERE can_record_id = ?', [recordId], (err) => {
        if (err) return res.status(500).json(err);
        res.send('Record deleted successfully');
    });
};
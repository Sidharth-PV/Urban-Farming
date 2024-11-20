const db = require('../config/db');

// Get a paginated list of farmers
exports.getFarmers = (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Default to page 1
    const limit = parseInt(req.query.limit) || 8;  // Default to 8 items per page
    const offset = (page - 1) * limit;

    db.query('SELECT * FROM Farmer LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            console.error('Database error:', err);  // Log the error for debugging
            return res.status(500).send('Internal server error');
        }
        res.json(results);  // Send the fetched results as JSON
    });
};

// Get a farmer by ID
exports.getFarmerById = (req, res) => {
    const farmerId = req.params.id;
    db.query('SELECT * FROM Farmer WHERE farmer_id = ?', [farmerId], (err, result) => {
        if (err) {
            console.error('Database error:', err);  // Log the error for debugging
            return res.status(500).send('Internal server error');
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Farmer not found' });  // Respond with 404 if no result
        }
        res.json(result[0]);  // Return the farmer's data
    });
};

// Add a new farmer
exports.addFarmer = (req, res) => {
    const { farmer_id, name, contact, address } = req.body;

    // Log the incoming request body for debugging purposes
    console.log("Request Body:", req.body);

    // Validate input
    if (!farmer_id || !name || !contact || !address) {
        return res.status(400).json({ message: 'All fields are required.' });  // Return 400 if fields are missing
    }

    // Insert new farmer into the database
    db.query('INSERT INTO Farmer (farmer_id, name, contact, address) VALUES (?, ?, ?, ?)', 
        [farmer_id, name, contact, address], (err) => {
        if (err) {
            console.error('Database error:', err);  // Log the error for debugging
            return res.status(500).send('Internal server error');
        }
        res.status(201).json({ message: 'Farmer added successfully' });  // Send success message
    });
};

// Update an existing farmer
exports.updateFarmer = (req, res) => {
    const farmerId = req.params.id;
    const { name, contact, address } = req.body;

    // Validate input
    if (!name || !contact || !address) {
        return res.status(400).json({ message: 'All fields are required.' });  // Return 400 if fields are missing
    }

    // Update the farmer details in the database
    db.query('UPDATE Farmer SET name = ?, contact = ?, address = ? WHERE farmer_id = ?', 
        [name, contact, address, farmerId], (err) => {
        if (err) {
            console.error('Database error:', err);  // Log the error for debugging
            return res.status(500).send('Internal server error');
        }
        res.json({ message: 'Farmer updated successfully' });  // Send success message
    });
};

// Delete a farmer by ID
exports.deleteFarmer = (req, res) => {
    const farmerId = req.params.id;

    // Delete the farmer from the database
    db.query('DELETE FROM Farmer WHERE farmer_id = ?', [farmerId], (err) => {
        if (err) {
            console.error('Database error:', err);  // Log the error for debugging
            return res.status(500).send('Internal server error');
        }
        res.json({ message: 'Farmer deleted successfully' });  // Send success message
    });
};

const express = require('express');
const cors = require('cors'); // Import the CORS package
const db = require('./config/db'); // Import the database connection
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors()); // Add this line to enable CORS

// Middleware to parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Import Routes
const farmerRoutes = require('./routes/farmerRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const cropRoutes = require('./routes/cropRoutes');
const soilRoutes = require('./routes/soilRoutes');
const fertilizerRoutes = require('./routes/fertilizerRoutes');
const cropFertilizerRoutes = require('./routes/cropFertilizerRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const agriculturalAdviserRoutes = require('./routes/agriculturalAdviserRoutes');
const canRecordRoutes = require('./routes/canRecordRoutes');

// Use Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/soils', soilRoutes);
app.use('/api/fertilizers', fertilizerRoutes);
app.use('/api/crop_fertilizers', cropFertilizerRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/advisers', agriculturalAdviserRoutes);
app.use('/api/records', canRecordRoutes);

// Define basic route for testing
app.get('/', (req, res) => {
    res.send('Urban Farming Management System API is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

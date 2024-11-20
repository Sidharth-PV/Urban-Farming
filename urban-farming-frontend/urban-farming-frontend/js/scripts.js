// Load Farmers Data
function loadFarmers() {
    const farmerList = document.getElementById('farmers-list');
    farmerList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/farmers')
        .then(response => response.json())
        .then(farmers => {
            farmerList.innerHTML = farmers.map(farmer => `
                <div>
                    <h3>${farmer.name}</h3>
                    <p>Location: ${farmer.location}</p>
                </div>
            `).join('');
        })
        .catch(err => farmerList.innerHTML = "<p>Error loading data.</p>");
}

// Load Fields Data
function loadFields() {
    const fieldsList = document.getElementById('fields-list');
    fieldsList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/fields')
        .then(response => response.json())
        .then(fields => {
            fieldsList.innerHTML = fields.map(field => `
                <div>
                    <h3>Field ID: ${field.id}</h3>
                    <p>Farmer ID: ${field.farmer_id}</p>
                    <p>Area: ${field.area}</p>
                </div>
            `).join('');
        })
        .catch(err => fieldsList.innerHTML = "<p>Error loading data.</p>");
}

// Load Crops Data
function loadCrops() {
    const cropsList = document.getElementById('crops-list');
    cropsList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/crops')
        .then(response => response.json())
        .then(crops => {
            cropsList.innerHTML = crops.map(crop => `
                <div>
                    <h3>${crop.name}</h3>
                    <p>Field ID: ${crop.field_id}</p>
                    <p>Planting Date: ${crop.planting_date}</p>
                </div>
            `).join('');
        })
        .catch(err => cropsList.innerHTML = "<p>Error loading data.</p>");
}

// Load Soil Data
function loadSoil() {
    const soilList = document.getElementById('soil-list');
    soilList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/soil')
        .then(response => response.json())
        .then(soil => {
            soilList.innerHTML = soil.map(soilData => `
                <div>
                    <h3>Field ID: ${soilData.field_id}</h3>
                    <p>Soil Type: ${soilData.type}</p>
                </div>
            `).join('');
        })
        .catch(err => soilList.innerHTML = "<p>Error loading data.</p>");
}

// Load Fertilizers Data
function loadFertilizers() {
    const fertilizerList = document.getElementById('fertilizers-list');
    fertilizerList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/fertilizers')
        .then(response => response.json())
        .then(fertilizers => {
            fertilizerList.innerHTML = fertilizers.map(fertilizer => `
                <div>
                    <h3>${fertilizer.name}</h3>
                    <p>Type: ${fertilizer.type}</p>
                </div>
            `).join('');
        })
        .catch(err => fertilizerList.innerHTML = "<p>Error loading data.</p>");
}

// Load Agricultural Advisors Data
function loadAdvisors() {
    const advisorsList = document.getElementById('advisors-list');
    advisorsList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/advisors')
        .then(response => response.json())
        .then(advisors => {
            advisorsList.innerHTML = advisors.map(advisor => `
                <div>
                    <h3>${advisor.name}</h3>
                    <p>Field of Expertise: ${advisor.field_of_expertise}</p>
                </div>
            `).join('');
        })
        .catch(err => advisorsList.innerHTML = "<p>Error loading data.</p>");
}

// Handle Farmer Form Submission
document.getElementById('farmerForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const farmerName = document.getElementById('farmerName').value;
    const farmerLocation = document.getElementById('farmerLocation').value;

    fetch('http://localhost:3000/api/farmers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: farmerName, location: farmerLocation })
    })
    .then(response => response.json())
    .then(data => alert("Farmer added successfully"))
    .catch(err => alert("Error adding farmer"));
});

// Handle Field Form Submission
document.getElementById('fieldForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const farmerId = document.getElementById('farmerId').value;
    const fieldArea = document.getElementById('fieldArea').value;

    fetch('http://localhost:3000/api/fields', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ farmer_id: farmerId, area: fieldArea })
    })
    .then(response => response.json())
    .then(data => alert("Field added successfully"))
    .catch(err => alert("Error adding field"));
});
// Load Weather Data
function loadWeather() {
    const weatherList = document.getElementById('weather-list');
    weatherList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/weather')
        .then(response => response.json())
        .then(weather => {
            weatherList.innerHTML = weather.map(w => `
                <div>
                    <h3>Date: ${w.date}</h3>
                    <p>Temperature: ${w.temperature}°C</p>
                    <p>Rainfall: ${w.rainfall}mm</p>
                    <p>Humidity: ${w.humidity}%</p>
                </div>
            `).join('');
        })
        .catch(err => weatherList.innerHTML = "<p>Error loading data.</p>");
}

// Handle Weather Form Submission
document.getElementById('weatherForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const weatherDate = document.getElementById('weatherDate').value;
    const weatherTemperature = document.getElementById('weatherTemperature').value;
    const weatherRainfall = document.getElementById('weatherRainfall').value;
    const weatherHumidity = document.getElementById('weatherHumidity').value;

    fetch('http://localhost:3000/api/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            date: weatherDate, 
            temperature: weatherTemperature, 
            rainfall: weatherRainfall, 
            humidity: weatherHumidity 
        })
    })
    .then(response => response.json())
    .then(data => alert("Weather entry added successfully"))
    .catch(err => alert("Error adding weather entry"));
});

// Load Can_Record Data
function loadCanRecords() {
    const canRecordList = document.getElementById('can-record-list');
    canRecordList.innerHTML = "<p>Loading...</p>";

    fetch('http://localhost:3000/api/can_record')
        .then(response => response.json())
        .then(records => {
            canRecordList.innerHTML = records.map(record => `
                <div>
                    <h3>Field ID: ${record.field_id}</h3>
                    <p>Crop ID: ${record.crop_id}</p>
                </div>
            `).join('');
        })
        .catch(err => canRecordList.innerHTML = "<p>Error loading data.</p>");
}

// Handle Can_Record Form Submission
document.getElementById('canRecordForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const canFieldId = document.getElementById('canFieldId').value;
    const canCropId = document.getElementById('canCropId').value;

    fetch('http://localhost:3000/api/can_record', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            field_id: canFieldId, 
            crop_id: canCropId 
        })
    })
    .then(response => response.json())
    .then(data => alert("Can Record entry added successfully"))
    .catch(err => alert("Error adding Can Record entry"));
});

const apiUrl = "http://localhost:3001/api/weather";
const WEATHER_API_KEY = '88e6953d14d4f76f824407acded13f73'; // Replace with your API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let weatherRecords = [];
let selectedWeatherId = null;
let originalWeatherRecords = [];

// Function to fetch and display weather records
async function fetchWeather() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch weather records");
        }

        originalWeatherRecords = await response.json();
        weatherRecords = [...originalWeatherRecords];
        console.log('Fetched weather records:', weatherRecords);
        displayWeather();
        setupPagination();
    } catch (error) {
        console.error('Error fetching weather records:', error);
        showNotification('Error loading weather records: ' + error.message, 'error');
    }
}

// Function to display weather records in grid
function displayWeather() {
    const grid = document.getElementById('weatherGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedWeather = weatherRecords.slice(startIndex, endIndex);

    grid.innerHTML = paginatedWeather.map(weather => `
        <div class="weather-card">
            <div class="weather-info">
                <div class="weather-header">
                    <div class="weather-main">
                        <div class="weather-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <h3>${weather.location}</h3>
                        </div>
                        <span class="weather-field">Field ID: ${weather.field_id}</span>
                    </div>
                    <div class="weather-id">ID: ${weather.weather_id}</div>
                </div>
                
                <div class="weather-primary">
                    <div class="temperature-display">
                        <span class="temperature-value">${weather.temperature}°</span>
                        <span class="temperature-unit">C</span>
                    </div>
                    <div class="weather-icon">
                        <i class="fas fa-${getWeatherIcon(weather.temperature)}"></i>
                    </div>
                </div>

                <div class="weather-details">
                    <div class="weather-stat">
                        <i class="fas fa-tint"></i>
                        <div class="stat-info">
                            <span class="stat-label">Humidity</span>
                            <div class="stat-value-wrapper">
                                <span class="stat-value">${weather.humidity}</span>
                                <span class="stat-unit">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="weather-actions">
                    <button class="btn-icon refresh" onclick="refreshWeather('${weather.weather_id}')" title="Refresh">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn-icon edit" onclick="editWeather('${weather.weather_id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteWeather('${weather.weather_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to determine weather icon based on temperature
function getWeatherIcon(temperature) {
    if (temperature >= 30) return 'sun';
    if (temperature >= 20) return 'cloud-sun';
    if (temperature >= 10) return 'cloud';
    return 'snowflake';
}

// Function to handle weather form submission
async function handleWeatherSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const weatherData = Object.fromEntries(formData.entries());
    
    const isEdit = event.target.getAttribute('data-mode') === 'edit';
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiUrl}/${weatherData.weather_id}` : apiUrl;
        
        console.log('Request URL:', url);
        console.log('Request Method:', method);
        console.log('Request Data:', weatherData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain'
            },
            body: JSON.stringify({
                weather_id: weatherData.weather_id,
                temperature: parseFloat(weatherData.temperature),
                humidity: parseFloat(weatherData.humidity),
                location: weatherData.location,
                field_id: weatherData.field_id
            })
        });

        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);

        if (!response.ok) {
            throw new Error(rawResponse || 'Failed to save weather record');
        }

        event.target.removeAttribute('data-mode');
        closeModal();
        await fetchWeather();
        showNotification(
            rawResponse || `Weather record ${isEdit ? 'updated' : 'added'} successfully`, 
            'success'
        );
    } catch (error) {
        console.error('Error saving weather record:', error);
        showNotification(`Error saving weather record: ${error.message}`, 'error');
    }
}

// Function to edit weather
async function editWeather(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch weather details');
        
        const weather = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Weather Record';
        document.getElementById('weatherId').value = weather.weather_id;
        document.getElementById('weatherId').readOnly = true;
        document.getElementById('temperature').value = weather.temperature;
        document.getElementById('humidity').value = weather.humidity;
        document.getElementById('location').value = weather.location;
        document.getElementById('fieldId').value = weather.field_id;
        
        document.getElementById('weatherForm').setAttribute('data-mode', 'edit');
        document.getElementById('weatherModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching weather details:', error);
        showNotification('Error loading weather details', 'error');
    }
}

// Function to delete weather
function deleteWeather(id) {
    selectedWeatherId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedWeatherId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete weather record');

        closeDeleteModal();
        fetchWeather();
        showNotification('Weather record deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting weather record:', error);
        showNotification('Error deleting weather record', 'error');
    }
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('weatherModal');
    const form = document.getElementById('weatherForm');
    modal.style.display = 'none';
    form.reset();
    form.removeAttribute('data-mode');
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedWeatherId = null;
}

// Function to search weather records
function searchWeather() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        weatherRecords = [...originalWeatherRecords];
    } else {
        weatherRecords = originalWeatherRecords.filter(weather => 
            weather.weather_id.toString().includes(searchTerm) ||
            weather.field_id.toString().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayWeather();
    setupPagination();
}

// Function to format date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return dateStr;  // Return as is since it's already in YYYY-MM-DD format
}

// Function to set up pagination
function setupPagination() {
    const totalPages = Math.ceil(weatherRecords.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    let paginationHTML = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">${i}</button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }

    paginationHTML += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Function to change page
function changePage(page) {
    const totalPages = Math.ceil(weatherRecords.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayWeather();
    setupPagination();
}

// Function to show notifications
function showNotification(message, type) {
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        alert(message);
    }
}

// Function to open add weather modal
function openAddWeatherModal() {
    const modal = document.getElementById('weatherModal');
    const form = document.getElementById('weatherForm');
    document.getElementById('modalTitle').textContent = 'Add New Weather Record';
    form.reset();
    document.getElementById('weatherId').readOnly = false;
    modal.style.display = 'block';
}

// Function to fetch real-time weather data
async function fetchRealTimeWeather(location) {
    try {
        const response = await fetch(
            `${WEATHER_API_URL}/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`
        );
        if (!response.ok) throw new Error('Failed to fetch weather data');
        
        const data = await response.json();
        return {
            temperature: data.main.temp,
            humidity: data.main.humidity,
            location: location,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            wind_speed: data.wind.speed,
            pressure: data.main.pressure
        };
    } catch (error) {
        console.error('Error fetching real-time weather:', error);
        throw error;
    }
}

// Function to refresh weather data
async function refreshWeather(id) {
    try {
        const weather = weatherRecords.find(w => w.weather_id === id);
        if (!weather) throw new Error('Weather record not found');

        const realTimeData = await fetchRealTimeWeather(weather.location);
        
        // Update the record with real-time data
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...weather,
                temperature: realTimeData.temperature,
                humidity: realTimeData.humidity,
                description: realTimeData.description,
                icon: realTimeData.icon,
                wind_speed: realTimeData.wind_speed,
                pressure: realTimeData.pressure
            })
        });

        if (!response.ok) throw new Error('Failed to update weather data');

        await fetchWeather(); // Refresh the display
        showNotification('Weather data updated successfully', 'success');
    } catch (error) {
        console.error('Error refreshing weather:', error);
        showNotification('Error refreshing weather data', 'error');
    }
}

// Add auto-refresh functionality
let autoRefreshInterval;

function startAutoRefresh() {
    // Refresh every 5 minutes
    autoRefreshInterval = setInterval(() => {
        weatherRecords.forEach(weather => refreshWeather(weather.weather_id));
    }, 5 * 60 * 1000);
}

function stopAutoRefresh() {
    clearInterval(autoRefreshInterval);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    startAutoRefresh();
});

// Clean up on page unload
window.addEventListener('unload', () => {
    stopAutoRefresh();
});

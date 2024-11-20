const apiUrl = "http://localhost:3001/api/soils";

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let soils = [];
let selectedSoilId = null;
let originalSoils = [];

// Function to fetch and display soils
async function fetchSoils() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch soils");
        }

        originalSoils = await response.json();
        soils = [...originalSoils];
        displaySoils();
        setupPagination();
    } catch (error) {
        console.error('Error fetching soils:', error);
        showNotification('Error loading soils: ' + error.message, 'error');
    }
}

// Function to display soils in grid
function displaySoils() {
    const grid = document.getElementById('soilsGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSoils = soils.slice(startIndex, endIndex);

    grid.innerHTML = paginatedSoils.map(soil => `
        <div class="soil-card">
            <div class="soil-info">
                <div class="soil-header">
                    <h3>Soil ${soil.soil_id}</h3>
                    <span class="soil-field">Field: ${soil.field_id}</span>
                </div>
                <div class="soil-details">
                    <p><i class="fas fa-layer-group"></i> Type: ${soil.soil_type}</p>
                    <p><i class="fas fa-flask"></i> pH: ${soil.soil_ph}</p>
                    <p><i class="fas fa-tint"></i> Moisture: ${soil.soil_moisture}%</p>
                </div>
                <div class="soil-actions">
                    <button class="btn-icon" onclick="editSoil('${soil.soil_id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteSoil('${soil.soil_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to handle soil form submission
async function handleSoilSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const soilData = Object.fromEntries(formData.entries());
    
    const isEdit = event.target.getAttribute('data-mode') === 'edit';
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiUrl}/${soilData.soil_id}` : apiUrl;
        
        // Ensure all fields match the database schema exactly
        const requestBody = {
            soil_id: soilData.soil_id,
            soil_type: soilData.soil_type,
            soil_ph: parseFloat(soilData.soil_ph),
            soil_moisture: parseFloat(soilData.soil_moisture),
            field_id: soilData.field_id
        };

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain'
            },
            body: JSON.stringify(requestBody)
        });

        const rawResponse = await response.text();
        if (!response.ok) {
            throw new Error(rawResponse || 'Failed to save soil');
        }

        event.target.removeAttribute('data-mode');
        closeModal();
        await fetchSoils();
        showNotification(
            rawResponse || `Soil ${isEdit ? 'updated' : 'added'} successfully`, 
            'success'
        );
    } catch (error) {
        console.error('Error saving soil:', error);
        showNotification(`Error saving soil: ${error.message}`, 'error');
    }
}

// Function to open add soil modal
function openAddSoilModal() {
    const modal = document.getElementById('soilModal');
    const form = document.getElementById('soilForm');
    document.getElementById('modalTitle').textContent = 'Add New Soil Record';
    form.reset();
    document.getElementById('soilId').readOnly = false;
    modal.style.display = 'block';
}

// Function to edit soil
async function editSoil(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch soil details');
        
        const soil = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Soil Record';
        document.getElementById('soilId').value = soil.soil_id;
        document.getElementById('soilId').readOnly = true;
        document.getElementById('soilType').value = soil.soil_type;
        document.getElementById('soilPh').value = soil.soil_ph;
        document.getElementById('soilMoisture').value = soil.soil_moisture;
        document.getElementById('fieldId').value = soil.field_id;
        
        document.getElementById('soilForm').setAttribute('data-mode', 'edit');
        document.getElementById('soilModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching soil details:', error);
        showNotification('Error loading soil details', 'error');
    }
}

// Function to delete soil
function deleteSoil(id) {
    selectedSoilId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedSoilId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete soil');

        closeDeleteModal();
        fetchSoils();
        showNotification('Soil record deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting soil:', error);
        showNotification('Error deleting soil', 'error');
    }
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('soilModal');
    const form = document.getElementById('soilForm');
    modal.style.display = 'none';
    form.reset();
    form.removeAttribute('data-mode');
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedSoilId = null;
}

// Function to search soils
function searchSoils() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        soils = [...originalSoils];
    } else {
        soils = originalSoils.filter(soil => 
            soil.soil_type.toLowerCase().includes(searchTerm) ||
            soil.soil_id.toString().includes(searchTerm) ||
            soil.field_id.toString().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displaySoils();
    setupPagination();
}

// Function to set up pagination
function setupPagination() {
    const totalPages = Math.ceil(soils.length / itemsPerPage);
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
    const totalPages = Math.ceil(soils.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displaySoils();
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSoils();
});

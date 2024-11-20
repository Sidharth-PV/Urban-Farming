const apiUrl = "http://localhost:3001/api/records";

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let records = [];
let selectedRecordId = null;
let originalRecords = [];
let currentView = 'timeline'; // 'timeline' or 'grid'

// Function to fetch and display records
async function fetchRecords() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch records");
        }

        originalRecords = await response.json();
        records = [...originalRecords];
        console.log('Fetched records:', records);
        if (currentView === 'timeline') {
            displayTimeline();
        } else {
            displayGrid();
        }
        setupPagination();
    } catch (error) {
        console.error('Error fetching records:', error);
        showNotification('Error loading records: ' + error.message, 'error');
    }
}

// Function to display records in timeline view
function displayTimeline() {
    const timeline = document.getElementById('recordsTimeline');
    if (!timeline) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    timeline.innerHTML = paginatedRecords.map(record => `
        <div class="timeline-item">
            <div class="timeline-date">
                <span>${formatDate(record.created_at)}</span>
            </div>
            <div class="timeline-content">
                <div class="record-card">
                    <div class="record-header">
                        <h3>Record ${record.can_record_id}</h3>
                        <span class="record-type">${getRecordType(record)}</span>
                    </div>
                    <div class="record-details">
                        ${record.farmer_id ? `
                            <p><i class="fas fa-user"></i> Farmer ID: ${record.farmer_id}</p>
                        ` : ''}
                        ${record.crop_id ? `
                            <p><i class="fas fa-seedling"></i> Crop ID: ${record.crop_id}</p>
                        ` : ''}
                        ${record.soil_id ? `
                            <p><i class="fas fa-layer-group"></i> Soil ID: ${record.soil_id}</p>
                        ` : ''}
                        ${record.fertilizer_id ? `
                            <p><i class="fas fa-fill-drip"></i> Fertilizer ID: ${record.fertilizer_id}</p>
                        ` : ''}
                        ${record.weather_id ? `
                            <p><i class="fas fa-cloud-sun"></i> Weather ID: ${record.weather_id}</p>
                        ` : ''}
                        ${record.expert_id ? `
                            <p><i class="fas fa-user-tie"></i> Expert ID: ${record.expert_id}</p>
                        ` : ''}
                    </div>
                    <div class="record-actions">
                        <button class="btn-icon view" onclick="viewRecordDetails('${record.can_record_id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteRecord('${record.can_record_id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper function to determine record type
function getRecordType(record) {
    const types = [];
    if (record.farmer_id) types.push('Farmer');
    if (record.crop_id) types.push('Crop');
    if (record.soil_id) types.push('Soil');
    if (record.fertilizer_id) types.push('Fertilizer');
    if (record.weather_id) types.push('Weather');
    if (record.expert_id) types.push('Expert');
    return types.join(', ') || 'General';
}

// Function to display records in grid view
function displayGrid() {
    const grid = document.getElementById('recordsGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    grid.innerHTML = paginatedRecords.map(record => `
        <div class="record-card">
            <div class="record-info">
                <div class="record-header">
                    <h3>Record ${record.can_record_id}</h3>
                    <span class="record-type">${getRecordType(record)}</span>
                </div>
                <div class="record-details">
                    <p><i class="fas fa-user"></i> Farmer: ${record.farmer_id}</p>
                    <p><i class="fas fa-seedling"></i> Crop: ${record.crop_id}</p>
                    <p><i class="fas fa-layer-group"></i> Soil: ${record.soil_id}</p>
                    <p><i class="fas fa-fill-drip"></i> Fertilizer: ${record.fertilizer_id}</p>
                    <p><i class="fas fa-cloud-sun"></i> Weather: ${record.weather_id}</p>
                    <p><i class="fas fa-user-tie"></i> Expert: ${record.expert_id}</p>
                </div>
                <div class="record-actions">
                    <button class="btn-icon view" onclick="viewRecordDetails('${record.can_record_id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteRecord('${record.can_record_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to switch view
function switchView(view) {
    currentView = view;
    document.getElementById('recordsTimeline').style.display = view === 'timeline' ? 'block' : 'none';
    document.getElementById('recordsGrid').style.display = view === 'grid' ? 'grid' : 'none';
    
    // Update active button state
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.classList.toggle('active', btn.onclick.toString().includes(view));
    });

    if (view === 'timeline') {
        displayTimeline();
    } else {
        displayGrid();
    }
}

// Function to view record details
async function viewRecordDetails(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch record details');
        
        const record = await response.json();
        
        // Create and show details modal
        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal';
        detailsModal.id = 'recordDetailsModal';
        
        detailsModal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeDetailsModal()">&times;</span>
                <h2>Record Details</h2>
                <div class="record-full-details">
                    <div class="detail-group">
                        <h3>Basic Information</h3>
                        <p><strong>Record ID:</strong> ${record.can_record_id}</p>
                        <p><strong>Created:</strong> ${formatDate(record.created_at)}</p>
                    </div>
                    <div class="detail-group">
                        <h3>Related Entities</h3>
                        <p><strong>Farmer:</strong> ${record.farmer_id}</p>
                        <p><strong>Crop:</strong> ${record.crop_id}</p>
                        <p><strong>Soil:</strong> ${record.soil_id}</p>
                        <p><strong>Fertilizer:</strong> ${record.fertilizer_id}</p>
                        <p><strong>Weather:</strong> ${record.weather_id}</p>
                        <p><strong>Expert:</strong> ${record.expert_id}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailsModal);
        detailsModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching record details:', error);
        showNotification('Error loading record details', 'error');
    }
}

// Function to close details modal
function closeDetailsModal() {
    const modal = document.getElementById('recordDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// Function to delete record
function deleteRecord(id) {
    selectedRecordId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedRecordId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete record');

        closeDeleteModal();
        fetchRecords();
        showNotification('Record deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting record:', error);
        showNotification('Error deleting record', 'error');
    }
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedRecordId = null;
}

// Function to search records
function searchRecords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        records = [...originalRecords];
    } else {
        records = originalRecords.filter(record => 
            record.can_record_id.toString().includes(searchTerm) ||
            record.farmer_id.toString().includes(searchTerm) ||
            record.crop_id.toString().includes(searchTerm) ||
            record.soil_id.toString().includes(searchTerm) ||
            record.fertilizer_id.toString().includes(searchTerm) ||
            record.weather_id.toString().includes(searchTerm) ||
            record.expert_id.toString().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    if (currentView === 'timeline') {
        displayTimeline();
    } else {
        displayGrid();
    }
    setupPagination();
}

// Function to toggle filter modal
function toggleFilters() {
    const filterModal = document.createElement('div');
    filterModal.className = 'modal';
    filterModal.id = 'filterModal';
    
    filterModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeFilterModal()">&times;</span>
            <h2>Filter Records</h2>
            <form id="filterForm" onsubmit="applyFilters(event)">
                <div class="form-group">
                    <label for="filterFarmerId">Farmer ID:</label>
                    <input type="text" id="filterFarmerId" placeholder="Filter by farmer ID">
                </div>
                <div class="form-group">
                    <label for="filterCropId">Crop ID:</label>
                    <input type="text" id="filterCropId" placeholder="Filter by crop ID">
                </div>
                <div class="form-group">
                    <label>Sort By:</label>
                    <select id="sortBy" class="form-control">
                        <option value="created_at">Date Created</option>
                        <option value="farmer_id">Farmer ID</option>
                        <option value="crop_id">Crop ID</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sort Order:</label>
                    <select id="sortOrder" class="form-control">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Apply Filters</button>
                    <button type="button" class="btn btn-secondary" onclick="resetFilters()">Reset</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(filterModal);
    filterModal.style.display = 'block';
}

// Function to apply filters
function applyFilters(event) {
    event.preventDefault();
    
    const farmerId = document.getElementById('filterFarmerId').value.toLowerCase();
    const cropId = document.getElementById('filterCropId').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;

    let filteredRecords = [...originalRecords];

    // Apply filters
    if (farmerId) {
        filteredRecords = filteredRecords.filter(record => 
            record.farmer_id.toString().toLowerCase().includes(farmerId)
        );
    }

    if (cropId) {
        filteredRecords = filteredRecords.filter(record => 
            record.crop_id.toString().toLowerCase().includes(cropId)
        );
    }

    // Apply sorting
    filteredRecords.sort((a, b) => {
        let compareA = sortBy === 'created_at' ? new Date(a[sortBy]) : a[sortBy].toString().toLowerCase();
        let compareB = sortBy === 'created_at' ? new Date(b[sortBy]) : b[sortBy].toString().toLowerCase();

        if (sortOrder === 'asc') {
            return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        } else {
            return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
        }
    });

    records = filteredRecords;
    currentPage = 1;
    if (currentView === 'timeline') {
        displayTimeline();
    } else {
        displayGrid();
    }
    setupPagination();
    closeFilterModal();
}

// Function to reset filters
function resetFilters() {
    records = [...originalRecords];
    currentPage = 1;
    if (currentView === 'timeline') {
        displayTimeline();
    } else {
        displayGrid();
    }
    setupPagination();
    closeFilterModal();
}

// Helper functions
function closeFilterModal() {
    const filterModal = document.getElementById('filterModal');
    if (filterModal) {
        filterModal.remove();
    }
}

function closeExportModal() {
    const exportModal = document.getElementById('exportModal');
    if (exportModal) {
        exportModal.remove();
    }
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
}

// Function to set up pagination
function setupPagination() {
    const totalPages = Math.ceil(records.length / itemsPerPage);
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
    const totalPages = Math.ceil(records.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    if (currentView === 'timeline') {
        displayTimeline();
    } else {
        displayGrid();
    }
    setupPagination();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchRecords();
});

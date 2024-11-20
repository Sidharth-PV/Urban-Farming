const apiUrl = "http://localhost:3001/api/crops";

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let crops = [];
let selectedCropId = null;
let originalCrops = [];

// Function to fetch and display crops
async function fetchCrops() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch crops");
        }

        originalCrops = await response.json();
        crops = [...originalCrops];
        console.log('Fetched crops:', crops);
        displayCrops();
        setupPagination();
    } catch (error) {
        console.error('Error fetching crops:', error);
        showNotification('Error loading crops: ' + error.message, 'error');
    }
}

// Function to display crops in grid
function displayCrops() {
    const grid = document.getElementById('cropsGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCrops = crops.slice(startIndex, endIndex);

    grid.innerHTML = paginatedCrops.map(crop => `
        <div class="crop-card">
            <div class="crop-info">
                <div class="crop-header">
                    <h3>Crop ${crop.crop_id}</h3>
                    <span class="crop-field">Field: ${crop.field_id}</span>
                </div>
                <div class="crop-details">
                    <p><i class="fas fa-seedling"></i> Variety: ${crop.variety}</p>
                    <p><i class="fas fa-calendar"></i> Planted: ${formatMonth(crop.planted_month)}</p>
                    <p><i class="fas fa-calendar-check"></i> Harvest: ${formatDate(crop.harvesting_date)}</p>
                    <p><i class="fas fa-weight-hanging"></i> Quantity: ${crop.quantity}</p>
                </div>
                <div class="crop-actions">
                    <button class="btn-icon" onclick="editCrop('${crop.crop_id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteCrop('${crop.crop_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to open add crop modal
function openAddCropModal() {
    const modal = document.getElementById('cropModal');
    const form = document.getElementById('cropForm');
    document.getElementById('modalTitle').textContent = 'Add New Crop';
    form.reset();
    document.getElementById('cropId').readOnly = false;
    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('cropModal');
    const form = document.getElementById('cropForm');
    modal.style.display = 'none';
    form.reset();
    form.removeAttribute('data-mode');
}

// Function to handle crop form submission
async function handleCropSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const cropData = Object.fromEntries(formData.entries());
    
    const plantedMonth = cropData.planted_month + '-01'; // Format planted_month to be YYYY-MM-DD
    
    const isEdit = event.target.getAttribute('data-mode') === 'edit';
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiUrl}/${cropData.crop_id}` : apiUrl;
        
        console.log('Request URL:', url);
        console.log('Request Method:', method);
        console.log('Request Data:', cropData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain'
            },
            body: JSON.stringify({
                crop_id: cropData.crop_id,
                variety: cropData.variety,
                planted_month: plantedMonth, // Use the formatted date
                harvesting_date: cropData.harvesting_date,
                quantity: parseInt(cropData.quantity),
                field_id: cropData.field_id
            })
        });

        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);

        if (!response.ok) {
            throw new Error(rawResponse || 'Failed to save crop');
        }

        event.target.removeAttribute('data-mode');
        closeModal();
        await fetchCrops();
        showNotification(
            rawResponse || `Crop ${isEdit ? 'updated' : 'added'} successfully`, 
            'success'
        );
    } catch (error) {
        console.error('Error saving crop:', error);
        showNotification(`Error saving crop: ${error.message}`, 'error');
    }
}

// Function to edit crop
async function editCrop(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch crop details');
        
        const crop = await response.json();
        
        const plantedMonth = crop.planted_month.substring(0, 7); // Format the planted_month back to YYYY-MM format for the input
        
        document.getElementById('modalTitle').textContent = 'Edit Crop';
        document.getElementById('cropId').value = crop.crop_id;
        document.getElementById('cropId').readOnly = true;
        document.getElementById('cropVariety').value = crop.variety;
        document.getElementById('plantedMonth').value = plantedMonth;
        document.getElementById('harvestingDate').value = crop.harvesting_date;
        document.getElementById('quantity').value = crop.quantity;
        document.getElementById('fieldId').value = crop.field_id;
        
        document.getElementById('cropForm').setAttribute('data-mode', 'edit');
        document.getElementById('cropModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching crop details:', error);
        showNotification('Error loading crop details', 'error');
    }
}

// Function to delete crop
function deleteCrop(id) {
    selectedCropId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedCropId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete crop');

        closeDeleteModal();
        fetchCrops();
        showNotification('Crop deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting crop:', error);
        showNotification('Error deleting crop', 'error');
    }
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedCropId = null;
}

// Function to search crops
function searchCrops() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        crops = [...originalCrops];
    } else {
        crops = originalCrops.filter(crop => 
            crop.variety.toLowerCase().includes(searchTerm) ||
            crop.crop_id.toString().includes(searchTerm) ||
            crop.field_id.toString().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayCrops();
    setupPagination();
}

// Function to set up pagination
function setupPagination() {
    const totalPages = Math.ceil(crops.length / itemsPerPage);
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
    const totalPages = Math.ceil(crops.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayCrops();
    setupPagination();
}

// Helper functions for date formatting
function formatMonth(monthStr) {
    if (!monthStr) return 'N/A';
    const date = new Date(monthStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }); // Format YYYY-MM-DD to display as Month YYYY
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return dateStr;  // Return as is since it's already in YYYY-MM-DD format
}

// Function to show notifications
function showNotification(message, type) {
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        alert(message);
    }
}

// Function to toggle filter modal
function toggleFilters() {
    const filterModal = document.createElement('div');
    filterModal.className = 'modal';
    filterModal.id = 'filterModal';
    
    filterModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeFilterModal()">&times;</span>
            <h2>Filter Crops</h2>
            <form id="filterForm" onsubmit="applyFilters(event)">
                <div class="form-group">
                    <label for="filterVariety">Variety:</label>
                    <input type="text" id="filterVariety" placeholder="Filter by variety">
                </div>
                <div class="form-group">
                    <label for="filterFieldId">Field ID:</label>
                    <input type="text" id="filterFieldId" placeholder="Filter by field ID">
                </div>
                <div class="form-group">
                    <label>Sort By:</label>
                    <select id="sortBy" class="form-control">
                        <option value="crop_id">Crop ID</option>
                        <option value="variety">Variety</option>
                        <option value="planted_month">Planted Month</option>
                        <option value="quantity">Quantity</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Sort Order:</label>
                    <select id="sortOrder" class="form-control">
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
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
    
    const variety = document.getElementById('filterVariety').value.toLowerCase();
    const fieldId = document.getElementById('filterFieldId').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;

    let filteredCrops = [...originalCrops];

    // Apply filters
    if (variety) {
        filteredCrops = filteredCrops.filter(crop => 
            crop.variety.toLowerCase().includes(variety)
        );
    }

    if (fieldId) {
        filteredCrops = filteredCrops.filter(crop => 
            crop.field_id.toLowerCase().includes(fieldId)
        );
    }

    // Apply sorting
    filteredCrops.sort((a, b) => {
        let compareA, compareB;

        switch(sortBy) {
            case 'quantity':
                compareA = parseFloat(a[sortBy]);
                compareB = parseFloat(b[sortBy]);
                break;
            case 'planted_month':
                compareA = new Date(a[sortBy]);
                compareB = new Date(b[sortBy]);
                break;
            default:
                compareA = a[sortBy].toString().toLowerCase();
                compareB = b[sortBy].toString().toLowerCase();
        }

        if (sortOrder === 'asc') {
            return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        } else {
            return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
        }
    });

    crops = filteredCrops;
    currentPage = 1;
    displayCrops();
    setupPagination();
    closeFilterModal();
}

// Export functions
function exportCrops() {
    const exportModal = document.createElement('div');
    exportModal.className = 'modal';
    exportModal.id = 'exportModal';
    
    exportModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeExportModal()">&times;</span>
            <h2>Export Crops Data</h2>
            <div class="export-options">
                <button class="btn btn-primary" onclick="exportToCSV()">
                    <i class="fas fa-file-csv"></i> Export to CSV
                </button>
                <button class="btn btn-primary" onclick="exportToJSON()">
                    <i class="fas fa-file-code"></i> Export to JSON
                </button>
                <button class="btn btn-primary" onclick="exportToPDF()">
                    <i class="fas fa-file-pdf"></i> Export to PDF
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(exportModal);
    exportModal.style.display = 'block';
}

function exportToCSV() {
    const headers = ['Crop ID', 'Variety', 'Planted Month', 'Harvesting Date', 'Quantity', 'Field ID'];
    const csvData = crops.map(crop => [
        crop.crop_id,
        crop.variety,
        crop.planted_month,
        crop.harvesting_date,
        crop.quantity,
        crop.field_id
    ]);

    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    downloadFile(csvContent, 'crops_data.csv', 'text/csv');
    closeExportModal();
}

function exportToJSON() {
    const jsonContent = JSON.stringify(crops, null, 2);
    downloadFile(jsonContent, 'crops_data.json', 'application/json');
    closeExportModal();
}

function exportToPDF() {
    const printContent = `
        <html>
        <head>
            <title>Crops Data</title>
            <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f4; }
                h1 { color: #2ecc71; }
            </style>
        </head>
        <body>
            <h1>Crops Data</h1>
            <table>
                <thead>
                    <tr>
                        <th>Crop ID</th>
                        <th>Variety</th>
                        <th>Planted Month</th>
                        <th>Harvesting Date</th>
                        <th>Quantity</th>
                        <th>Field ID</th>
                    </tr>
                </thead>
                <tbody>
                    ${crops.map(crop => `
                        <tr>
                            <td>${crop.crop_id}</td>
                            <td>${crop.variety}</td>
                            <td>${formatMonth(crop.planted_month)}</td>
                            <td>${formatDate(crop.harvesting_date)}</td>
                            <td>${crop.quantity}</td>
                            <td>${crop.field_id}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    closeExportModal();
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

function resetFilters() {
    crops = [...originalCrops];
    currentPage = 1;
    displayCrops();
    setupPagination();
    closeFilterModal();
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchCrops();
});

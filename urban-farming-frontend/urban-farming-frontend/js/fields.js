const apiUrl = "http://localhost:3001/api/fields";

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let fields = [];
let selectedFieldId = null;
let originalFields = [];

// Function to fetch and display fields
async function fetchFields() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch fields");
        }

        // Store both original and working copy of fields
        originalFields = await response.json();
        fields = [...originalFields];
        console.log('Fetched fields:', fields);
        displayFields();
        setupPagination();
    } catch (error) {
        console.error('Error fetching fields:', error);
        showNotification('Error loading fields: ' + error.message, 'error');
    }
}

// Function to display fields in grid
function displayFields() {
    const grid = document.getElementById('fieldsGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFields = fields.slice(startIndex, endIndex);

    grid.innerHTML = paginatedFields.map(field => `
        <div class="field-card">
            <div class="field-info">
                <div class="field-header">
                    <h3>Field ${field.field_id}</h3>
                    <span class="field-farmer">Farmer ID: ${field.farmer_id}</span>
                </div>
                <div class="field-details">
                    <p><i class="fas fa-map-marker-alt"></i> ${field.location}</p>
                    <p><i class="fas fa-ruler-combined"></i> ${field.size} acres</p>
                </div>
                <div class="field-actions">
                    <button class="btn-icon" onclick="editField('${field.field_id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteField('${field.field_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to set up pagination
function setupPagination() {
    const totalPages = Math.ceil(fields.length / itemsPerPage);
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
    const totalPages = Math.ceil(fields.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayFields();
    setupPagination();
}

// Function to open add field modal
function openAddFieldModal() {
    const modal = document.getElementById('fieldModal');
    const form = document.getElementById('fieldForm');
    document.getElementById('modalTitle').textContent = 'Add New Field';
    form.reset();
    document.getElementById('fieldId').readOnly = false;
    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('fieldModal');
    const form = document.getElementById('fieldForm');
    modal.style.display = 'none';
    form.reset();
    form.removeAttribute('data-mode');
}

// Function to handle field form submission
async function handleFieldSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const fieldData = Object.fromEntries(formData.entries());
    
    // Check if this is an edit operation
    const isEdit = event.target.getAttribute('data-mode') === 'edit';
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiUrl}/${fieldData.field_id}` : apiUrl;
        
        console.log('Request URL:', url);
        console.log('Request Method:', method);
        console.log('Request Data:', fieldData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain'
            },
            body: JSON.stringify({
                field_id: fieldData.field_id,
                location: fieldData.location,
                size: parseFloat(fieldData.size),
                farmer_id: fieldData.farmer_id
            })
        });

        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);

        if (!response.ok) {
            throw new Error(rawResponse || 'Failed to save field');
        }

        event.target.removeAttribute('data-mode');
        closeModal();
        await fetchFields();
        showNotification(
            rawResponse || `Field ${isEdit ? 'updated' : 'added'} successfully`, 
            'success'
        );
    } catch (error) {
        console.error('Error saving field:', error);
        showNotification(`Error saving field: ${error.message}`, 'error');
    }
}

// Function to edit field
async function editField(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch field details');
        
        const field = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Field';
        document.getElementById('fieldId').value = field.field_id;
        document.getElementById('fieldId').readOnly = true;
        document.getElementById('fieldLocation').value = field.location;
        document.getElementById('fieldSize').value = field.size;
        document.getElementById('fieldFarmerId').value = field.farmer_id;
        
        document.getElementById('fieldForm').setAttribute('data-mode', 'edit');
        document.getElementById('fieldModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching field details:', error);
        showNotification('Error loading field details', 'error');
    }
}

// Function to delete field
function deleteField(id) {
    selectedFieldId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedFieldId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete field');

        closeDeleteModal();
        fetchFields();
        showNotification('Field deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting field:', error);
        showNotification('Error deleting field', 'error');
    }
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedFieldId = null;
}

// Function to search fields
function searchFields() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        fields = [...originalFields];
    } else {
        fields = originalFields.filter(field => 
            field.location.toLowerCase().includes(searchTerm) ||
            field.field_id.toString().includes(searchTerm) ||
            field.farmer_id.toString().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayFields();
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

// Function to toggle filter modal
function toggleFilters() {
    const filterModal = document.createElement('div');
    filterModal.className = 'modal';
    filterModal.id = 'filterModal';
    
    filterModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeFilterModal()">&times;</span>
            <h2>Filter Fields</h2>
            <form id="filterForm" onsubmit="applyFilters(event)">
                <div class="form-group">
                    <label for="filterLocation">Location:</label>
                    <input type="text" id="filterLocation" placeholder="Filter by location">
                </div>
                <div class="form-group">
                    <label for="filterFarmerId">Farmer ID:</label>
                    <input type="text" id="filterFarmerId" placeholder="Filter by farmer ID">
                </div>
                <div class="form-group">
                    <label>Sort By:</label>
                    <select id="sortBy" class="form-control">
                        <option value="field_id">Field ID</option>
                        <option value="location">Location</option>
                        <option value="size">Size</option>
                        <option value="farmer_id">Farmer ID</option>
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
    
    const location = document.getElementById('filterLocation').value.toLowerCase();
    const farmerId = document.getElementById('filterFarmerId').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;

    let filteredFields = [...originalFields];

    // Apply filters
    if (location) {
        filteredFields = filteredFields.filter(field => 
            field.location.toLowerCase().includes(location)
        );
    }

    if (farmerId) {
        filteredFields = filteredFields.filter(field => 
            field.farmer_id.toLowerCase().includes(farmerId)
        );
    }

    // Apply sorting
    filteredFields.sort((a, b) => {
        let compareA = sortBy === 'size' ? parseFloat(a[sortBy]) : a[sortBy].toString().toLowerCase();
        let compareB = sortBy === 'size' ? parseFloat(b[sortBy]) : b[sortBy].toString().toLowerCase();

        if (sortOrder === 'asc') {
            return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        } else {
            return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
        }
    });

    fields = filteredFields;
    currentPage = 1;
    displayFields();
    setupPagination();
    closeFilterModal();
}

// Export functions
function exportFields() {
    const exportModal = document.createElement('div');
    exportModal.className = 'modal';
    exportModal.id = 'exportModal';
    
    exportModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeExportModal()">&times;</span>
            <h2>Export Fields Data</h2>
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
    const headers = ['Field ID', 'Location', 'Size (acres)', 'Farmer ID'];
    const csvData = fields.map(field => [
        field.field_id,
        field.location,
        field.size,
        field.farmer_id
    ]);

    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    downloadFile(csvContent, 'fields_data.csv', 'text/csv');
    closeExportModal();
}

function exportToJSON() {
    const jsonContent = JSON.stringify(fields, null, 2);
    downloadFile(jsonContent, 'fields_data.json', 'application/json');
    closeExportModal();
}

function exportToPDF() {
    const printContent = `
        <html>
        <head>
            <title>Fields Data</title>
            <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f4; }
                h1 { color: #2ecc71; }
            </style>
        </head>
        <body>
            <h1>Fields Data</h1>
            <table>
                <thead>
                    <tr>
                        <th>Field ID</th>
                        <th>Location</th>
                        <th>Size (acres)</th>
                        <th>Farmer ID</th>
                    </tr>
                </thead>
                <tbody>
                    ${fields.map(field => `
                        <tr>
                            <td>${field.field_id}</td>
                            <td>${field.location}</td>
                            <td>${field.size}</td>
                            <td>${field.farmer_id}</td>
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
    fields = [...originalFields];
    currentPage = 1;
    displayFields();
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
    fetchFields();
});

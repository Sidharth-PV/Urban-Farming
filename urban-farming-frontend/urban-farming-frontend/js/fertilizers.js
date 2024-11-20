const apiUrl = "http://localhost:3001/api/fertilizers";

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let fertilizers = [];
let selectedFertilizerId = null;
let originalFertilizers = [];

// Function to fetch and display fertilizers
async function fetchFertilizers() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch fertilizers");
        }

        originalFertilizers = await response.json();
        fertilizers = [...originalFertilizers];
        console.log('Fetched fertilizers:', fertilizers);
        displayFertilizers();
        setupPagination();
    } catch (error) {
        console.error('Error fetching fertilizers:', error);
        showNotification('Error loading fertilizers: ' + error.message, 'error');
    }
}

// Function to display fertilizers in grid
function displayFertilizers() {
    const grid = document.getElementById('fertilizersGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFertilizers = fertilizers.slice(startIndex, endIndex);

    grid.innerHTML = paginatedFertilizers.map(fertilizer => `
        <div class="fertilizer-card">
            <div class="fertilizer-info">
                <div class="fertilizer-header">
                    <h3>Fertilizer ${fertilizer.fertilizer_id}</h3>
                    <span class="fertilizer-type">${fertilizer.type}</span>
                </div>
                <div class="fertilizer-details">
                    <p><i class="fas fa-tag"></i> Brand: ${fertilizer.brand}</p>
                    <p><i class="fas fa-percentage"></i> Rate: ${fertilizer.rate}</p>
                </div>
                <div class="fertilizer-actions">
                    <button class="btn-icon" onclick="editFertilizer('${fertilizer.fertilizer_id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteFertilizer('${fertilizer.fertilizer_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to handle fertilizer form submission
async function handleFertilizerSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const fertilizerData = Object.fromEntries(formData.entries());
    
    const isEdit = event.target.getAttribute('data-mode') === 'edit';
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiUrl}/${fertilizerData.fertilizer_id}` : apiUrl;
        
        console.log('Request URL:', url);
        console.log('Request Method:', method);
        console.log('Request Data:', fertilizerData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain'
            },
            body: JSON.stringify({
                fertilizer_id: fertilizerData.fertilizer_id,
                type: fertilizerData.type,
                brand: fertilizerData.brand,
                rate: parseFloat(fertilizerData.rate)
            })
        });

        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);

        if (!response.ok) {
            throw new Error(rawResponse || 'Failed to save fertilizer');
        }

        event.target.removeAttribute('data-mode');
        closeModal();
        await fetchFertilizers();
        showNotification(
            rawResponse || `Fertilizer ${isEdit ? 'updated' : 'added'} successfully`, 
            'success'
        );
    } catch (error) {
        console.error('Error saving fertilizer:', error);
        showNotification(`Error saving fertilizer: ${error.message}`, 'error');
    }
}

// Function to open add fertilizer modal
function openAddFertilizerModal() {
    const modal = document.getElementById('fertilizerModal');
    const form = document.getElementById('fertilizerForm');
    document.getElementById('modalTitle').textContent = 'Add New Fertilizer';
    form.reset();
    document.getElementById('fertilizerId').readOnly = false;
    modal.style.display = 'block';
}

// Function to edit fertilizer
async function editFertilizer(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch fertilizer details');
        
        const fertilizer = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Fertilizer';
        document.getElementById('fertilizerId').value = fertilizer.fertilizer_id;
        document.getElementById('fertilizerId').readOnly = true;
        document.getElementById('fertilizerType').value = fertilizer.type;
        document.getElementById('fertilizerBrand').value = fertilizer.brand;
        document.getElementById('fertilizerRate').value = fertilizer.rate;
        
        document.getElementById('fertilizerForm').setAttribute('data-mode', 'edit');
        document.getElementById('fertilizerModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching fertilizer details:', error);
        showNotification('Error loading fertilizer details', 'error');
    }
}

// Function to delete fertilizer
function deleteFertilizer(id) {
    selectedFertilizerId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedFertilizerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete fertilizer');

        closeDeleteModal();
        fetchFertilizers();
        showNotification('Fertilizer deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting fertilizer:', error);
        showNotification('Error deleting fertilizer', 'error');
    }
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('fertilizerModal');
    const form = document.getElementById('fertilizerForm');
    modal.style.display = 'none';
    form.reset();
    form.removeAttribute('data-mode');
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedFertilizerId = null;
}

// Function to search fertilizers
function searchFertilizers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        fertilizers = [...originalFertilizers];
    } else {
        fertilizers = originalFertilizers.filter(fertilizer => 
            fertilizer.fertilizer_id.toString().includes(searchTerm) ||
            fertilizer.crop_id.toString().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayFertilizers();
    setupPagination();
}

// Function to set up pagination
function setupPagination() {
    const totalPages = Math.ceil(fertilizers.length / itemsPerPage);
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
    const totalPages = Math.ceil(fertilizers.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayFertilizers();
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
    fetchFertilizers();
});

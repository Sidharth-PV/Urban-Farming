const apiUrl = "http://localhost:3001/api/advisers";

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let advisers = [];
let selectedAdviserId = null;
let originalAdvisers = [];

// Function to fetch and display advisers
async function fetchAdvisers() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch advisers");
        }

        originalAdvisers = await response.json();
        advisers = [...originalAdvisers];
        console.log('Fetched advisers:', advisers);
        displayAdvisers();
        setupPagination();
    } catch (error) {
        console.error('Error fetching advisers:', error);
        showNotification('Error loading advisers: ' + error.message, 'error');
    }
}

// Function to display advisers in grid
function displayAdvisers() {
    const grid = document.getElementById('advisersGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAdvisers = advisers.slice(startIndex, endIndex);

    grid.innerHTML = paginatedAdvisers.map(adviser => `
        <div class="adviser-card">
            <div class="adviser-info">
                <div class="adviser-header">
                    <div class="adviser-main">
                        <h3>${adviser.name}</h3>
                        <span class="adviser-id">Expert ID: ${adviser.expert_id}</span>
                    </div>
                </div>
                <div class="adviser-details">
                    <div class="adviser-stat">
                        <i class="fas fa-phone"></i>
                        <div class="stat-info">
                            <span class="stat-label">Contact</span>
                            <span class="stat-value">${adviser.contact_no}</span>
                        </div>
                    </div>
                    <div class="adviser-stat">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="stat-info">
                            <span class="stat-label">Address</span>
                            <span class="stat-value">${adviser.address}</span>
                        </div>
                    </div>
                </div>
                <div class="adviser-actions">
                    <button class="btn-icon edit" onclick="editAdviser('${adviser.expert_id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteAdviser('${adviser.expert_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to handle adviser form submission
async function handleAdviserSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const adviserData = Object.fromEntries(formData.entries());
    
    const isEdit = event.target.getAttribute('data-mode') === 'edit';
    
    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiUrl}/${adviserData.expert_id}` : apiUrl;
        
        console.log('Request URL:', url);
        console.log('Request Method:', method);
        console.log('Request Data:', adviserData);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain'
            },
            body: JSON.stringify({
                expert_id: adviserData.expert_id,
                name: adviserData.name,
                contact_no: adviserData.contact_no,
                address: adviserData.address
            })
        });

        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);

        if (!response.ok) {
            throw new Error(rawResponse || 'Failed to save adviser');
        }

        event.target.removeAttribute('data-mode');
        closeModal();
        await fetchAdvisers();
        showNotification(
            rawResponse || `Adviser ${isEdit ? 'updated' : 'added'} successfully`, 
            'success'
        );
    } catch (error) {
        console.error('Error saving adviser:', error);
        showNotification(`Error saving adviser: ${error.message}`, 'error');
    }
}

// Function to open add adviser modal
function openAddAdviserModal() {
    const modal = document.getElementById('adviserModal');
    const form = document.getElementById('adviserForm');
    document.getElementById('modalTitle').textContent = 'Add New Adviser';
    form.reset();
    document.getElementById('expertId').readOnly = false;
    modal.style.display = 'block';
}

// Function to edit adviser
async function editAdviser(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch adviser details');
        
        const adviser = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Adviser';
        document.getElementById('expertId').value = adviser.expert_id;
        document.getElementById('expertId').readOnly = true;
        document.getElementById('adviserName').value = adviser.name;
        document.getElementById('adviserContact').value = adviser.contact_no;
        document.getElementById('adviserAddress').value = adviser.address;
        
        document.getElementById('adviserForm').setAttribute('data-mode', 'edit');
        document.getElementById('adviserModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching adviser details:', error);
        showNotification('Error loading adviser details', 'error');
    }
}

// Function to delete adviser
function deleteAdviser(id) {
    selectedAdviserId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedAdviserId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete adviser');

        closeDeleteModal();
        fetchAdvisers();
        showNotification('Adviser deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting adviser:', error);
        showNotification('Error deleting adviser', 'error');
    }
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('adviserModal');
    const form = document.getElementById('adviserForm');
    modal.style.display = 'none';
    form.reset();
    form.removeAttribute('data-mode');
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedAdviserId = null;
}

// Function to search advisers
function searchAdvisers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        advisers = [...originalAdvisers];
    } else {
        advisers = originalAdvisers.filter(adviser => 
            adviser.name.toLowerCase().includes(searchTerm) ||
            adviser.expert_id.toString().includes(searchTerm) ||
            adviser.contact_no.toLowerCase().includes(searchTerm) ||
            adviser.address.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    displayAdvisers();
    setupPagination();
}

// Function to set up pagination
function setupPagination() {
    const totalPages = Math.ceil(advisers.length / itemsPerPage);
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
    const totalPages = Math.ceil(advisers.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayAdvisers();
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
    fetchAdvisers();
});

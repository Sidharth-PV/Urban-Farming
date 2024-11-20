const apiUrl = "http://localhost:3001/api/farmers";

// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let farmers = [];
let selectedFarmerId = null;
let originalFarmers = [];

// Function to fetch and display farmers
async function fetchFarmers() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch farmers");

        const farmers = await response.json();
        const farmersGrid = document.getElementById("farmersGrid");
        if (!farmersGrid) return;

        farmersGrid.innerHTML = farmers.map(farmer => `
            <div class="farmer-card">
                <div class="farmer-info">
                    <div class="farmer-header">
                        <h3>${farmer.name}</h3>
                        <span class="farmer-id">ID: ${farmer.farmer_id}</span>
                    </div>
                    <div class="farmer-details">
                        <p><i class="fas fa-map-marker-alt"></i> ${farmer.address}</p>
                        <p><i class="fas fa-phone"></i> ${farmer.contact}</p>
                    </div>
                    <div class="farmer-actions">
                        <button class="btn-icon edit" onclick="editFarmer('${farmer.farmer_id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteFarmer('${farmer.farmer_id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching farmers:', error);
        alert('Error loading farmers: ' + error.message);
    }
}

// Function to handle farmer form submission
async function handleFarmerSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const farmerData = {
        farmer_id: formData.get('farmer_id'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        address: formData.get('address')
    };
    
    const isEdit = event.target.getAttribute('data-mode') === 'edit';
    
    try {
        console.log('Sending data:', farmerData);

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiUrl}/${farmerData.farmer_id}` : apiUrl;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(farmerData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to save farmer');
        }

        closeModal();
        await fetchFarmers();
        alert(`Farmer ${isEdit ? 'updated' : 'added'} successfully`);
    } catch (error) {
        console.error('Error details:', error);
        alert('Error saving farmer: ' + error.message);
    }
}

// Function to edit farmer
async function editFarmer(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch farmer details');
        
        const farmer = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Farmer';
        document.getElementById('farmerId').value = farmer.farmer_id;
        document.getElementById('farmerId').readOnly = true;
        document.getElementById('farmerName').value = farmer.name;
        document.getElementById('farmerContact').value = farmer.contact;
        document.getElementById('farmerAddress').value = farmer.address;
        
        document.getElementById('farmerForm').setAttribute('data-mode', 'edit');
        document.getElementById('farmerModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching farmer details:', error);
        alert('Error loading farmer details: ' + error.message);
    }
}

// Function to delete farmer
function deleteFarmer(id) {
    selectedFarmerId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Function to confirm delete
async function confirmDelete() {
    try {
        const response = await fetch(`${apiUrl}/${selectedFarmerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete farmer');

        closeDeleteModal();
        await fetchFarmers();
        alert('Farmer deleted successfully');
    } catch (error) {
        console.error('Error deleting farmer:', error);
        alert('Error deleting farmer: ' + error.message);
    }
}

// Function to open add farmer modal
function openAddFarmerModal() {
    const modal = document.getElementById('farmerModal');
    const form = document.getElementById('farmerForm');
    document.getElementById('modalTitle').textContent = 'Add New Farmer';
    form.reset();
    document.getElementById('farmerId').readOnly = false;
    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('farmerModal');
    const form = document.getElementById('farmerForm');
    modal.style.display = 'none';
    form.reset();
    form.removeAttribute('data-mode');
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedFarmerId = null;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchFarmers();
});
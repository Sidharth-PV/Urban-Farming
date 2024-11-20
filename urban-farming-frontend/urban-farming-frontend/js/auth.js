// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const loginData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        
        // Store the token and role
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Redirect based on role
        if (data.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const signupData = Object.fromEntries(formData.entries());

    if (signupData.password !== signupData.confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: signupData.username,
                password: signupData.password
            })
        });

        if (!response.ok) {
            throw new Error('Signup failed');
        }

        alert('Account created successfully! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
} 
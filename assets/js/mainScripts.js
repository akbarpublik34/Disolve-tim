// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeCases();
    updateStats();
    setupSearchListener();
});

// Storage helper
const storage = {
    getCases: function() {
        const cases = localStorage.getItem('medicalCases');
        return cases ? JSON.parse(cases) : [];
    },
    
    saveCases: function(cases) {
        localStorage.setItem('medicalCases', JSON.stringify(cases));
    },
    
    addCase: function(caseData) {
        const cases = this.getCases();
        caseData.id = 'CASE-' + Date.now();
        caseData.createdAt = new Date().toISOString();
        caseData.updatedAt = new Date().toISOString();
        cases.push(caseData);
        this.saveCases(cases);
        return caseData;
    },
    
    updateCase: function(id, updatedData) {
        const cases = this.getCases();
        const index = cases.findIndex(c => c.id === id);
        if (index !== -1) {
            cases[index] = { ...cases[index], ...updatedData, updatedAt: new Date().toISOString() };
            this.saveCases(cases);
            return cases[index];
        }
        return null;
    },
    
    deleteCase: function(id) {
        const cases = this.getCases();
        const filtered = cases.filter(c => c.id !== id);
        this.saveCases(filtered);
        return true;
    },
    
    getCase: function(id) {
        const cases = this.getCases();
        return cases.find(c => c.id === id);
    }
};

// Initialize sample data if none exists
function initializeCases() {
    const cases = storage.getCases();
    
    if (cases.length === 0) {
        const sampleCases = [
            {
                id: 'CASE-001',
                patientName: 'John Doe',
                patientAge: 45,
                patientGender: 'Male',
                diagnosis: 'Type 2 Diabetes Mellitus',
                description: 'Patient presented with polyuria, polydipsia, and unexplained weight loss over the past 3 months.',
                status: 'active',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'CASE-002',
                patientName: 'Jane Smith',
                patientAge: 32,
                patientGender: 'Female',
                diagnosis: 'Acute Appendicitis',
                description: 'Emergency case presenting with acute right lower quadrant pain, nausea, and fever.',
                status: 'closed',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        storage.saveCases(sampleCases);
    }
    
    displayCases(storage.getCases());
}

// Display cases in the grid
function displayCases(cases) {
    const casesList = document.getElementById('casesList');
    
    if (!casesList) return;
    
    if (cases.length === 0) {
        casesList.innerHTML = '<div class="empty-state"><p>No cases found. Add your first case to get started.</p></div>';
        return;
    }
    
    casesList.innerHTML = cases.map(caseData => `
        <div class="case-card">
            <div class="case-header">
                <span class="case-id">${caseData.id}</span>
                <span class="case-status status-${caseData.status}">${caseData.status.toUpperCase()}</span>
            </div>
            <h3 class="case-title">${caseData.diagnosis}</h3>
            <p class="case-patient">Patient: ${caseData.patientName}, ${caseData.patientAge} years, ${caseData.patientGender}</p>
            <p class="case-description">${caseData.description}</p>
            <div class="case-footer">
                <span class="case-date">${formatDate(caseData.updatedAt)}</span>
                <div class="case-actions">
                    <a href="./pages/viewCase.html?id=${caseData.id}" class="btn btn-secondary">View</a>
                    <a href="./pages/editCase.html?id=${caseData.id}" class="btn btn-primary">Edit</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const cases = storage.getCases();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalCases = cases.length;
    const recentCases = cases.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;
    const activeCases = cases.filter(c => c.status === 'active').length;
    
    const totalCasesEl = document.getElementById('totalCases');
    const recentCasesEl = document.getElementById('recentCases');
    const activeCasesEl = document.getElementById('activeCases');
    
    if (totalCasesEl) totalCasesEl.textContent = totalCases;
    if (recentCasesEl) recentCasesEl.textContent = recentCases;
    if (activeCasesEl) activeCasesEl.textContent = activeCases;
}

// Search functionality
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cases = storage.getCases();
        
        const filtered = cases.filter(c => 
            c.patientName.toLowerCase().includes(searchTerm) ||
            c.diagnosis.toLowerCase().includes(searchTerm) ||
            c.description.toLowerCase().includes(searchTerm) ||
            c.id.toLowerCase().includes(searchTerm)
        );
        
        displayCases(filtered);
    });
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
    
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Export for use in other pages
window.medicalRepo = {
    storage: storage,
    formatDate: formatDate
};
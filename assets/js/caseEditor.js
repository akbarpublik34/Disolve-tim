// Handle Add Case Form
document.addEventListener('DOMContentLoaded', function() {
    const addCaseForm = document.getElementById('addCaseForm');
    const editCaseForm = document.getElementById('editCaseForm');
    
    if (addCaseForm) {
        addCaseForm.addEventListener('submit', handleAddCase);
    }
    
    if (editCaseForm) {
        loadCaseForEdit();
        editCaseForm.addEventListener('submit', handleEditCase);
    }
});

// Add new case
function handleAddCase(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const caseData = {
        patientName: formData.get('patientName'),
        patientAge: parseInt(formData.get('patientAge')),
        patientGender: formData.get('patientGender'),
        diagnosis: formData.get('diagnosis'),
        description: formData.get('description'),
        treatment: formData.get('treatment') || '',
        notes: formData.get('notes') || '',
        status: formData.get('status')
    };
    
    // Validate required fields
    if (!caseData.patientName || !caseData.patientAge || !caseData.patientGender || 
        !caseData.diagnosis || !caseData.description || !caseData.status) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Save the case
    window.medicalRepo.storage.addCase(caseData);
    
    // Redirect to dashboard
    alert('Case added successfully!');
    window.location.href = '../index.html';
}

// Load case data for editing
function loadCaseForEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');
    
    if (!caseId) {
        alert('No case ID provided');
        window.location.href = '../index.html';
        return;
    }
    
    const caseData = window.medicalRepo.storage.getCase(caseId);
    
    if (!caseData) {
        alert('Case not found');
        window.location.href = '../index.html';
        return;
    }
    
    // Populate form fields
    document.getElementById('patientName').value = caseData.patientName;
    document.getElementById('patientAge').value = caseData.patientAge;
    document.getElementById('patientGender').value = caseData.patientGender;
    document.getElementById('diagnosis').value = caseData.diagnosis;
    document.getElementById('description').value = caseData.description;
    document.getElementById('treatment').value = caseData.treatment || '';
    document.getElementById('notes').value = caseData.notes || '';
    document.getElementById('status').value = caseData.status;
    
    // Store case ID for update
    document.getElementById('editCaseForm').dataset.caseId = caseId;
}

// Update existing case
function handleEditCase(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const caseId = e.target.dataset.caseId;
    
    const updatedData = {
        patientName: formData.get('patientName'),
        patientAge: parseInt(formData.get('patientAge')),
        patientGender: formData.get('patientGender'),
        diagnosis: formData.get('diagnosis'),
        description: formData.get('description'),
        treatment: formData.get('treatment') || '',
        notes: formData.get('notes') || '',
        status: formData.get('status')
    };
    
    // Validate required fields
    if (!updatedData.patientName || !updatedData.patientAge || !updatedData.patientGender || 
        !updatedData.diagnosis || !updatedData.description || !updatedData.status) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update the case
    window.medicalRepo.storage.updateCase(caseId, updatedData);
    
    // Redirect to view page
    alert('Case updated successfully!');
    window.location.href = `viewCase.html?id=${caseId}`;
}
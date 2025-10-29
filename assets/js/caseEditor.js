document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addCaseForm');
    const editForm = document.getElementById('editCaseForm');
    
    if (addForm) {
        addForm.addEventListener('submit', handleAddCase);
    }
    
    if (editForm) {
        loadCaseForEdit();
        editForm.addEventListener('submit', handleEditCase);
    }
});

// Add Case
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
        status: formData.get('status'),
        priority: 'medium'
    };
    
    StorageHelper.addCase(caseData);
    alert('Kasus berhasil ditambahkan!');
    window.location.href = '../index.html';
}

// Load for Edit
function loadCaseForEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');
    
    if (!caseId) {
        alert('ID kasus tidak ditemukan');
        window.location.href = '../index.html';
        return;
    }
    
    const caseData = StorageHelper.getCase(caseId);
    
    if (!caseData) {
        alert('Kasus tidak ditemukan');
        window.location.href = '../index.html';
        return;
    }
    
    // Populate form
    document.querySelector('[name="patientName"]').value = caseData.patientName;
    document.querySelector('[name="patientAge"]').value = caseData.patientAge;
    document.querySelector('[name="patientGender"]').value = caseData.patientGender;
    document.querySelector('[name="diagnosis"]').value = caseData.diagnosis;
    document.querySelector('[name="description"]').value = caseData.description;
    document.querySelector('[name="treatment"]').value = caseData.treatment || '';
    document.querySelector('[name="notes"]').value = caseData.notes || '';
    document.querySelector('[name="status"]').value = caseData.status;
    
    document.getElementById('editCaseForm').dataset.caseId = caseId;
}

// Update Case
function handleEditCase(e) {
    e.preventDefault();
    const caseId = e.target.dataset.caseId;
    const formData = new FormData(e.target);
    
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
    
    StorageHelper.updateCase(caseId, updatedData);
    alert('Kasus berhasil diperbarui!');
    window.location.href = `viewCase.html?id=${caseId}`;
}
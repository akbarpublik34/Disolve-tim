


/**
 * Dashboard Controller for JKN Medical Case Repository
 * Handles dashboard initialization, stats, filtering, and real-time updates
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadRecentActivity();
});

// Current state
let currentFilters = {
    status: '',
    dateRange: 'all',
    search: '',
    ageMin: null,
    ageMax: null,
    gender: [],
    diagnosis: '',
    priority: ''
};

let currentView = 'grid';
let currentPage = 1;
const itemsPerPage = 9;

// Initialize dashboard
function initializeDashboard() {
    updateStatistics();
    displayCases();
    updateNotificationCount();
    loadGamificationStatus();
}

// Update statistics cards
function updateStatistics() {
    const stats = StorageHelper.getStatistics();
    
    document.getElementById('totalCases').textContent = stats.totalCases;
    document.getElementById('activeCases').textContent = stats.activeCases;
    document.getElementById('queueCount').textContent = stats.queueCount;
    document.getElementById('claimsPending').textContent = stats.claimsPending;
}

// Display cases with current filters
function displayCases() {
    const cases = getFilteredCases();
    const casesList = document.getElementById('casesList');
    
    if (!casesList) return;
    
    if (cases.length === 0) {
        casesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Tidak ada kasus ditemukan</h3>
                <p>Coba ubah filter atau tambahkan kasus baru</p>
                <a href="./pages/addCase.html" class="btn btn-primary">Tambah Kasus</a>
            </div>
        `;
        casesList.className = 'cases-grid empty';
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCases = cases.slice(startIndex, endIndex);
    
    // Apply view mode
    casesList.className = currentView === 'grid' ? 'cases-grid' : 'cases-list';
    
    casesList.innerHTML = paginatedCases.map(caseData => {
        const statusClass = getStatusClass(caseData.status);
        const priorityIcon = getPriorityIcon(caseData.priority);
        const daysAgo = getDaysAgo(caseData.updatedAt);
        
        if (currentView === 'grid') {
            return `
                <div class="case-card" data-case-id="${caseData.id}">
                    <div class="case-header">
                        <div class="case-meta">
                            <span class="case-id">${caseData.id}</span>
                            <span class="jkn-number">${caseData.jknNumber}</span>
                        </div>
                        <div class="case-badges">
                            <span class="priority-badge ${caseData.priority}">${priorityIcon}</span>
                            <span class="case-status ${statusClass}">${getStatusLabel(caseData.status)}</span>
                        </div>
                    </div>
                    
                    <h3 class="case-title">${caseData.diagnosis}</h3>
                    
                    <div class="patient-info">
                        <div class="info-item">
                            <span class="info-icon">👤</span>
                            <span>${caseData.patientName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🎂</span>
                            <span>${caseData.patientAge} tahun</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">${caseData.patientGender === 'Male' ? '♂️' : '♀️'}</span>
                            <span>${caseData.patientGender}</span>
                        </div>
                    </div>
                    
                    <p class="case-description">${caseData.description}</p>
                    
                    <div class="case-footer">
                        <div class="case-meta-info">
                            <span class="time-ago">📅 ${daysAgo}</span>
                            ${caseData.claimStatus ? `<span class="claim-status">${getClaimStatusBadge(caseData.claimStatus)}</span>` : ''}
                        </div>
                        <div class="case-actions">
                            <button class="btn-icon" onclick="viewCase('${caseData.id}')" title="Lihat Detail">
                                👁️
                            </button>
                            <button class="btn-icon" onclick="editCase('${caseData.id}')" title="Edit">
                                ✏️
                            </button>
                            <button class="btn-icon btn-danger" onclick="deleteCase('${caseData.id}')" title="Hapus">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="case-row" data-case-id="${caseData.id}">
                    <div class="row-main">
                        <div class="row-info">
                            <h4>${caseData.diagnosis}</h4>
                            <p>${caseData.patientName} - ${caseData.patientAge} tahun - ${caseData.patientGender}</p>
                        </div>
                        <div class="row-badges">
                            <span class="priority-badge ${caseData.priority}">${priorityIcon}</span>
                            <span class="case-status ${statusClass}">${getStatusLabel(caseData.status)}</span>
                        </div>
                        <div class="row-actions">
                            <button class="btn btn-sm btn-secondary" onclick="viewCase('${caseData.id}')">Lihat</button>
                            <button class="btn btn-sm btn-primary" onclick="editCase('${caseData.id}')">Edit</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');
    
    // Update pagination
    updatePagination(cases.length);
}

// Get filtered cases
function getFilteredCases() {
    let cases = StorageHelper.getCases();
    
    // Apply status filter
    if (currentFilters.status) {
        cases = cases.filter(c => c.status === currentFilters.status);
    }
    
    // Apply date filter
    if (currentFilters.dateRange !== 'all') {
        const now = new Date();
        let filterDate;
        
        switch(currentFilters.dateRange) {
            case 'today':
                filterDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }
        
        if (filterDate) {
            cases = cases.filter(c => new Date(c.createdAt) >= filterDate);
        }
    }
    
    // Apply search filter
    if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        cases = cases.filter(c =>
            c.patientName.toLowerCase().includes(searchLower) ||
            c.diagnosis.toLowerCase().includes(searchLower) ||
            c.description.toLowerCase().includes(searchLower) ||
            c.id.toLowerCase().includes(searchLower) ||
            (c.jknNumber && c.jknNumber.toLowerCase().includes(searchLower))
        );
    }
    
    // Apply age filter
    if (currentFilters.ageMin !== null) {
        cases = cases.filter(c => c.patientAge >= currentFilters.ageMin);
    }
    if (currentFilters.ageMax !== null) {
        cases = cases.filter(c => c.patientAge <= currentFilters.ageMax);
    }
    
    // Apply gender filter
    if (currentFilters.gender.length > 0) {
        cases = cases.filter(c => currentFilters.gender.includes(c.patientGender));
    }
    
    // Apply diagnosis filter
    if (currentFilters.diagnosis) {
        const diagnosisLower = currentFilters.diagnosis.toLowerCase();
        cases = cases.filter(c => c.diagnosis.toLowerCase().includes(diagnosisLower));
    }
    
    // Apply priority filter
    if (currentFilters.priority) {
        cases = cases.filter(c => c.priority === currentFilters.priority);
    }
    
    return cases;
}

// Update pagination
function updatePagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">‹ Prev</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span>...</span>';
        }
    }
    
    // Next button
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next ›</button>`;
    
    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayCases();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                currentPage = 1;
                displayCases();
            }, 300);
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function(e) {
            currentFilters.status = e.target.value;
            currentPage = 1;
            displayCases();
        });
    }
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function(e) {
            currentFilters.dateRange = e.target.value;
            currentPage = 1;
            displayCases();
        });
    }
    
    // View toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            displayCases();
        });
    });
    
    // Advanced filter modal
    const advancedFilterBtn = document.getElementById('advancedFilter');
    const advancedFilterModal = document.getElementById('advancedFilterModal');
    
    if (advancedFilterBtn && advancedFilterModal) {
        advancedFilterBtn.addEventListener('click', () => {
            advancedFilterModal.classList.add('open');
        });
        
        const closeModal = advancedFilterModal.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                advancedFilterModal.classList.remove('open');
            });
        }
        
        // Apply filters
        const applyFilters = document.getElementById('applyFilters');
        if (applyFilters) {
            applyFilters.addEventListener('click', applyAdvancedFilters);
        }
        
        // Reset filters
        const resetFilters = document.getElementById('resetFilters');
        if (resetFilters) {
            resetFilters.addEventListener('click', resetAllFilters);
        }
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Notification bell
    const notifBell = document.getElementById('notifBell');
    const notificationPanel = document.getElementById('notificationPanel');
    
    if (notifBell && notificationPanel) {
        notifBell.addEventListener('click', () => {
            notificationPanel.classList.toggle('open');
            loadNotifications();
        });
        
        const closePanel = notificationPanel.querySelector('.close-panel');
        if (closePanel) {
            closePanel.addEventListener('click', () => {
                notificationPanel.classList.remove('open');
            });
        }
    }
}

// Apply advanced filters
function applyAdvancedFilters() {
    const ageMin = document.getElementById('ageMin').value;
    const ageMax = document.getElementById('ageMax').value;
    const diagnosis = document.getElementById('diagnosisFilter').value;
    const priority = document.getElementById('claimPriority').value;
    
    currentFilters.ageMin = ageMin ? parseInt(ageMin) : null;
    currentFilters.ageMax = ageMax ? parseInt(ageMax) : null;
    currentFilters.diagnosis = diagnosis;
    currentFilters.priority = priority;
    
    // Get selected genders
    const genderCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    currentFilters.gender = Array.from(genderCheckboxes).map(cb => cb.value);
    
    currentPage = 1;
    displayCases();
    
    document.getElementById('advancedFilterModal').classList.remove('open');
}

// Reset all filters
function resetAllFilters() {
    currentFilters = {
        status: '',
        dateRange: 'all',
        search: '',
        ageMin: null,
        ageMax: null,
        gender: [],
        diagnosis: '',
        priority: ''
    };
    
    // Reset form fields
    document.getElementById('ageMin').value = '';
    document.getElementById('ageMax').value = '';
    document.getElementById('diagnosisFilter').value = '';
    document.getElementById('claimPriority').value = '';
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = 'all';
    
    currentPage = 1;
    displayCases();
    
    document.getElementById('advancedFilterModal').classList.remove('open');
}

// Load recent activity
function loadRecentActivity() {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;
    
    const activities = StorageHelper.getActivities().slice(0, 5);
    
    if (activities.length === 0) {
        activityFeed.innerHTML = '<p class="empty-message">Belum ada aktivitas</p>';
        return;
    }
    
    activityFeed.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${getActivityIcon(activity.type)}</div>
            <div class="activity-content">
                <h4>${activity.message}</h4>
                <p>${activity.user}</p>
            </div>
            <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
        </div>
    `).join('');
}

// Load notifications
function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const notifications = StorageHelper.getNotifications();
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p class="empty-message">Tidak ada notifikasi</p>';
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="markAsRead('${notif.id}')">
            <h4>${notif.title}</h4>
            <p>${notif.message}</p>
            <span class="time">${formatTimeAgo(notif.timestamp)}</span>
        </div>
    `).join('');
}

// Update notification count
function updateNotificationCount() {
    const count = StorageHelper.getUnreadCount();
    const notifCount = document.getElementById('notifCount');
    
    if (notifCount) {
        notifCount.textContent = count;
        notifCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Mark notification as read
function markAsRead(id) {
    StorageHelper.markNotificationAsRead(id);
    loadNotifications();
    updateNotificationCount();
}

// Load gamification status
function loadGamificationStatus() {
    const data = StorageHelper.getGamificationData();
    // You can display this in a widget or profile section
    console.log('Gamification:', data);
}

// Export data
function exportData() {
    const data = StorageHelper.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jkn-medical-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    StorageHelper.addNotification({
        title: 'Data Exported',
        message: 'Data berhasil diekspor',
        type: 'success'
    });
}

// Global functions for case actions
window.viewCase = function(id) {
    window.location.href = `./pages/viewCase.html?id=${id}`;
};

window.editCase = function(id) {
    window.location.href = `./pages/editCase.html?id=${id}`;
};

window.deleteCase = function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus kasus ini?')) {
        StorageHelper.deleteCase(id);
        displayCases();
        updateStatistics();
        
        StorageHelper.addNotification({
            title: 'Kasus Dihapus',
            message: 'Kasus berhasil dihapus',
            type: 'info'
        });
    }
};

window.changePage = changePage;

// Utility functions
function getStatusClass(status) {
    const classes = {
        'active': 'status-active',
        'closed': 'status-closed',
        'pending': 'status-pending'
    };
    return classes[status] || 'status-default';
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Aktif',
        'closed': 'Selesai',
        'pending': 'Menunggu'
    };
    return labels[status] || status;
}

function getPriorityIcon(priority) {
    const icons = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢'
    };
    return icons[priority] || '⚪';
}

function getClaimStatusBadge(status) {
    const badges = {
        'pending': '⏳ Pending',
        'processing': '⚙️ Diproses',
        'approved': '✅ Disetujui',
        'rejected': '❌ Ditolak'
    };
    return badges[status] || status;
}

function getActivityIcon(type) {
    const icons = {
        'case_created': '➕',
        'case_updated': '✏️',
        'case_deleted': '🗑️',
        'claim_submitted': '💰',
        'queue_added': '📅'
    };
    return icons[type] || '📋';
}

function getDaysAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return date.toLocaleDateString('id-ID');
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID');
}
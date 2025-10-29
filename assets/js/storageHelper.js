/**
 * Advanced Storage Helper for JKN Medical Case Repository
 * Handles all data persistence, indexedDB for large datasets, and backup/restore
 */

const StorageHelper = {
    // Storage keys
    KEYS: {
        CASES: 'jkn_medical_cases',
        QUEUE: 'jkn_queue_data',
        CLAIMS: 'jkn_claims_data',
        PATIENTS: 'jkn_patients_data',
        ANALYTICS: 'jkn_analytics_data',
        SETTINGS: 'jkn_user_settings',
        NOTIFICATIONS: 'jkn_notifications',
        ACTIVITIES: 'jkn_activities',
        GAMIFICATION: 'jkn_gamification_points'
    },

    // Initialize storage with sample data if empty
    init: function() {
        if (!this.getCases().length) {
            this.seedSampleData();
        }
        
        // Initialize other data structures
        if (!localStorage.getItem(this.KEYS.QUEUE)) {
            this.saveQueue([]);
        }
        if (!localStorage.getItem(this.KEYS.CLAIMS)) {
            this.saveClaims([]);
        }
        if (!localStorage.getItem(this.KEYS.NOTIFICATIONS)) {
            this.saveNotifications([]);
        }
        if (!localStorage.getItem(this.KEYS.ACTIVITIES)) {
            this.saveActivities([]);
        }
        if (!localStorage.getItem(this.KEYS.GAMIFICATION)) {
            this.saveGamificationData({ points: 0, level: 1, achievements: [] });
        }
    },

    // Cases Management
    getCases: function() {
        try {
            const cases = localStorage.getItem(this.KEYS.CASES);
            return cases ? JSON.parse(cases) : [];
        } catch (error) {
            console.error('Error getting cases:', error);
            return [];
        }
    },

    saveCases: function(cases) {
        try {
            localStorage.setItem(this.KEYS.CASES, JSON.stringify(cases));
            return true;
        } catch (error) {
            console.error('Error saving cases:', error);
            return false;
        }
    },

    addCase: function(caseData) {
        const cases = this.getCases();
        const newCase = {
            ...caseData,
            id: 'CASE-' + Date.now(),
            jknNumber: this.generateJKNNumber(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            claimStatus: 'pending',
            priority: caseData.priority || 'medium'
        };
        
        cases.unshift(newCase);
        this.saveCases(cases);
        
        // Add to activity log
        this.addActivity({
            type: 'case_created',
            message: `Kasus baru ditambahkan: ${caseData.patientName}`,
            caseId: newCase.id
        });
        
        // Add gamification points
        this.addPoints(10, 'Menambahkan kasus baru');
        
        return newCase;
    },

    updateCase: function(id, updatedData) {
        const cases = this.getCases();
        const index = cases.findIndex(c => c.id === id);
        
        if (index !== -1) {
            cases[index] = {
                ...cases[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveCases(cases);
            
            this.addActivity({
                type: 'case_updated',
                message: `Kasus diperbarui: ${cases[index].patientName}`,
                caseId: id
            });
            
            this.addPoints(5, 'Memperbarui kasus');
            
            return cases[index];
        }
        return null;
    },

    deleteCase: function(id) {
        const cases = this.getCases();
        const filtered = cases.filter(c => c.id !== id);
        
        if (filtered.length < cases.length) {
            this.saveCases(filtered);
            this.addActivity({
                type: 'case_deleted',
                message: 'Kasus dihapus',
                caseId: id
            });
            return true;
        }
        return false;
    },

    getCase: function(id) {
        const cases = this.getCases();
        return cases.find(c => c.id === id);
    },

    // Queue Management
    getQueue: function() {
        try {
            const queue = localStorage.getItem(this.KEYS.QUEUE);
            return queue ? JSON.parse(queue) : [];
        } catch (error) {
            console.error('Error getting queue:', error);
            return [];
        }
    },

    saveQueue: function(queue) {
        localStorage.setItem(this.KEYS.QUEUE, JSON.stringify(queue));
    },

    addToQueue: function(queueData) {
        const queue = this.getQueue();
        const newQueueItem = {
            ...queueData,
            id: 'QUEUE-' + Date.now(),
            queueNumber: queue.length + 1,
            status: 'waiting',
            createdAt: new Date().toISOString()
        };
        
        queue.push(newQueueItem);
        this.saveQueue(queue);
        
        this.addActivity({
            type: 'queue_added',
            message: `Pasien ditambahkan ke antrean: ${queueData.patientName}`,
            queueId: newQueueItem.id
        });
        
        this.addNotification({
            title: 'Antrean Baru',
            message: `${queueData.patientName} ditambahkan ke antrean`,
            type: 'info'
        });
        
        this.addPoints(5, 'Mengelola antrean');
        
        return newQueueItem;
    },

    updateQueueStatus: function(id, status) {
        const queue = this.getQueue();
        const item = queue.find(q => q.id === id);
        
        if (item) {
            item.status = status;
            item.updatedAt = new Date().toISOString();
            this.saveQueue(queue);
            return true;
        }
        return false;
    },

    // Claims Management
    getClaims: function() {
        try {
            const claims = localStorage.getItem(this.KEYS.CLAIMS);
            return claims ? JSON.parse(claims) : [];
        } catch (error) {
            console.error('Error getting claims:', error);
            return [];
        }
    },

    saveClaims: function(claims) {
        localStorage.setItem(this.KEYS.CLAIMS, JSON.stringify(claims));
    },

    addClaim: function(claimData) {
        const claims = this.getClaims();
        const newClaim = {
            ...claimData,
            id: 'CLAIM-' + Date.now(),
            claimNumber: 'JKN-' + Date.now(),
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            estimatedProcessingTime: this.calculateProcessingTime(claimData)
        };
        
        claims.unshift(newClaim);
        this.saveClaims(claims);
        
        this.addActivity({
            type: 'claim_submitted',
            message: `Klaim diajukan: ${claimData.claimNumber}`,
            claimId: newClaim.id
        });
        
        this.addNotification({
            title: 'Klaim Diajukan',
            message: `Klaim ${newClaim.claimNumber} berhasil diajukan`,
            type: 'success'
        });
        
        this.addPoints(15, 'Mengajukan klaim');
        
        return newClaim;
    },

    updateClaimStatus: function(id, status) {
        const claims = this.getClaims();
        const claim = claims.find(c => c.id === id);
        
        if (claim) {
            claim.status = status;
            claim.updatedAt = new Date().toISOString();
            
            if (status === 'approved') {
                claim.approvedAt = new Date().toISOString();
                this.addPoints(20, 'Klaim disetujui');
            }
            
            this.saveClaims(claims);
            this.addNotification({
                title: 'Update Klaim',
                message: `Status klaim ${claim.claimNumber}: ${status}`,
                type: status === 'approved' ? 'success' : 'info'
            });
            
            return true;
        }
        return false;
    },

    // Notifications Management
    getNotifications: function() {
        try {
            const notifications = localStorage.getItem(this.KEYS.NOTIFICATIONS);
            return notifications ? JSON.parse(notifications) : [];
        } catch (error) {
            return [];
        }
    },

    saveNotifications: function(notifications) {
        localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    },

    addNotification: function(notificationData) {
        const notifications = this.getNotifications();
        const newNotification = {
            ...notificationData,
            id: 'NOTIF-' + Date.now(),
            read: false,
            timestamp: new Date().toISOString()
        };
        
        notifications.unshift(newNotification);
        
        // Keep only last 50 notifications
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        this.saveNotifications(notifications);
        return newNotification;
    },

    markNotificationAsRead: function(id) {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === id);
        
        if (notification) {
            notification.read = true;
            this.saveNotifications(notifications);
            return true;
        }
        return false;
    },

    getUnreadCount: function() {
        const notifications = this.getNotifications();
        return notifications.filter(n => !n.read).length;
    },

    // Activity Log
    getActivities: function() {
        try {
            const activities = localStorage.getItem(this.KEYS.ACTIVITIES);
            return activities ? JSON.parse(activities) : [];
        } catch (error) {
            return [];
        }
    },

    saveActivities: function(activities) {
        localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(activities));
    },

    addActivity: function(activityData) {
        const activities = this.getActivities();
        const newActivity = {
            ...activityData,
            id: 'ACTIVITY-' + Date.now(),
            timestamp: new Date().toISOString(),
            user: 'dr. User' // In production, get from auth
        };
        
        activities.unshift(newActivity);
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.splice(100);
        }
        
        this.saveActivities(activities);
    },

    // Gamification
    getGamificationData: function() {
        try {
            const data = localStorage.getItem(this.KEYS.GAMIFICATION);
            return data ? JSON.parse(data) : { points: 0, level: 1, achievements: [] };
        } catch (error) {
            return { points: 0, level: 1, achievements: [] };
        }
    },

    saveGamificationData: function(data) {
        localStorage.setItem(this.KEYS.GAMIFICATION, JSON.stringify(data));
    },

    addPoints: function(points, reason) {
        const data = this.getGamificationData();
        data.points += points;
        
        // Calculate level (every 100 points = 1 level)
        const newLevel = Math.floor(data.points / 100) + 1;
        
        if (newLevel > data.level) {
            data.level = newLevel;
            this.addNotification({
                title: '🎉 Level Up!',
                message: `Selamat! Anda naik ke level ${newLevel}`,
                type: 'success'
            });
        }
        
        this.saveGamificationData(data);
    },

    addAchievement: function(achievementData) {
        const data = this.getGamificationData();
        
        if (!data.achievements.find(a => a.id === achievementData.id)) {
            data.achievements.push({
                ...achievementData,
                unlockedAt: new Date().toISOString()
            });
            
            this.saveGamificationData(data);
            
            this.addNotification({
                title: '🏆 Achievement Unlocked!',
                message: achievementData.name,
                type: 'success'
            });
        }
    },

    // Analytics & Statistics
    getStatistics: function() {
        const cases = this.getCases();
        const queue = this.getQueue();
        const claims = this.getClaims();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return {
            totalCases: cases.length,
            activeCases: cases.filter(c => c.status === 'active').length,
            closedCases: cases.filter(c => c.status === 'closed').length,
            recentCases: cases.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length,
            queueCount: queue.filter(q => q.status === 'waiting').length,
            totalQueue: queue.length,
            claimsPending: claims.filter(c => c.status === 'submitted' || c.status === 'processing').length,
            claimsApproved: claims.filter(c => c.status === 'approved').length,
            claimsRejected: claims.filter(c => c.status === 'rejected').length,
            totalClaims: claims.length
        };
    },

    // Utility Functions
    generateJKNNumber: function() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `JKN-${timestamp}-${random}`;
    },

    calculateProcessingTime: function(claimData) {
        // Simulate AI-powered estimation
        const baseDays = 3;
        const priorityMultiplier = claimData.priority === 'high' ? 0.5 : 
                                   claimData.priority === 'low' ? 1.5 : 1;
        return Math.ceil(baseDays * priorityMultiplier);
    },

    // Export/Import Data
    exportData: function() {
        const data = {
            cases: this.getCases(),
            queue: this.getQueue(),
            claims: this.getClaims(),
            notifications: this.getNotifications(),
            activities: this.getActivities(),
            gamification: this.getGamificationData(),
            exportedAt: new Date().toISOString(),
            version: '2.0'
        };
        
        return JSON.stringify(data, null, 2);
    },

    importData: function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.cases) this.saveCases(data.cases);
            if (data.queue) this.saveQueue(data.queue);
            if (data.claims) this.saveClaims(data.claims);
            if (data.notifications) this.saveNotifications(data.notifications);
            if (data.activities) this.saveActivities(data.activities);
            if (data.gamification) this.saveGamificationData(data.gamification);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    // Clear all data
    clearAllData: function() {
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!')) {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.init();
            return true;
        }
        return false;
    },

    // Seed sample data
    seedSampleData: function() {
        const sampleCases = [
            {
                patientName: 'Ahmad Surya',
                patientAge: 45,
                patientGender: 'Male',
                diagnosis: 'Diabetes Mellitus Type 2',
                description: 'Pasien datang dengan keluhan sering haus, sering buang air kecil, dan penurunan berat badan dalam 3 bulan terakhir. HbA1c: 9.2%',
                treatment: 'Metformin 500mg 2x sehari, diet rendah gula, olahraga teratur',
                notes: 'Pasien memiliki riwayat keluarga diabetes. Edukasi gaya hidup sehat sudah diberikan.',
                status: 'active',
                priority: 'medium'
            },
            {
                patientName: 'Siti Nurhaliza',
                patientAge: 32,
                patientGender: 'Female',
                diagnosis: 'Hipertensi Grade 1',
                description: 'Pasien mengeluh sakit kepala berulang, terutama pagi hari. TD: 150/95 mmHg',
                treatment: 'Amlodipine 5mg 1x sehari, diet rendah garam',
                notes: 'Follow up 2 minggu untuk monitoring tekanan darah',
                status: 'active',
                priority: 'medium'
            },
            {
                patientName: 'Budi Santoso',
                patientAge: 28,
                patientGender: 'Male',
                diagnosis: 'GERD (Gastroesophageal Reflux Disease)',
                description: 'Pasien mengeluh nyeri ulu hati, mual, terutama setelah makan. Riwayat makan tidak teratur.',
                treatment: 'Omeprazole 20mg 1x sehari sebelum makan, diet teratur',
                notes: 'Edukasi pola makan sehat dan menghindari makanan pemicu',
                status: 'closed',
                priority: 'low'
            }
        ];

        sampleCases.forEach(caseData => this.addCase(caseData));

        // Add sample queue
        this.addToQueue({
            patientName: 'Dewi Lestari',
            patientAge: 56,
            appointmentDate: new Date().toISOString(),
            reason: 'Kontrol rutin hipertensi'
        });

        // Add sample claim
        this.addClaim({
            caseId: 'CASE-' + Date.now(),
            patientName: 'Ahmad Surya',
            diagnosis: 'Diabetes Mellitus Type 2',
            amount: 2500000,
            priority: 'medium'
        });
    }
};

// Initialize storage on load
StorageHelper.init();

// Export for use in other scripts
window.StorageHelper = StorageHelper;
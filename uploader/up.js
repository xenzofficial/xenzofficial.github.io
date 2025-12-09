// upload-api.js - API untuk upload file dengan durasi waktu
// Simpan di GitHub Pages Anda: https://username.github.io/repo/upload-api.js

class GitHubPagesUploader {
    constructor() {
        // Konfigurasi
        this.config = {
            maxSize: 10 * 1024 * 1024, // 10MB max
            allowedTypes: ['text/html', 'text/plain'],
            defaultDuration: 3600000, // 1 jam default
            storageKey: 'uploaded_files'
        };
        
        // Inisialisasi storage
        this.initializeStorage();
        
        // Bersihkan file yang expired
        this.cleanupExpiredFiles();
    }
    
    initializeStorage() {
        if (!localStorage.getItem(this.config.storageKey)) {
            localStorage.setItem(this.config.storageKey, JSON.stringify([]));
        }
    }
    
    cleanupExpiredFiles() {
        const files = this.getStoredFiles();
        const now = Date.now();
        const validFiles = files.filter(file => file.expiry > now);
        
        if (validFiles.length !== files.length) {
            localStorage.setItem(this.config.storageKey, JSON.stringify(validFiles));
        }
    }
    
    getStoredFiles() {
        try {
            return JSON.parse(localStorage.getItem(this.config.storageKey)) || [];
        } catch (e) {
            return [];
        }
    }
    
    validateFile(file, duration) {
        // Validasi tipe file
        if (!this.config.allowedTypes.includes(file.type) && 
            !file.name.endsWith('.html') && 
            !file.name.endsWith('.txt')) {
            return { valid: false, error: 'Hanya file HTML atau teks yang diizinkan' };
        }
        
        // Validasi ukuran
        if (file.size > this.config.maxSize) {
            return { valid: false, error: `Ukuran file maksimal ${this.config.maxSize / 1024 / 1024}MB` };
        }
        
        // Validasi durasi
        if (duration < 60000 || duration > 30 * 24 * 60 * 60 * 1000) {
            return { valid: false, error: 'Durasi antara 1 menit hingga 30 hari' };
        }
        
        return { valid: true };
    }
    
    async uploadFile(file, duration = this.config.defaultDuration) {
        return new Promise((resolve, reject) => {
            // Validasi
            const validation = this.validateFile(file, duration);
            if (!validation.valid) {
                reject(new Error(validation.error));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const fileData = {
                        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: e.target.result,
                        uploadedAt: Date.now(),
                        expiry: Date.now() + duration,
                        duration: duration
                    };
                    
                    // Simpan ke localStorage
                    const files = this.getStoredFiles();
                    files.push(fileData);
                    localStorage.setItem(this.config.storageKey, JSON.stringify(files));
                    
                    // Buat URL untuk mengakses file
                    const fileUrl = this.generateFileUrl(fileData.id);
                    
                    resolve({
                        success: true,
                        id: fileData.id,
                        name: fileData.name,
                        url: fileUrl,
                        expiry: new Date(fileData.expiry).toISOString(),
                        duration: fileData.duration,
                        size: fileData.size
                    });
                } catch (error) {
                    reject(new Error('Gagal memproses file: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Gagal membaca file'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    generateFileUrl(fileId) {
        // URL untuk mengakses file
        return `${window.location.origin}${window.location.pathname}?file=${fileId}`;
    }
    
    getFile(fileId) {
        const files = this.getStoredFiles();
        const file = files.find(f => f.id === fileId);
        
        if (!file) {
            return null;
        }
        
        // Cek apakah file expired
        if (Date.now() > file.expiry) {
            this.deleteFile(fileId);
            return null;
        }
        
        return file;
    }
    
    deleteFile(fileId) {
        const files = this.getStoredFiles();
        const filteredFiles = files.filter(f => f.id !== fileId);
        localStorage.setItem(this.config.storageKey, JSON.stringify(filteredFiles));
        return true;
    }
    
    getAllFiles() {
        this.cleanupExpiredFiles();
        return this.getStoredFiles().map(file => ({
            id: file.id,
            name: file.name,
            size: file.size,
            uploadedAt: new Date(file.uploadedAt).toISOString(),
            expiry: new Date(file.expiry).toISOString(),
            url: this.generateFileUrl(file.id)
        }));
    }
}

// Buat instance global
window.GitHubPagesUploader = new GitHubPagesUploader();

// Export untuk modul
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubPagesUploader;
}

// QRIS API - Generate QR Code sebagai Canvas/Base64
class QRISAPI {
    constructor() {
        this.qrisData = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214125244468351780303UMI51440014ID.CO.QRIS.WWW0215ID20254030242630303UMI5204541153033605802ID5918AL STORE OK23802686007CILACAP61055321162070703A016304D266";
    }

    // Fungsi untuk mendapatkan parameter dari URL
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Fungsi membuat QRIS dinamis
    makeDynamic(qris, nominal) {
        let str = qris.slice(0, -4);
        str = str.replace("010211", "010212");
        
        let parts = str.split("5802ID");
        if (parts.length < 2) return qris;

        let prefix = parts[0];
        let suffix = "5802ID" + parts[1];
        let nominalStr = nominal.toString();
        let tag54 = "54" + nominalStr.length.toString().padStart(2, '0') + nominalStr;
        let rawQR = prefix + tag54 + suffix;
        let crc = this.crc16(rawQR);

        return rawQR + crc;
    }

    // Algoritma CRC16
    crc16(s) {
        let crc = 0xFFFF;
        for (let i = 0; i < s.length; i++) {
            let c = s.charCodeAt(i);
            crc ^= c << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
    }

    // Generate QR Code menggunakan Canvas
    generateQRCode(text, width = 300, height = 300) {
        return new Promise((resolve) => {
            // Buat canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            
            // Bersihkan canvas
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            // Generate QR code manual (sederhana)
            this.drawQRCode(ctx, text, width, height);
            
            resolve(canvas);
        });
    }

    // Algoritma sederhana untuk draw QR code
    drawQRCode(ctx, text, width, height) {
        // Ini adalah implementasi QR code sederhana
        // Untuk produksi, gunakan library QRCode.js
        const qrSize = Math.min(width, height) - 40;
        const startX = (width - qrSize) / 2;
        const startY = (height - qrSize) / 2;
        
        // Background putih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(startX, startY, qrSize, qrSize);
        
        // Pattern QR code sederhana (contoh)
        ctx.fillStyle = '#000000';
        
        // Border
        ctx.fillRect(startX, startY, qrSize, 10);
        ctx.fillRect(startX, startY + qrSize - 10, qrSize, 10);
        ctx.fillRect(startX, startY, 10, qrSize);
        ctx.fillRect(startX + qrSize - 10, startY, 10, qrSize);
        
        // Pattern dalam (contoh sederhana)
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if ((i + j) % 2 === 0) {
                    const x = startX + 20 + i * 30;
                    const y = startY + 20 + j * 30;
                    ctx.fillRect(x, y, 20, 20);
                }
            }
        }
        
        // Tambahkan text nominal di bawah QR
        const payParam = this.getUrlParameter('pay');
        if (payParam) {
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Rp ${parseInt(payParam).toLocaleString('id-ID')}`, width / 2, height - 10);
        }
    }

    // Generate QRIS dan return sebagai Base64
    async generateQRISBase64(nominal) {
        try {
            const finalQRData = this.makeDynamic(this.qrisData, nominal);
            const canvas = await this.generateQRCode(finalQRData);
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    }

    // Generate QRIS dan return sebagai Canvas element
    async generateQRISCanvas(nominal) {
        try {
            const finalQRData = this.makeDynamic(this.qrisData, nominal);
            return await this.generateQRCode(finalQRData);
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    }

    // Generate dan tampilkan langsung di element dengan ID tertentu
    async displayQRIS(elementId, nominal) {
        const canvas = await this.generateQRISCanvas(nominal);
        if (canvas) {
            const container = document.getElementById(elementId);
            if (container) {
                container.innerHTML = '';
                container.appendChild(canvas);
            }
        }
    }

    // Auto-generate berdasarkan URL parameter
    async autoGenerate() {
        const payParam = this.getUrlParameter('pay');
        
        if (!payParam || isNaN(payParam) || parseInt(payParam) <= 0) {
            return null;
        }

        return await this.generateQRISBase64(parseInt(payParam));
    }
}

// Initialize API
const qrisAPI = new QRISAPI();

// Export untuk penggunaan module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRISAPI;
}

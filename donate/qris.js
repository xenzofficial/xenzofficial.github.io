// qris-api.js - QRIS Generator API
class QRISAPI {
    constructor() {
        this.qrisData = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214125244468351780303UMI51440014ID.CO.QRIS.WWW0215ID20254030242630303UMI5204541153033605802ID5918AL STORE OK23802686007CILACAP61055321162070703A016304D266";
        this.init();
    }

    init() {
        // Load QRCode.js dynamically
        if (typeof QRCode === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js';
            script.onload = () => this.generateQRIS();
            document.head.appendChild(script);
        } else {
            this.generateQRIS();
        }
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

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

    generateQRIS() {
        const payParam = this.getUrlParameter('pay');
        const width = this.getUrlParameter('width') || 300;
        const height = this.getUrlParameter('height') || 300;

        if (!payParam || isNaN(payParam) || parseInt(payParam) <= 0) {
            this.showError('Parameter pay tidak valid. Gunakan ?pay=nominal');
            return;
        }

        const finalQRData = this.makeDynamic(this.qrisData, parseInt(payParam));
        this.createQRCode(finalQRData, parseInt(width), parseInt(height));
    }

    createQRCode(text, width, height) {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const qrcode = new QRCode(container, {
            text: text,
            width: width,
            height: height,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Convert to image after QR code is generated
        setTimeout(() => {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.alt = 'QRIS Payment';
                img.style.width = width + 'px';
                img.style.height = height + 'px';
                
                // Replace entire body with the image
                document.body.innerHTML = '';
                document.body.appendChild(img);
            }
        }, 100);
    }

    showError(message) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                color: #d12027;
                text-align: center;
            ">
                <div>
                    <h2>Error</h2>
                    <p>${message}</p>
                    <p>Contoh: ?pay=10000&width=300&height=300</p>
                </div>
            </div>
        `;
    }
}

// Initialize API when script loads
new QRISAPI();

// QRIS Data
const qrisData = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214125244468351780303UMI51440014ID.CO.QRIS.WWW0215ID20254030242630303UMI5204541153033605802ID5918AL STORE OK23802686007CILACAP61055321162070703A016304D266";

// DOM Elements
const generateBtn = document.getElementById('generateQRIS');
const qrisPreview = document.getElementById('qrisPreview');
const downloadBtn = document.getElementById('downloadQR');
const amountButtons = document.querySelectorAll('.amount-btn');
const customAmountInput = document.getElementById('customAmount');
const donationAmountDisplay = document.getElementById('donationAmount');
const supportersCount = document.getElementById('supportersCount');
const progressPercent = document.getElementById('progressPercent');
const methodCards = document.querySelectorAll('.method-card');
const copyButtons = document.querySelectorAll('.copy-btn');

// State
let currentAmount = 0;
let currentMethod = 'qris';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startAnimations();
});

function initializeApp() {
    // Set default amount
    currentAmount = 10000;
    updateAmountButtons();
    
    // Initialize stats with animation
    animateValue(supportersCount, 0, 1247, 2000);
    animateValue(progressPercent, 0, 65, 1500);
}

function setupEventListeners() {
    // Amount buttons
    amountButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentAmount = parseInt(btn.dataset.amount);
            updateAmountButtons();
            customAmountInput.value = '';
        });
    });

    // Custom amount input
    customAmountInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value && value > 0) {
            currentAmount = value;
            updateAmountButtons();
        }
    });

    // Generate QR button
    generateBtn.addEventListener('click', generateQRCode);

    // Download QR button
    downloadBtn.addEventListener('click', downloadQRCode);

    // Method selection
    methodCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.copy-btn') || e.target.closest('.generate-btn')) return;
            
            currentMethod = card.dataset.method;
            updateMethodSelection();
        });
    });

    // Copy buttons for crypto addresses
    copyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const address = btn.dataset.address;
            copyToClipboard(address);
            showNotification('Address copied to clipboard!', 'success');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function updateAmountButtons() {
    amountButtons.forEach(btn => {
        const amount = parseInt(btn.dataset.amount);
        if (amount === currentAmount) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateMethodSelection() {
    methodCards.forEach(card => {
        if (card.dataset.method === currentMethod) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function generateQRCode() {
    if (currentAmount <= 0) {
        showNotification('Please select a valid amount', 'error');
        return;
    }

    // Show loading state
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');
    
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    generateBtn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        try {
            const finalQRData = makeDynamic(qrisData, currentAmount);
            renderQRCode(finalQRData);
            
            // Update donation amount display
            donationAmountDisplay.textContent = formatCurrency(currentAmount);
            
            // Show QR preview
            qrisPreview.classList.remove('hidden');
            
            // Scroll to QR code
            qrisPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            showNotification('QR code generated successfully!', 'success');
        } catch (error) {
            showNotification('Error generating QR code', 'error');
            console.error('QR Generation Error:', error);
        } finally {
            // Reset button state
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            generateBtn.disabled = false;
        }
    }, 1000);
}

function renderQRCode(data) {
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';
    
    new QRCode(qrcodeContainer, {
        text: data,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function downloadQRCode() {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }

    const link = document.createElement('a');
    link.download = `donation-qr-${currentAmount}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showNotification('QR code downloaded!', 'success');
}

// QRIS Dynamic Generation Functions
function makeDynamic(qris, nominal) {
    let str = qris.slice(0, -4);
    str = str.replace("010211", "010212");
    
    let parts = str.split("5802ID");
    if (parts.length < 2) return qris;

    let prefix = parts[0];
    let suffix = "5802ID" + parts[1];
    let nominalStr = nominal.toString();
    let tag54 = "54" + nominalStr.length.toString().padStart(2, '0') + nominalStr;
    let rawQR = prefix + tag54 + suffix;
    let crc = crc16(rawQR);

    return rawQR + crc;
}

function crc16(s) {
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

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        if (element.id === 'progressPercent') {
            element.textContent = value + '%';
        } else {
            element.textContent = value.toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary-bg);
        border: 1px solid var(--border);
        border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--accent)'};
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: var(--text-primary);
        font-weight: 500;
        box-shadow: var(--shadow-xl);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function startAnimations() {
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .method-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add notification styles to head
const style = document.createElement('style');
style.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-icon {
        font-size: 1.25rem;
    }
`;
document.head.appendChild(style);

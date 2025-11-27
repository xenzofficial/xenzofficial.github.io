<!-- EXAMPLE TO USE
<iframe 
    src="https://example.com/?amount=1000&size=200" 
    width="210" 
    height="210"
    frameborder="0"
    scrolling="no">
</iframe>
-->

<!DOCTYPE html>
<html>
<head>
    <title>QRIS API</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
        .qr-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>
<body>
    <div class="qr-container" id="qrContainer">
        <!-- QR code akan dimuat di sini -->
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script>
        const qrisData = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214125244468351780303UMI51440014ID.CO.QRIS.WWW0215ID20254030242630303UMI5204541153033605802ID5918AL STORE OK23802686007CILACAP61055321162070703A016304D266";

        function getUrlParameter(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

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

        function generateQRCode() {
            const payParam = getUrlParameter('amount');
            const size = getUrlParameter('size') || 300;
            
            if (!payParam || isNaN(payParam) || parseInt(payParam) <= 0) {
                document.body.innerHTML = '<div style="color:red;text-align:center;padding:20px;">Invalid parameter. Use ?pay=10000</div>';
                return;
            }

            try {
                const finalQRData = makeDynamic(qrisData, parseInt(payParam));
                
                new QRCode(document.getElementById('qrContainer'), {
                    text: finalQRData,
                    width: parseInt(size),
                    height: parseInt(size),
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // Set background putih
                document.body.style.background = '#ffffff';
                
            } catch (error) {
                document.body.innerHTML = '<div style="color:red;text-align:center;padding:20px;">Error generating QR code</div>';
            }
        }

        // Jalankan saat page load
        generateQRCode();
    </script>
</body>
</html>

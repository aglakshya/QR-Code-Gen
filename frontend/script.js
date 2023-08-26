document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('numberInput');
    const generateButton = document.getElementById('generateButton');
    const qrCodeContainer = document.getElementById('qrCodeContainer');

    generateButton.addEventListener('click', async () => {
        const number = numberInput.value;

        try {
            const response = await fetch(`http://10.150.41.166:3001/generateQR/${number}`);
            const data = await response.json();

            const qrImage = document.createElement('img');
            qrImage.src = data.qrDataURL;
            qrCodeContainer.innerHTML = '';
            qrCodeContainer.appendChild(qrImage);
        } catch (error) {
            console.error(error);
        }
    });

    scanButton.addEventListener('click', () => {
        // Access the user's camera
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    requestAnimationFrame(scanQRCode);
                };
            })
            .catch((error) => {
                console.error('Camera access error:', error);
            });

        function scanQRCode() {
            cameraCtx.drawImage(video, 0, 0, cameraCanvas.width, cameraCanvas.height);
            const imageData = cameraCtx.getImageData(0, 0, cameraCanvas.width, cameraCanvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
                const decodedNumber = qrCode.data;
                console.log(decodedNumber);
                // Do something with the decoded number
            }

            requestAnimationFrame(scanQRCode);
        }
    });
});

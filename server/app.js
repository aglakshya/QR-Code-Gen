const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const jsqr = require('jsqr');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
// Configure body parser for JSON data
app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Generate QR code endpoint
app.get('/generateQR/:number', async (req, res) => {
    const number = req.params.number;

    try {
        const qrDataURL = await qrcode.toDataURL(`${number}-${Date.now()}`);
        res.json({ qrDataURL });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'QR code generation failed' });
    }
});
// Decode QR code endpoint
app.post('/decodeQR', upload.single('qrImage'), (req, res) => {
    const imageBuffer = req.file.buffer;
    
    // Decode QR code using jsqr library
    const qrCode = jsqr(imageBuffer, imageBuffer.width, imageBuffer.height);

    if (qrCode) {
        const decodedNumber = qrCode.data;
        console.log(decodedNumber);
        res.json({ decodedNumber });
    } else {
        res.status(400).json({ error: 'QR code decoding failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

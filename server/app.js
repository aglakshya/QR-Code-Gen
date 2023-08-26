const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const jsqr = require('jsqr');
const app = express();
const port = process.env.PORT || 3001;
const mongoURL = "mongodb+srv://aglakshya02:aglakshya02@cluster0.i41osyb.mongodb.net/";
// Connect to MongoDB
const connectToMongo = async () => {
    try {
        mongoose.set('strictQuery', false)
        mongoose.connect(mongoURL) 
        console.log('Mongo connected')
    }
    catch(error) {
        console.log(error)
        // process.exit()
    }
}
connectToMongo();
const qrCodeSchema = new mongoose.Schema({
    number: String,
    qrDataURL: String,
});

const QRCodeModel = mongoose.model('QRCode', qrCodeSchema);

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
    const currentDate = new Date().getTime().toString(); // Convert to Unix timestamp

    try {
         // Check if the number already exists in the database
         const existingQRCode = await QRCodeModel.findOne({ number });

         if (existingQRCode) {
             // Delete the existing data
             await QRCodeModel.deleteOne({ _id: existingQRCode._id });
         }
        //  QRCodeModel.find({ number:number }).remove().exec();
        const qrDataURL = await qrcode.toDataURL(`number = ${number} - time = ${currentDate}`);
         // Save data to MongoDB
         const qrCodeData = new QRCodeModel({
            number: number,
            qrDataURL: qrDataURL,
        });
        let output;
        // (async () => {
        // })
        output = await qrCodeData.save();
        console.log(output);

        
        res.json({ qrDataURL });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'QR code generation and storage failed' });
    }
});
// Decode QR code endpoint
app.post('/decodeQR', upload.single('qrImage'), (req, res) => {
    const imageBuffer = req.file.buffer;
    
    // Decode QR code using jsqr library
    const qrCode = jsqr(imageBuffer, imageBuffer.width, imageBuffer.height);

    if (qrCode) {
        const decodedNumber = qrCode.data;
        const parts = decodedNumber.split('-');
        const number = parts[0]; // Extracted number
        console.log(number);
        res.json({ decodedNumber });
    } else {
        res.status(400).json({ error: 'QR code decoding failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to get an access token if needed in the future
// Currently, we will just send the request
const SAFARICOM_API_URL = 'https://apisandbox.safaricom.et/mpesa/b2c/simulatetransaction/v1/request';

app.post('/api/pay', async (req, res) => {
    try {
        const { Msisdn } = req.body;
        
        const Amount = "110";
        const ShortCode = "443443";
        const BillRefNumber = "BUN" + Math.floor(Math.random() * 1000000);

        // Safaricom simulate transaction payload
        const payload = {
            CommandID: "CustomerPayBillOnline",
            Amount: Amount,
            Msisdn: Msisdn.toString(),
            BillRefNumber: BillRefNumber,
            ShortCode: ShortCode
        };

        console.log("Sending request to Safaricom:", payload);

        // NOTE: In a real app, you would need to generate an OAuth token first and pass it in the Authorization header.
        // E.g., Authorization: `Bearer ${accessToken}`
        const response = await axios.post(SAFARICOM_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Safaricom Response:", response.data);
        res.json({ success: true, data: response.data, message: "Payment request sent successfully." });

    } catch (error) {
        console.error("Error from Safaricom API:", error.response ? error.response.data : error.message);
        // Even if Safaricom fails (e.g. due to missing auth), we return the error to the frontend gracefully
        res.status(500).json({ 
            success: false, 
            error: error.response ? error.response.data : "Internal Server Error",
            message: "Failed to process payment."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const clientId = process.env.SAFARICOM_CLIENT_ID;
const clientSecret = process.env.SAFARICOM_CLIENT_SECRET;

async function generateToken() {
    const url = 'https://api.safaricom.et/v1/token/generate?grant_type=client_credentials';
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        if (!response.ok) {
            console.error('Error fetching token:', data);
            throw new Error(data.message || 'Failed to fetch token')
        }
        return data;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

app.post('/api/pay', async (req, res) => {
    const { partyA, phoneNumber, amount } = req.body;

    if (!partyA || !phoneNumber) {
        return res.status(400).json({ error: 'PartyA and PhoneNumber are required' });
    }

    const tokenData = await generateToken();
    const accessToken = tokenData.access_token;

    const url = 'https://api.safaricom.et/mpesa/stkpush/v3/processrequest';
    const shortCode = "2005";
    const passKey = "20dd3bff1e320dcf5494af339df4cc604ef080a2394171f1ac350a8727ef3955";

    const timestamp = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(0, 14);

    const concatenatedString = shortCode + passKey + timestamp;
    const sha256Hash = crypto.createHash("sha256").update(concatenatedString).digest("hex");
    const password = Buffer.from(sha256Hash).toString('base64')

    const payload = {
        "MerchantRequestID": `Partner name -${crypto.randomUUID()}`,
        "BusinessShortCode": shortCode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": partyA,
        "PartyB": "2005",
        "PhoneNumber": phoneNumber,
        "CallBackURL": "https://webhook.site/64d4ae5b-d925-4fa1-ac59-2d84337007fa",
        "AccountReference": "Test12355",
        "TransactionDesc": "Payment Reason",
        "ReferenceData": [
            {
                "Key": "ThirdPartyReference",
                "Value": "Ref-12345"
            }
        ]
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
        console.error('Payment API error:', data);
        return res.status(response.status).json(data);
    }

    res.json(data);
    try {

    } catch (error) {
        console.error('Payment failed:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

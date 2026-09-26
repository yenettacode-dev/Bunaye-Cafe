const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const clientId = process.env.SAFARICOM_CLIENT_ID;
const clientSecret = process.env.SAFARICOM_CLIENT_SECRET;
 
// Safaricom M-Pesa Account Balance configuration stored securely on the backend
const SECURITY_CREDENTIAL = process.env.SAFARICOM_SECURITY_CREDENTIAL;

const MPESA_CONFIG = {
    Initiator: "YellowBusinessInit",
    SecurityCredential: SECURITY_CREDENTIAL,
    CommandID: "AccountBalance",
    PartyA: "2005",
    IdentifierType: "4",
    Remarks: "Balance check",
    QueueTimeOutURL: "https://webhook.site/c009cf2b-beec-413f-8097-ae147b6e4659",
    ResultURL: "https://webhook.site/64d4ae5b-d925-4fa1-ac59-2d84337007fa"
};

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

// Endpoint to query account balance (all configuration values kept in backend)
app.post('/api/account-balance', async (req, res) => {
    try {
        const tokenData = await generateToken();
        const accessToken = tokenData.access_token;

        const url = 'https://api.safaricom.et/mpesa/accountbalance/v2/query';

        // Generate a new OriginatorConversationID dynamically with UUID
        const OriginatorConversationID = `Partner name -${crypto.randomUUID()}`;

        // Construct payload with stored config
        const payload = {
            OriginatorConversationID,
            ...MPESA_CONFIG
        };

        console.log('Sending request to Safaricom Account Balance API...');
        console.log('Payload:', JSON.stringify({ ...payload, SecurityCredential: '[REDACTED]' }, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Redacted security credential for the frontend logging
        const redactedCredential = SECURITY_CREDENTIAL.slice(0, 15) + '...';
        const sentPayloadClean = {
            ...payload,
            SecurityCredential: redactedCredential
        };

        if (!response.ok) {
            console.error('Safaricom Account Balance API error:', data);
            return res.status(response.status).json({
                success: false,
                error: data,
                sentPayload: sentPayloadClean
            });
        }

        res.json({
            success: true,
            data,
            sentPayload: sentPayloadClean
        });
    } catch (error) {
        console.error('Account Balance query failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

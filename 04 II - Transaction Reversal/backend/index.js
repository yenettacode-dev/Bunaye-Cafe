const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const clientId = process.env.SAFARICOM_CLIENT_ID;
const clientSecret = process.env.SAFARICOM_CLIENT_SECRET;
const SECURITY_CREDENTIAL = process.env.SAFARICOM_SECURITY_CREDENTIAL;

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

// Endpoint to process transaction reversal (TransactionID and ReceiverParty come from frontend)
app.post('/api/reversal', async (req, res) => {
    const { TransactionID, ReceiverParty, Amount } = req.body;

    if (!TransactionID) {
        return res.status(400).json({
            success: false,
            error: 'TransactionID is required'
        });
    }

    if (!ReceiverParty) {
        return res.status(400).json({
            success: false,
            error: 'ReceiverParty (phone number) is required'
        });
    }

    if (!Amount) {
        return res.status(400).json({
            success: false,
            error: 'Amount is required'
        });
    }

    try {
        const tokenData = await generateToken();
        const accessToken = tokenData.access_token;

        const url = 'https://api.safaricom.et/mpesa/reversal/v2/request';

        // Generate a new OriginatorConversationID dynamically with UUID
        const OriginatorConversationID = `Partner name ${crypto.randomUUID()}`;

        // Construct payload strictly matching the user's template
        // Note: keeping exact spellings from prompt: "OriginalConcersationID", "RecieverIdentifierType"
        const payload = {
            OriginatorConversationID,
            Initiator: "YellowBusinessInit",
            SecurityCredential: SECURITY_CREDENTIAL,
            CommandID: "TransactionReversal",
            TransactionID: TransactionID,
            Amount: String(Amount),
            OriginalConcersationID: "ws_CO_090420261115402742615",
            PartyA: "2005",
            RecieverIdentifierType: "11",
            ReceiverParty: ReceiverParty,
            ResultURL: "https://webhook.site/64d4ae5b-d925-4fa1-ac59-2d84337007fa",
            QueueTimeOutURL: "https://webhook.site/c009cf2b-beec-413f-8097-ae147b6e4659",
            Remarks: "B2C Reversal",
            Occasion: "Payout"
        };

        console.log('Sending transaction reversal request to Safaricom API...');
        console.log('Payload:', JSON.stringify({ ...payload }, null, 2));

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
        const redactedCredential = SECURITY_CREDENTIAL ? (SECURITY_CREDENTIAL.slice(0, 15) + '...') : '';
        const sentPayloadClean = {
            ...payload,
            SecurityCredential: redactedCredential
        };

        if (!response.ok) {
            console.error('Safaricom Reversal API error:', data);
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
        console.error('Reversal request failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

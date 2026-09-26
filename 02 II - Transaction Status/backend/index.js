require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const clientId = process.env.SAFARICOM_CLIENT_ID;
const clientSecret = process.env.SAFARICOM_CLIENT_SECRET;
const securityCredential = process.env.SECURITY_CREDENTIAL;
const initiator = process.env.INITIATOR || "YellowBusinessInit";
const commandId = process.env.COMMAND_ID || "TransactionStatusQuery";
const originalConversationId = process.env.ORIGINAL_CONVERSATION_ID || "ws_CO_0904202610385978162600";
const partyA = process.env.PARTYA || "2005";
const identifierType = process.env.IDENTIFIER_TYPE || "4";
const resultUrl = process.env.RESULT_URL || "https://webhook.site/64d4ae5b-d925-4fa1-ac59-2d84337007fa";
const queueTimeOutUrl = process.env.QUEUE_TIMEOUT_URL || "https://webhook.site/64d4ae5b-d925-4fa1-ac59-2d84337007f2";
const remarks = process.env.REMARKS || "Trans Status";
const occasion = process.env.OCCASION || "Query trans status";

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

app.post('/api/transaction-status', async (req, res) => {
    const { transactionId } = req.body;

    if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID is required' });
    }

    try {
        const tokenData = await generateToken();
        const accessToken = tokenData.access_token;

        const url = 'https://api.safaricom.et/mpesa/transactionstatus/v1/query';
        const payload = {
            Initiator: initiator,
            SecurityCredential: securityCredential,
            CommandID: commandId,
            TransactionID: transactionId,
            OriginalConcersationID: originalConversationId,
            PartyA: partyA,
            IdentifierType: identifierType,
            ResultURL: resultUrl,
            QueueTimeOutURL: queueTimeOutUrl,
            Remarks: remarks,
            Occasion: occasion
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('API Request failed:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data || 'Failed to query transaction status'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

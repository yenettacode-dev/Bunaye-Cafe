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
            throw new Error(data.message || 'Failed to fetch token');
        }
        return data;
    } catch (error) {
        console.error('Token request failed:', error);
        throw error;
    }
}


app.post('/api/payout', async (req, res) => {
    const { phone, amount, employeeName } = req.body;

    if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: 'A valid amount is required' });
    }

    try {
        const tokenData = await generateToken();
        const accessToken = tokenData.access_token;

        const OriginatorConversationID = `Bunaye-${crypto.randomUUID()}`;

        const payload = {
            OriginatorConversationID,
            InitiatorName: 'YellowBusinessInit',
            SecurityCredential: SECURITY_CREDENTIAL,
            PartyA: '2005',
            PartyB: String(phone),
            CommandID: 'BusinessPayment',
            Amount: Number(amount),
            Remarks: `Pay to ${employeeName || 'Employee'}`,
            Occassion: 'PayOut',
            QueueTimeOutURL: 'https://webhook.site/64d4ae5b-d925-4fa1-ac59-2d84337007fa',
            ResultURL: 'https://webhook.site/64d4ae5b-d925-4fa1-ac59-2d84337007fa'
        };
/**
 * bunaye.com
 * api.bunaye.com/payoutWebhook/timeout
 * api.bunaye.com/payoutWebhook/result
 */
        console.log('Sending B2C payout request...');
        console.log('Payload:', JSON.stringify({ ...payload, SecurityCredential: '[REDACTED]' }, null, 2));

        const response = await fetch('https://api.safaricom.et/mpesa/b2c/v2/paymentrequest', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        const redacted = SECURITY_CREDENTIAL
            ? SECURITY_CREDENTIAL.slice(0, 15) + '...'
            : '';

        const sentPayloadClean = { ...payload, SecurityCredential: redacted };

        if (!response.ok) {
            console.error('Safaricom B2C API error:', data);
            return res.status(response.status).json({
                success: false,
                error: data,
                sentPayload: sentPayloadClean
            });
        }

        res.json({ success: true, data, sentPayload: sentPayloadClean });
    } catch (error) {
        console.error('Payout request failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Bunaye Payout API' }));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🚀 Bunaye Payout server running on port ${PORT}`));

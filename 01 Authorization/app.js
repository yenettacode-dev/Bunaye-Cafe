require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const clientId = process.env.SAFARICOM_CLIENT_ID;
const clientSecret = process.env.SAFARICOM_CLIENT_SECRET;

app.use(express.json());

// Function to generate token
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

        if(!response.ok){
            console.error('Error fetching token:', data);
            throw new Error(data.message || 'Failed to fetch token')
        }
        return data;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}
// Endpoint to get the token
app.get('/api/token', async (req, res) => {
    try {
        const tokenData = await generateToken();
        res.json({
            success: true,
            data: tokenData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

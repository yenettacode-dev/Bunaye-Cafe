const express = require("express")
const { MPesa } = require("@safaricom-et/mpesa-node-js-sdk");
const crypto = require("crypto");
require("dotenv").config();

const app = express()
app.use(express.json())

function generatePasswordSHA256Base64(shortCode, passKey, timestamp) {
  const concatenatedstring = shortCode + passKey + timestamp;
  const hash = crypto
    .createHash("sha256")
    .update(concatenatedstring)
    .digest("hex");

  // Replicating your manual client tools: Converting the hex text back to raw binary before Base64 encoding
  return Buffer.from(hash).toString("base64");
}

const mpesa = MPesa.getInstance({
  apiKey: process.env.MPESA_CONSUMER_KEY,
  secretKey: process.env.MPESA_CONSUMER_SECRET,
  environment: process.env.MPESA_ENVIRONMENT,
});

app.post("/stk-push", async(req, res)=>{
  try {
     const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    // Dynamic clean password assignment utilizing environment configurations
    const password = generatePasswordSHA256Base64(
      process.env.MPESA_SHORTCODE,
      process.env.MPESA_PASSKEY,
      timestamp
    );

      const payload = {
      MerchantRequestID: `Partner-${crypto.randomUUID()}`,
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 10,
      PartyA: "251723747252",
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: "251723747252",
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: "Ref1233334",
      TransactionDesc: "Payment Description",
      ReferenceData: [
        {
          Key: "ThirdPartyReference",
          Value: "Ref-12345",
        },
      ],
    };

        console.log("Sending Payload to SDK...");
    const response = await mpesa.stkPush(payload);
    return res.json(response);
  } catch (error) {
     console.error("SDK Error Catch:", error.message);

    if (error.data) {
      console.error(
        "Gateway Raw Data Error:",
        JSON.stringify(error.data, null, 2)
      );
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      gatewayDetails: error.data || null,
    });
  }
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
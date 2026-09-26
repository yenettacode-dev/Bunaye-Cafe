# Bunaye Cafe — M-Pesa API Integration Course

A hands-on, modular course repository demonstrating end-to-end integration with Safaricom's M-Pesa API. The repository covers authentication, customer- and merchant-initiated payments, transaction status tracking, reversals, payouts (B2C), account balance queries, and official SDK usage.

---

## Repository Structure

```
.
├── 01 Authorization/                  # OAuth 2.0 Access Token Generation
├── 02 I - Merchant Initiated/         # C2B / STK Push Payment Flow (Frontend & Backend)
├── 02 II - Transaction Status/       # Query Transaction Status (Frontend & Backend)
├── 03 Customer Initiated Payment/     # Customer-Initiated Payment Simulation (Frontend & Backend)
├── 04 I - Payout/                     # Business to Customer (B2C) Payouts (Frontend & Backend)
├── 04 II - Transaction Reversal/      # Transaction Reversal Flow (Frontend & Backend)
├── 04 III - AccountBalance/           # Organization Account Balance Query (Frontend & Backend)
└── SDK/                               # Safaricom M-Pesa Node.js SDK Example
```

---

## Projects Overview

| Module | Description | Stack |
|---|---|---|
| **01 Authorization** | Generates OAuth 2.0 bearer access tokens using Consumer Key & Secret. | Node.js, Express, Axios |
| **02 I - Merchant Initiated** | Bunaye Cafe checkout flow triggering merchant-initiated STK push. | React (Vite), Node.js, Express |
| **02 II - Transaction Status** | Checks the lifecycle state and confirmation status of transactions. | React (Vite), Node.js, Express |
| **03 Customer Initiated Payment** | Simulates customer-initiated PayBill / C2B transactions. | React (Vite), Node.js, Express |
| **04 I - Payout** | Executes B2C disbursement / payout requests to customers. | React (Vite), Node.js, Express |
| **04 II - Transaction Reversal** | Submits reversal requests for completed transactions. | React (Vite), Node.js, Express |
| **04 III - AccountBalance** | Inquires utility and working account balances. | React (Vite), Node.js, Express |
| **SDK** | Demonstrates Safaricom M-Pesa integration using the `@safaricom-et` SDK. | Node.js, Express |

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm` / `yarn`
- Safaricom Developer Portal account ([developer.safaricom.et](https://developer.safaricom.et/))

---

## Getting Started

### 1. Environment Setup

Each project directory includes a `.env_example` template. Copy `.env_example` to `.env` in the respective project/backend folder and supply your developer credentials:

```bash
# Example for Chapter 01
cd "01 Authorization"
cp .env_example .env

# Example for 02 I - Merchant Initiated Backend
cd "02 I - Merchant Initiated/backend"
cp .env_example .env
```

Common environment variables:
- `PORT`: Port number for the backend server.
- `SAFARICOM_CLIENT_ID`: Consumer Key from your Safaricom developer portal app.
- `SAFARICOM_CLIENT_SECRET`: Consumer Secret from your Safaricom developer portal app.
- `SAFARICOM_SECURITY_CREDENTIAL`: Encrypted initiator credential for B2C/Status/Reversal APIs.
- `SAFARICOM_PASSKEY`: Passkey for STK push / merchant-initiated payments.

### 2. Installing Dependencies

Navigate to each module's directory (and its `backend` / `frontend` subdirectories where applicable) and install dependencies:

```bash
# Standalone project
npm install

# Fullstack modules
cd backend && npm install
cd ../frontend && npm install
```

### 3. Running Applications

#### Backend:
```bash
npm run dev
# or
node index.js
```

#### Frontend:
```bash
npm run dev
```

---

## Security

- Do **not** commit `.env` files or sensitive credentials to version control.
- All `.env` files are ignored by git in [.gitignore](.gitignore).
- Keep production credentials and security certificates strictly confidential.

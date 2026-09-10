# ReliefLink: Blockchain-Based Disaster Relief and Donation Tracking System
## Technical & System Architecture Documentation

---

## 1. Executive Summary & System Overview

**ReliefLink** is an end-to-end disaster relief management and donation transparency platform that bridges public donors, relief agencies, field volunteers, and affected beneficiaries. By combining real-time digital payments (**PayMongo** for GCash/Maya/Cards) with an immutable enterprise distributed ledger (**Hyperledger Besu**), ReliefLink guarantees financial integrity, eliminates phantom relief claims, and restores public trust in humanitarian disaster operations.

### Key Innovations:
- **Immutable On-Chain Audit Trail:** Every verified financial donation is automatically mined into an EVM-compatible private blockchain (`DonationRegistry.sol`).
- **Automated Digital Payment Reconciliation:** Instant GCash/Maya checkout session generation and automatic payment verification.
- **Role-Based Disaster Response:** Distinct interfaces and permissions for Superadmins, Administrators, Donors, Beneficiaries, and Field Officers.
- **Anti-Fraud QR Field Distribution:** QR-based beneficiary verification to eliminate double-claiming of emergency relief packages.
- **Field Cash Advances & Liquidation:** Transparent petty cash disbursement tracking for on-ground logistics and volunteer operations.

---

## 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|                                                                                   |
|   +------------------------------------+    +---------------------------------+   |
|   |         React / Vite Web           |    |       Flutter Mobile App        |   |
|   |   (Admin Dashboard & Analytics)    |    |  (Donors & Field Distribution)  |   |
|   |   Hosted on: Render                |    |  Platforms: Android / iOS / Web |   |
|   +-----------------+------------------+    +----------------+----------------+   |
+---------------------|----------------------------------------|--------------------+
                      |                                        |
                      | HTTPS / REST API / JSON                |
                      v                                        v
+-----------------------------------------------------------------------------------+
|                                APPLICATION LAYER                                  |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                        Node.js / Express 5 API Engine                     |   |
|   |                 (Hosted on Heroku Container Infrastructure)                |   |
|   +---------------------------------------------------------------------------+   |
|   |  * JWT Auth & Role Middleware  * PayMongo Payment Service                 |   |
|   |  * Relief & Inventory Engine   * Besu Blockchain Ethers.js Relayer        |   |
|   |  * Sector & Campaign Routing   * OTP Email / SMS Verification Engine      |   |
|   +-------------------+-----------------------------+-------------------------+   |
+-----------------------|-----------------------------|-----------------------------+
                        |                             |
          Mongoose ODM  |                             | JSON-RPC over HTTP (Port 8545)
                        v                             v
+--------------------------------+       +------------------------------------------+
|          DATA LAYER            |       |         BLOCKCHAIN LAYER                 |
|                                |       |                                          |
|      MongoDB Atlas Cluster     |       |      Hyperledger Besu Private Network    |
|   - Users & Role Profiles      |       |      Hosted on: Azure Cloud VM           |
|   - Beneficiaries & Claims     |       |      - Chain ID: 1337                    |
|   - In-Kind / Warehouses       |       |      - Consensus: QBFT / Clique          |
|   - Expenses & Cash Advances   |       |      - Smart Contract: DonationRegistry  |
+--------------------------------+       +------------------------------------------+
```

---

## 3. Technology Stack

| Layer | Component | Technology / Library | Description |
| :--- | :--- | :--- | :--- |
| **Frontend (Web)** | Admin Portal | React 18, Vite, Tailwind CSS, Axios, Lucide Icons | Real-time administrative dashboard, sector management, cash advance approvals, inventory auditing. |
| **Frontend (Mobile)** | Client Application | Flutter 3.x, Dart, Provider, QR Code Scanner | Cross-platform mobile app for donor contribution, beneficiary QR scanning, field relief distribution. |
| **Backend API** | Server Framework | Node.js (v20+), Express 5, CORS, Multer | RESTful API engine handling business logic, authentication, and service orchestration. |
| **Database** | Central Database | MongoDB Atlas (Mongoose ODM) | Off-chain structured operational storage for fast relational querying. |
| **Blockchain** | Distributed Ledger | Hyperledger Besu, Solidity `^0.8.20`, Ethers.js v6 | Enterprise EVM blockchain node running on Azure VM (`20.205.34.106:8545`). |
| **Payments** | Payment Gateway | PayMongo API v1 (GCash, Maya, Cards) | Automated checkout session creation, webhook processing, and auto-verification. |
| **Security & Auth** | Security Layer | JWT (JSON Web Tokens), bcryptjs, Nodemailer OTP | Secure role-based access control and multi-factor email verification. |
| **Cloud Hosting** | Infrastructure | Heroku (Backend), Render (Web Frontend), Azure (Besu Node) | Scalable production deployment pipeline. |

---

## 4. Smart Contract Architecture

The smart contract is written in **Solidity** and compiled with the `paris` EVM target to ensure compatibility with Hyperledger Besu.

### Contract Address & Deployment:
- **Contract Name:** `DonationRegistry`
- **Network:** Azure Besu Private Network
- **Chain ID:** `1337`
- **Contract Address:** `0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF`
- **Relayer / Signer Address:** `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`

### Data Structure (`DonationRegistry.sol`):
```solidity
struct Donation {
    uint256 id;
    address donor;
    string donorName;
    uint256 amount;
    string referenceNumber;
    string blockHash;
    uint256 timestamp;
}
```

### Core Methods:
1. `recordDonation(address _donor, string _donorName, uint256 _amount, string _referenceNumber, string _blockHash) external returns (uint256)`:
   - Increments global donation counter and total fund tally.
   - Saves immutable donation record into state mapping.
   - Emits `DonationRecorded` event with indexed topic parameters for off-chain listeners.
2. `getTotalDonations() external view returns (uint256)`:
   - Returns total number of registered on-chain donations.
3. `getTotalAmount() external view returns (uint256)`:
   - Returns aggregated monetary donations recorded on the ledger.

---

## 5. REST API Specifications

### 5.1 Authentication (`/api/auth` & `/api/email-otp`)
- `POST /api/auth/register`: Register new Donor, Beneficiary, or Volunteer account.
- `POST /api/auth/login`: Authenticate credentials and return JWT bearer token with user role.
- `POST /api/email-otp/send`: Generate and send 6-digit verification code to recipient email.
- `POST /api/email-otp/verify`: Validate submitted OTP token.

### 5.2 Donations & Payments (`/api/donations` & `/api/payments`)
- `POST /api/payments/paymongo/checkout`: Initialize PayMongo checkout session for GCash/Maya donations (minimum ₱20.00). Returns payment redirect URL.
- `POST /api/payments/paymongo/auto-verify/:donationId`: Check transaction status with PayMongo API; if `paid`, automatically triggers blockchain smart contract mining.
- `POST /api/payments/paymongo/webhook`: Asynchronous webhook handler for PayMongo transaction events (`payment.paid`).
- `GET /api/donations`: Retrieve historical donation lists with pagination and status filters.
- `GET /api/donations/stats`: Summary aggregation of total donations, donor counts, and campaign metrics.

### 5.3 Blockchain Verification (`/api/blockchain`)
- `GET /api/blockchain/verify/:txHash`: Query Hyperledger Besu for transaction receipt, block number, gas used, and on-chain timestamp.
- `GET /api/blockchain/stats`: Query live smart contract total count and total amount directly from the Besu node.

### 5.4 Disaster Sectors & Inventory (`/api/sectors` & `/api/inventory`)
- `GET /api/sectors`: Fetch disaster categories (e.g., Food Relief, Medical Supplies, Shelter, Education).
- `POST /api/sectors`: Create a new relief sector/campaign category.
- `GET /api/inventory`: Real-time stock levels of relief goods across warehouse hubs.
- `POST /api/inventory/claim`: Deduct stock when distributed to a verified beneficiary.

### 5.5 Cash Advances & Financial Auditing (`/api/cash-advances` & `/api/expense`)
- `GET /api/cash-advances`: Fetch field cash advance requests and liquidation statuses.
- `POST /api/cash-advances`: Submit request for operational logistics funds.
- `PUT /api/cash-advances/:id/status`: Approve or reject cash advance requests (Admin only).
- `POST /api/expense`: Log field operational receipts and expenses for auditing.

---

## 6. Security, Privacy & Integrity Safeguards

1. **EVM Non-Repudiation:** Transaction hashes generated upon payment verification cannot be modified or deleted by system administrators or third parties.
2. **Role-Based Access Control (RBAC):** Middleware validates JWT claims (`superadmin`, `admin`, `donor`, `beneficiary`, `volunteer`) before dispatching protected controller actions.
3. **No Private Keys on Client Devices:** All blockchain transactions are signed securely on the backend server relayer using environment-isolated keys.
4. **Duplicate Claim Prevention:** Beneficiary QR codes are cryptographically signed tokens containing unique identifiers verified against historical distribution records.

---

## 7. Deployment & Operational Guide

### Production Endpoints:
- **Backend API:** `https://relieflink-4a13cb419236.herokuapp.com`
- **Web Admin Dashboard:** `https://relieflink-4w1g.onrender.com`
- **Besu Blockchain RPC:** `http://20.205.34.106:8545`

### Required Environment Configuration (`backend/.env`):
```env
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/relieflink
JWT_SECRET=<your_jwt_secret_key>
FRONTEND_URL=https://relieflink-4w1g.onrender.com

# PayMongo Payment Gateway
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...

# Hyperledger Besu Blockchain Node
BESU_RPC_URL=http://20.205.34.106:8545
BESU_PRIVATE_KEY=0x...
BESU_CONTRACT_ADDRESS=0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF
```

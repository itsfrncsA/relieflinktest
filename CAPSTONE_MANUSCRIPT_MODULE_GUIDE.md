# 📘 ReliefLink: Capstone 2 Complete Manuscript & Module Guide
**Project Title:** ReliefLink: A Blockchain-Enabled Mobile and Web Donation Management System with Prescriptive Analytics  
**Institution:** National University – College of Computing and Information Technologies  
**Degree Program:** Bachelor of Science in Information Technology (Specialization in Mobile and Web Applications)  
**Authors:** Francis Louis M. Arillo, Rhyza Ann H. Estrella, Deo John Steven T. Mariano, Shirene D. Rivera, Cyrell Jane D. Romero, Laurence Ser  
**Capstone Adviser:** Edward Matthew T. Sanmocte  
**Partner / Beneficiary Organization:** Sto. Domingo Church / Parish Community  

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Project Context](#1-executive-summary--project-context)
2. [Problem Statement & Research Objectives](#2-problem-statement--research-objectives)
3. [System Architecture & Technology Stack](#3-system-architecture--technology-stack)
4. [Complete Module-by-Module Explanation](#4-complete-module-by-module-explanation)
   - [A. Web Application Modules (Admin & Governance)](#a-web-application-modules-admin--governance)
   - [B. Mobile Application Modules (Donor & Community)](#b-mobile-application-modules-donor--community)
5. [The Two Core Innovations Explained](#5-the-two-core-innovations-explained)
   - [Innovation 1: Blockchain Ledger & Cryptographic Auditing](#innovation-1-blockchain-ledger--cryptographic-auditing)
   - [Innovation 2: Prescriptive Analytics Engine](#innovation-2-prescriptive-analytics-engine)
6. [Payment Gateway Architecture (PayMongo & QR Ph)](#6-payment-gateway-architecture-paymongo--qr-ph)
7. [Panel Defense Q&A Preparation (Tough Questions & Answers)](#7-panel-defense-qa-preparation-tough-questions--answers)

---

## 1. Executive Summary & Project Context
Non-profit, charitable, and religious institutions like **Sto. Domingo Church** rely on donations to fund community programs (scholarships, medical missions, relief goods, prison ministry, elderly care, PWD aid). 

### Traditional Challenges:
1. **Manual Record-Keeping:** Donations and aid disbursements were recorded manually on paper ledgers or fragmented spreadsheets, creating risk of errors, data loss, and delays.
2. **Lack of Donor Traceability:** Donors could not verify in real time whether their donations reached the intended ministry.
3. **Subjective Aid Allocation:** Scholarships and emergency relief funds were distributed without automated scoring, leading to potential bias or inefficiencies.

**ReliefLink** unifies **Mobile Application (Flutter)**, **Web Management Console (React/Vite)**, **Central Backend (Node.js/Express)**, **Database (MongoDB)**, **Digital Payments (PayMongo QR Ph)**, **Cryptographic Blockchain Hashing (SHA-256)**, and **Prescriptive Analytics** into one comprehensive platform.

---

## 2. Problem Statement & Research Objectives

### 🎯 General Objective
To design, develop, and implement **ReliefLink**, a blockchain-enabled mobile and web donation management system with prescriptive analytics that enhances financial transparency, streamlines donor contributions, and optimizes parish aid allocation.

### 📌 Specific Objectives:
1. **Develop a Cross-Platform Mobile Application** enabling donors to contribute seamlessly using digital payment methods (QR Ph, GCash, Maya, Cards) and view real-time receipts.
2. **Develop a Centralized Web Portal** for parish administrators to manage donations, track restricted ministry budgets, disburse relief, and oversee user access.
3. **Implement Blockchain Immutability** to cryptographically record and verify donation transactions and aid disbursement logs, preventing unauthorized tampering.
4. **Integrate Prescriptive Analytics** to automatically evaluate beneficiary need, student scholar performance, and ministry resource allocation to recommend actionable grant decisions.
5. **Conduct System Evaluation** based on standard software quality criteria (ISO/IEC 25010) to validate usability, security, reliability, and performance.

---

## 3. System Architecture & Technology Stack

```
+-----------------------------------------------------------------------------------+
|                              PRESENTATION LAYER                                   |
|  [ Mobile App (Flutter/Dart) ]               [ Web Portal (React/Vite/Tailwind) ] |
|  - Donor Registration / OTP                  - Superadmin & Admin Console         |
|  - QRPH PayMongo Donations                   - Real-Time Executive Overview       |
|  - Digital Receipt Verification              - Beneficiary & Scholar Directory    |
|  - Contribution History                      - Audited Financial Ledger           |
+----------------------------------------+------------------------------------------+
                                         | REST API (HTTPS / JSON / JWT)
                                         v
+-----------------------------------------------------------------------------------+
|                              APPLICATION / BACKEND LAYER                          |
|  [ Node.js + Express.js Server ]                                                  |
|  - Authentication Controller (Bcrypt, JWT)   - Prescriptive Analytics Engine      |
|  - Payment Routes (PayMongo Webhooks/Poll)   - Blockchain Hashing Service         |
|  - Disbursement & Sector Allocator           - Role-Based Access Control (RBAC)   |
+--------------------+-----------------------------------+--------------------------+
                     |                                   |
                     v                                   v
+------------------------------------+   +------------------------------------------+
|          DATABASE LAYER            |   |           BLOCKCHAIN AUDIT LAYER         |
|  [ MongoDB Atlas (Mongoose) ]      |   |  - SHA-256 Cryptographic Block Ledger    |
|  - Users, Roles, Beneficiaries     |   |  - Previous Hash + Data Hash + Timestamp |
|  - Donations, Sectors, Aid Logs    |   |  - Independent Tamper-Proof Verification |
+------------------------------------+   +------------------------------------------+
```

---

## 4. Complete Module-by-Module Explanation

### A. Web Application Modules (Admin & Governance)

#### 1. Public Landing & Institutional Transparency Page
* **Route:** `/`
* **Purpose:** Introduces ReliefLink to the public, highlights active parish ministries, presents verified transparency metrics, and provides download links for the mobile app.
* **Security Feature:** All administrative login buttons are removed from the public navbar. Administrative access is restricted to `/admin-login`.

#### 2. Authentication & Role-Based Access Control (RBAC) Module
* **Route:** `/admin-login`
* **Credentials:** Superadmin (`francisarillo@gmail.com` / `Arillo123`)
* **Purpose:** Authenticates administrative personnel using encrypted passwords (Bcrypt salt rounds = 10) and issues stateless JWT tokens.
* **Hierarchy:**
  - `superadmin`: Full system control, role assignment, financial audit, master settings.
  - `admin`: Donation verification, aid disbursement, beneficiary management.
  - `staff` / `relief_worker`: Operational assistance and inventory distribution.
  - `donor` / `beneficiary` / `user`: End-user roles with restricted client-only scopes.

#### 3. Executive Overview Dashboard Tab
* **Purpose:** Provides a centralized, high-level command center with live aggregated financial indicators.
* **Key Components:**
  - **Net Relief Funds Card:** Total verified donations minus total disbursed aid.
  - **Total Verified Contributions Card:** Sum of approved, verified funds (pending/failed attempts are strictly excluded).
  - **Total Disbursed Assistance Card:** Sum of all assistance released to community members.
  - **Dynamic Trend Charts:** Visual inflow vs. outflow charts showing seasonal donation trends.

#### 4. Donations & Cryptographic Ledger Tab
* **Purpose:** The audited financial ledger of all incoming parish contributions.
* **Filter Tabs:**
  - `All Donations`: Complete list with live badge counters.
  - `Online / PayMongo`: Displays all digital contributions made through QR Ph, GCash, Maya, and credit/debit cards.
  - `Direct Cash`: Isolates physical over-the-counter cash donations received in the parish office (strictly excluding digital GCash transactions).
  - `In-Kind & Relief Packs`: Tracks non-cash goods such as food packs, medicine, and hygiene kits.
* **Transaction Inspector Modal:** Clicking any record displays donor metadata, payment method, restricted sector, and the immutable **Blockchain Hash / Reference Number**.

#### 5. Beneficiary Management & Sector Directory Tab
* **Purpose:** Manages the registry of parish aid recipients and scholar applicants.
* **Filtered Population:** Exclusively displays active beneficiaries (`role === 'beneficiary'` or assigned ministry sector), keeping the directory focused and isolated from general donors or mobile accounts.
* **6 Restricted Ministries:**
  1. **Senior Citizens:** Medical assistance, food sustenance, and elderly care.
  2. **Scholars:** Educational grants, monthly allowances, and academic tracking.
  3. **PWD (Persons with Disabilities):** Mobility aid, therapy assistance, and accessibility support.
  4. **Prison Ministry:** Rehabilitation packs, legal aid assistance, and spiritual care.
  5. **Solo Parents:** Childcare support and livelihood grants.
  6. **Disaster Relief:** Rapid emergency response kits and calamity assistance.
* **Ministry Budget Collapse Strip:** Allows administrators to inspect the allocated budget, amount disbursed, and remaining balance for each sector.

#### 6. Aid Disbursement Sub-Module
* **Purpose:** Releases funds directly to an individual beneficiary.
* **Mechanism:** When an administrator clicks **"Disburse Aid"**, inputs an amount (e.g., ₱1,500), and confirms:
  1. The amount is added to the beneficiary's personal relief history log.
  2. The total disbursed count increments.
  3. The amount is deducted in real-time from that sector's restricted fund balance.

#### 7. User & Access Management Tab
* **Purpose:** Oversees all registered accounts across the entire platform.
* **Segmented Subtabs:**
  - `Admins & Staff`: Administrative personnel with elevated privileges.
  - `Registered Members`: Mobile donors and community users.
  - `Pending Approvals`: Accounts requiring administrative validation.
* **Action Capabilities:** Edit profile, reset password, change system role, or deactivate account.

---

### B. Mobile Application Modules (Donor & Community)

#### 1. Mobile Registration & Secure Onboarding
* **Purpose:** Allows new donors to create an account with full name, email, contact number, and password.
* **Password Recovery:** Includes OTP email recovery for forgotten passwords.

#### 2. Mobile Donation Flow (QRPH PayMongo)
* **Step 1:** Donor opens the app and selects **"Make a Donation"**.
* **Step 2:** Donor chooses a donation amount (e.g., ₱100, ₱500, ₱1,000, or custom).
* **Step 3:** Donor chooses a **Restricted Ministry Destination** (e.g., *Scholars*, *Disaster Relief*, *Senior Citizens*).
* **Step 4:** Payment Method displays **QRPH PayMongo**.
* **Step 5:** The app initializes a PayMongo Checkout Session via the backend and displays the official QR Ph payment screen.
* **Step 6:** Donor scans the QR code using **GCash**, **Maya**, **BPI**, **GoTyme**, or any QR Ph banking app.
* **Step 7:** The app automatically polls `/api/payments/paymongo/auto-verify/:donationId`, confirms payment settlement, and issues an instant verified digital receipt.

#### 3. Donation History & Traceability
* **Purpose:** Donors can review all past donations, view cryptographic verification codes, and download digital proofs of donation.

---

## 5. The Two Core Innovations Explained

### Innovation 1: Blockchain Ledger & Cryptographic Auditing
* **The Problem:** In traditional SQL/NoSQL databases, a rogue administrator could directly edit the database table and change donation amounts or delete transactions without a trace.
* **ReliefLink's Solution:** Every donation is converted into a cryptographic block:
  $$\text{Block Hash} = \text{SHA-256}(\text{Index} + \text{Timestamp} + \text{DonorID} + \text{Amount} + \text{Destination} + \text{Previous Hash})$$
* **Why it matters:** 
  - If anyone modifies a transaction retroactively, the hash changes, breaking the cryptographic chain.
  - The system detects tampering immediately, ensuring **100% financial auditability**.

---

### Innovation 2: Prescriptive Analytics Engine
* **Descriptive Analytics:** *"What happened?"* (e.g., ₱50,000 was disbursed to scholars last month).
* **Predictive Analytics:** *"What will happen?"* (e.g., Scholar applications will increase by 15% next term).
* **Prescriptive Analytics (ReliefLink):** *"What should we do?"* — The system provides automated, actionable recommendations.

#### Prescriptive Scoring Formula for Scholars:
$$\text{Prescriptive Score} = (w_1 \times \text{Academic Metric}) + (w_2 \times \text{Financial Need}) + (w_3 \times \text{Ministry Service})$$

* **1. Academic Performance (GWA):**
  - GWA $\le 1.75 \implies \text{High Academic Standing (Tier 1)}$
  - GWA $1.76 - 2.50 \implies \text{Satisfactory (Tier 2)}$
* **2. Financial Vulnerability (Household Income):**
  - Income $< \text{₱15,000/mo} \implies \text{High Priority Need}$
* **3. Parish Service Rendered:**
  - Verified active hours in parish youth/liturgical ministry.
* **System Actionable Recommendations:**
  - **`Fast-Track Renewal`**: High GWA + Low Household Income + Active Service.
  - **`Service Hours Pending`**: Good GWA, but requires community service completion before allowance release.
  - **`Document Review Required`**: Missing indigency certificate or report card.

---

## 6. Payment Gateway Architecture (PayMongo & QR Ph)

1. **National Standard (QR Ph):** ReliefLink adopts Bangko Sentral ng Pilipinas (BSP) QR Ph interoperability. One QR code accepts payments from GCash, Maya, BDO, BPI, UnionBank, RCBC, and ShopeePay.
2. **Security:** Transactions are processed via HTTPS using TLS 1.3 encryption. Secret keys (`sk_live_...`) remain protected in backend environment variables and are never exposed to the client.
3. **Auto-Verification:** The backend polls the PayMongo API endpoint `https://api.paymongo.com/v1/checkout_sessions/:id` to confirm payment state transitions from `unpaid` $\to$ `paid`.

---

## 7. Panel Defense Q&A Preparation (Tough Questions & Answers)

### Q1: "Why do you need Blockchain? Isn't MongoDB enough?"
> **Answer:** *"MongoDB is great for fast operational queries, but traditional databases are mutable — anyone with database access can alter records. By computing SHA-256 cryptographic hashes chained to previous transactions, ReliefLink creates an immutable audit trail. Any tampering is mathematically detected, providing donors with verifiable proof that their funds have not been altered."*

### Q2: "How is your Prescriptive Analytics different from a simple IF-ELSE filter?"
> **Answer:** *"A simple filter only filters static data. Our prescriptive analytics engine computes a multi-attribute evaluation model (GWA, household poverty threshold, and parish service hours) to generate prioritized recommendations (e.g., 'Fast-Track Renewal', 'Service Hours Pending'). This helps administrators allocate limited parish funds to the most deserving beneficiaries objectively."*

### Q3: "How do you handle unverified or pending donations in the financial ledger?"
> **Answer:** *"Our ledger strictly segregates unverified transactions. Financial metrics like Net Relief Funds, Total Ledger Volume, and Average Contribution only calculate 100% verified and approved contributions. Unverified or abandoned checkout sessions are marked as pending and do not distort financial reporting."*

### Q4: "How does the system ensure data privacy (Data Privacy Act of 2012 / RA 10173)?"
> **Answer:** *"ReliefLink enforces password hashing using Bcrypt, stateless JSON Web Token (JWT) session authorization, and Role-Based Access Control (RBAC). Beneficiary and donor personal details are protected behind authorized admin endpoints, and sensitive transaction logs store cryptographic hashes rather than raw banking credentials."*

---
*ReliefLink Capstone Manuscript & Module Reference — National University CCIT 2026*

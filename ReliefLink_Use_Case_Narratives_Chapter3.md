# ReliefLink: Sto. Domingo Parish Disaster Relief & Treasury Management System
# Chapter 3: System Use Case Narratives (Tables 10, 11, and 12)
# Conforming to National University - Manila CCIT Capstone Manuscript Standards

---

## Table 10: Use Case Narratives of the Web User Application

### 1. Homepage
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Homepage** |
| **Actor(s)** | User |
| **Description** | User can see the main Homepage of the website where the user will see Sto. Domingo Parish disaster relief mission, key statistics (Relief Raised, Ethereum Verified), the About Us section, and app download options. |
| **Pre-condition** | Click the webpage link. |
| **Post-condition** | Access to the respective Homepage. |
| **Main Scenario** | • User will search or open the ReliefLink Webpage.<br/>• Click the Link of the Webpage.<br/>• Redirected to the Homepage.<br/>• User will view parish missions, relief statistics, and project overview. |
| **Alternative Scenario** | • User does not click the link of the webpage.<br/>• User will not be able to see the Homepage. |

---

### 2. About Us
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **About Us** |
| **Actor(s)** | User |
| **Description** | The User can browse the About Us section for information about Sto. Domingo Parish (National Shrine of Our Lady of the Holy Rosary) and the ReliefLink blockchain transparency commitment. |
| **Pre-condition** | Click the About Us navigation link or scroll to the About section. |
| **Post-condition** | Browse the about us section and read the information. |
| **Main Scenario** | • User will click the About Us link or scroll down.<br/>• User can now read information about Sto. Domingo Parish and ReliefLink.<br/>• User views the parish commitment to transparent disaster relief. |
| **Alternative Scenario** | • User does not navigate to About Us.<br/>• User will not be able to view information about Sto. Domingo Parish. |

---

### 3. Contact Us
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Contact Us** |
| **Actor(s)** | User |
| **Description** | The User can open the Contact Us modal to view Sto. Domingo Parish contact details, office hours, and church administration inquiry channels. |
| **Pre-condition** | Click the Contact Us button in the navigation bar or footer. |
| **Post-condition** | Contact modal is displayed on the screen. |
| **Main Scenario** | • User will click the "Contact Us" button.<br/>• System opens the interactive Contact Us modal.<br/>• User views parish address, telephone numbers, and email inquiries. |
| **Alternative Scenario** | • User does not click Contact Us.<br/>• Contact details modal will not be displayed. |

---

### 4. Install App
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Install App** |
| **Actor(s)** | User |
| **Description** | The User can navigate to the Download page to install the ReliefLink Android mobile application, view QR codes, and read APK installation instructions. |
| **Pre-condition** | Click the "Download App" button. |
| **Post-condition** | Application download page is displayed and APK is downloaded. |
| **Main Scenario** | • User will click the "Download App" button on the navbar or hero section.<br/>• Redirected to the Download App page (`/download`).<br/>• User will scan the QR code or click "Download Android App" to install on their phone. |
| **Alternative Scenario** | • User does not click Download App.<br/>• User will not be able to download the mobile app. |

---

## Table 11: Use Case Narratives of the Web Admin Application

### 1. Login
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Login** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can log in using registered credentials to access the system's administrative features and financial management tools. |
| **Pre-condition** | Open the admin login page (`/admin-login`). |
| **Post-condition** | The admin is granted access to the admin dashboard. |
| **Main Scenario** | • Admin enters valid credentials.<br/>• Clicks the "Login" button.<br/>• Redirected to the admin dashboard. |
| **Alternative Scenario** | • Admin enters invalid credentials.<br/>• Clicks the "Login" button.<br/>• An "Invalid Credentials" error message is displayed. |

---

### 2. Dashboard
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Dashboard** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can view the overall financial reports, total donations received, available on-hand treasury, total relief disbursed, and the historical inflow vs outflow trajectory chart. |
| **Pre-condition** | Login admin account. |
| **Post-condition** | Dashboard will be seen on the screen. |
| **Main Scenario** | • Login successfully as admin.<br/>• View dashboard KPI cards and financial trajectory chart. |
| **Alternative Scenario** | • Not logged in as admin.<br/>• No dashboard will be shown. |

---

### 3. View Reports (Financial Audit)
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **View Reports** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can review audited financial statements, cross-reference database records against the Hyperledger Besu blockchain, and export certified PDF and CSV audit reports. |
| **Pre-condition** | Login as admin and navigate to the Reports module. |
| **Post-condition** | Financial reports are processed and generated. |
| **Main Scenario** | • Click "Reports".<br/>• View double-entry financial statements and blockchain consensus proof.<br/>• Click "Generate Report" to export certified diocesan PDF. |
| **Alternative Scenario** | • Review reports without exporting; data remains visible on screen. |

---

### 4. Manage Donations
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Manage Donations** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can view and monitor donation transactions, verify net amounts against gateway fees, inspect digital receipts, and copy the Ethereum transaction hash. |
| **Pre-condition** | Login as admin and navigate to donation management. |
| **Post-condition** | Donation records and blockchain hashes are verified. |
| **Main Scenario** | • Click "Donation Management".<br/>• View incoming online and manual cash contributions.<br/>• Click "View Details" to inspect the transaction hash and receipt. |
| **Alternative Scenario** | • Search for non-existent reference code; table shows "No donations found." |

---

### 5. Manage Expenses
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Manage Expenses** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can view, record, and verify parish relief operational expenses, bulk supply purchases, and inspect attached scanned receipts and vouchers. |
| **Pre-condition** | Login as admin and navigate to expenses management. |
| **Post-condition** | Expense records are updated and reflected in treasury totals. |
| **Main Scenario** | • Click "Expenses".<br/>• View expense list and attached receipts.<br/>• Click "Inspect Voucher" to review supplier invoice details. |
| **Alternative Scenario** | • Attempt to record expense with missing amount or category; system shows error and prevents saving. |

---

### 6. Manage Prescriptive Analytics
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Manage Prescriptive Analytics** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can review mathematically recommended budget allocations across the 7 parish sectors based on active beneficiary headcounts and vulnerability urgency weights. |
| **Pre-condition** | Login as admin and navigate to Reports > Prescriptive Analytics. |
| **Post-condition** | Prescribed budget targets and variance bar charts are displayed. |
| **Main Scenario** | • The admin logs into the system.<br/>• Navigates to the Prescriptive Analytics section.<br/>• System displays the Optimization Matrix and Variance Bar Chart.<br/>• The admin reviews recommended budgets to guide upcoming relief distributions. |
| **Alternative Scenario** | • If no treasury funds are available, the system displays "No unallocated funds available." |

---

### 7. Manage Beneficiaries and Sector Groups
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Manage Beneficiaries** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can add, update, or reclassify beneficiary records (e.g., Urban Poor, Scholars, Elderly), view scholar GWA and income data, and reassign sector groups using an interactive dropdown. |
| **Pre-condition** | Login as admin and navigate to Beneficiary Management. |
| **Post-condition** | Beneficiary records and assigned sector groups are updated in the system. |
| **Main Scenario** | • The admin accesses the "Beneficiary Management" section.<br/>• The system displays the list of parish beneficiaries and scholars.<br/>• The admin selects a beneficiary to edit details or change their Sector Group.<br/>• The admin saves the changes.<br/>• The system updates the records, and changes reflect immediately. |
| **Alternative Scenario** | • The admin attempts to submit incomplete beneficiary details.<br/>• The system displays an error message and prevents saving until complete. |

---

### 8. Disburse Aid
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Disburse Aid** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can disburse financial relief assistance or scholar allowances to a selected beneficiary, debiting funds using FIFO logic and recording on the blockchain. |
| **Pre-condition** | Login as admin and select an eligible beneficiary. |
| **Post-condition** | Aid is disbursed, treasury is debited, and record is saved on the blockchain. |
| **Main Scenario** | • The admin selects a beneficiary.<br/>• Click the Disburse Aid button (banknote icon).<br/>• Enter the disbursement amount and confirm.<br/>• System debits treasury and records the transaction on-chain. |
| **Alternative Scenario** | • Entered amount is greater than the available church funds.<br/>• System will show an error and block the transaction. |

---

### 9. Post Announcement
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Post Announcement** |
| **Actor(s)** | Admin / Parish Staff |
| **Description** | The admin can create, schedule, and post disaster advisories and updates to the mobile users. |
| **Pre-condition** | Login as admin and open Announcement tab. |
| **Post-condition** | Admin will be able to post updates, and mobile users will be able to view them. |
| **Main Scenario** | • Click "Announcement".<br/>• Fill in title (5–120 chars), category, details, and date.<br/>• Post the announcement.<br/>• Update appears on the active feed. |
| **Alternative Scenario** | • Attempt to post with empty required fields; system highlights errors and post is not published. |

---

## Table 12: Use Case Narratives of the Mobile Application

### 1. Register
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Register** |
| **Actor(s)** | User |
| **Description** | The user will register for an account by providing personal information and completing 6-digit email OTP verification. |
| **Pre-condition** | Access the mobile registration screen. |
| **Post-condition** | The user will have an active account and be able to log in. |
| **Main Scenario** | • Click the "Register" button.<br/>• Fill out the registration form completely.<br/>• Submit the form.<br/>• The system sends a 6-digit OTP code to the user's registered email.<br/>• The user enters the OTP for verification.<br/>• Account is activated, and user is redirected to the login screen. |
| **Alternative Scenario** | • User enters invalid email, mismatched passwords, or wrong OTP.<br/>• System displays error message and prompts to re-enter. |

---

### 2. Login
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Login** |
| **Actor(s)** | User |
| **Description** | The user can log in using registered credentials to access the mobile application. |
| **Pre-condition** | Open the mobile login page. |
| **Post-condition** | The user is granted access to the mobile home screen. |
| **Main Scenario** | • Enter valid credentials.<br/>• Click the "Login" button.<br/>• Redirected to the mobile home screen. |
| **Alternative Scenario** | • Enter invalid credentials.<br/>• Click the "Login" button.<br/>• An "Invalid Credentials" message will appear. |

---

### 3. Home Screen
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **HomeScreen** |
| **Actor(s)** | User |
| **Description** | The home screen serves as the primary mobile interface, providing total donated statistics, the interactive "Where Your Donations Go" donut chart, announcements carousel, and navigation. |
| **Pre-condition** | User must be successfully logged into the mobile application. |
| **Post-condition** | User gains access to the main dashboard with giving summary and navigation. |
| **Main Scenario** | • User logs into the ReliefLink mobile application.<br/>• System displays home screen with personal donation statistics.<br/>• User views the interactive donut chart showing category distribution.<br/>• User navigates to desired features. |
| **Alternative Scenario** | • User experiences connection issues.<br/>• System displays cached content and prompts to check connection. |

---

### 4. Donate Now (Online Giving)
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **Donate Now** |
| **Actor(s)** | User |
| **Description** | The user can make donations to selected parish ministries using GCash, Maya, or bank cards via PayMongo. |
| **Pre-condition** | Tap the "Donate Now" button on the home screen. |
| **Post-condition** | Donation is processed and mined on the Hyperledger Besu blockchain. |
| **Main Scenario** | • Tap "Donate Now".<br/>• Select a parish ministry and choose an amount.<br/>• Tap "Proceed to Payment".<br/>• Complete payment through PayMongo checkout.<br/>• Digital receipt and blockchain confirmation are displayed. |
| **Alternative Scenario** | • User cancels payment or closes payment window.<br/>• Transaction is cancelled and no money is deducted. |

---

### 5. View Transparency
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **View Transparency** |
| **Actor(s)** | User |
| **Description** | The user can track how their donation was used, view fund status progress bars, check field distribution photos, and inspect the Smart Contract Transaction Hash. |
| **Pre-condition** | Tap the "Transparency" tab in bottom navigation. |
| **Post-condition** | Fund utilization progress and blockchain proof are displayed. |
| **Main Scenario** | • User taps the Transparency tab.<br/>• Views Giving Impact cards with fund status (Cash on Hand, Partially Used, Fully Disbursed).<br/>• Views attached relief operation photos.<br/>• Copies the 66-character Smart Contract Transaction Hash. |
| **Alternative Scenario** | • User has made no donations yet.<br/>• System displays parish-wide transparency statistics. |

---

### 6. View Announcements
| Field | Content |
| :--- | :--- |
| **Use Case Name** | **View Announcements** |
| **Actor(s)** | User |
| **Description** | The user can view disaster advisories and relief updates posted by the parish admin. |
| **Pre-condition** | Open the Announcements tab. |
| **Post-condition** | Updates and announcements are displayed on the screen. |
| **Main Scenario** | • Click the Announcements tab.<br/>• View the list of active parish bulletins and relief distribution schedules. |
| **Alternative Scenario** | • No updates available; page displays "No updates yet." |

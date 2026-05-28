# ReliefLink - Transparent Giving Platform

ReliefLink is a comprehensive full-stack application designed to transform charitable giving through verified donations, transparent tracking, and blockchain verification. The platform includes a modern web dashboard, mobile app, and secure backend API.

## 🎯 Features

- **Transparent Donations**: Track every donation with verified receipts and transparent impact metrics
- **Secure Payments**: Industry-standard encryption and security measures for all transactions
- **Admin Dashboard**: Manage donations, expenses, inventory, and generate compliance reports
- **Mobile App**: Donate on-the-go with Flutter mobile applications
- **Blockchain Verification**: Immutable transaction records using blockchain technology
- **OTP Authentication**: Secure SMS and email-based authentication
- **Real-time Reporting**: Generate detailed donation and expense reports
- **User Profiles**: Manage personal information and donation history

## 📁 Project Structure

```
relieflinktest/
├── backend/              # Node.js + Express API server
├── frontend/             # React + Vite web application
├── mobile/               # Flutter mobile app
├── blockchain/           # Blockchain transaction module
└── README.md             # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v24.13.0
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (1-day expiry)
- **Security**: Helmet.js, CORS, Rate Limiting
- **Password Hashing**: bcryptjs (10 salt rounds)
- **OTP**: SMS & Email integration

### Frontend
- **Framework**: React 18.2.0
- **Bundler**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Styling**: CSS with design variables
- **Font**: Inter (Google Fonts)

### Mobile
- **Framework**: Flutter
- **Language**: Dart
- **Package Manager**: pub.dev

### Blockchain
- **Purpose**: Transaction verification and immutability
- **Implementation**: Custom Block and Blockchain classes

## 🚀 Getting Started

### Prerequisites
- Node.js v24.13.0 or higher
- npm or yarn
- MongoDB Atlas account (for database)
- Flutter SDK (for mobile development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `backend` directory:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/relieflink?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   PORT=5001
   NODE_ENV=development
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   DEV_SHOW_OTP=true
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3001`

### Mobile Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run on emulator or device**
   ```bash
   flutter run
   ```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register as staff/user
- `POST /register-admin` - Register as admin
- `POST /login` - User login
- `POST /forgot-password` - Password recovery
- `POST /logout` - User logout

### Donations (`/api/donations`)
- `GET /` - Get all donations
- `GET /:id` - Get specific donation
- `POST /` - Create donation
- `PUT /:id` - Update donation
- `DELETE /:id` - Delete donation

### Expenses (`/api/expenses`)
- `GET /` - Get all expenses
- `POST /` - Record new expense
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense

### Inventory (`/api/inventory`)
- `GET /` - Get inventory items
- `POST /` - Add inventory item
- `PUT /:id` - Update item quantity
- `DELETE /:id` - Remove item

### Reports (`/api/reports`)
- `GET /` - Generate reports
- `POST /` - Create new report
- `GET /:id` - Get report details

### OTP (`/api/otp`)
- `POST /send` - Send OTP via SMS/Email
- `POST /verify` - Verify OTP code

## 👥 User Roles

- **Admin**: Full access to all features, user management, and reporting
- **Staff**: Can manage donations and expenses, view reports
- **Donor**: Can make donations and view contribution history
- **User**: Standard user account

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication with 1-day expiry
- **Password Hashing**: bcryptjs with 10 salt rounds
- **CORS**: Cross-origin request protection
- **Rate Limiting**: DDoS and brute-force protection
- **Helmet.js**: HTTP security headers
- **SSL/TLS**: Secure database connections
- **OTP Verification**: Two-factor authentication support

## 📊 Database Models

- **User**: Admin, staff, and donor accounts
- **Donations**: Donation records with receipt verification
- **Expenses**: Organizational expense tracking
- **Inventory**: Resource and supply management
- **Report**: Compliance and impact reporting

## 🧪 Testing

The project includes:
- `backend/playground-2.mongodb.js` - MongoDB query examples
- `frontend/src/playground-1.mongodb.js` - Frontend API testing
- `backend/seedDonations.js` - Sample data seeding script

## 📦 Dependencies

**Backend Key Dependencies:**
- express@^4.18.2
- mongoose@^7.0.0
- bcryptjs@^2.4.3
- jsonwebtoken@^9.0.0
- helmet@^7.0.0
- cors@^2.8.5
- dotenv@^17.2.3

**Frontend Key Dependencies:**
- react@^18.2.0
- react-router-dom@^6.0.0
- axios@^1.4.0
- vite@^4.0.0

## 🔄 Development Workflow

1. **Start backend** in one terminal:
   ```bash
   cd backend && npm start
   ```

2. **Start frontend** in another terminal:
   ```bash
   cd frontend && npm run dev
   ```

3. **Access the application**:
   - Web: http://localhost:3001
   - API: http://localhost:5001

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=          # MongoDB Atlas connection string
JWT_SECRET=           # JWT signing secret
PORT=                 # Backend port (default: 5001)
NODE_ENV=             # development/production
SMTP_USER=            # Email for OTP notifications
SMTP_PASS=            # Email app password
DEV_SHOW_OTP=         # Show OTP in console (dev only)
```

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure MongoDB Atlas IP whitelist includes your machine
- Check `MONGODB_URI` in `.env` file
- Verify network connectivity to MongoDB

### Frontend API Errors
- Confirm backend is running on port 5001
- Check CORS settings in `backend/Server.js`
- Clear browser cache and restart dev server

### Mobile App Issues
- Run `flutter clean` before rebuilding
- Ensure Flutter SDK is up to date
- Check API endpoint configuration in `lib/services/api_service.dart`

## 📄 License

This project is proprietary and confidential.

## 👨‍💻 Contributing

For contributions and bug reports, please contact the development team.

## 📞 Support

For issues or questions, please reach out to the ReliefLink development team.

---

**Last Updated**: May 2026
**Version**: 1.0.0

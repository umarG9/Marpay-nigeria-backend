const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// MARPAY OWNER - Umar Hadi Gwani
// OPay: 7012869066
// ============================================
const OWNER = {
  fullName: "Umar Hadi Gwani",
  phone: "09026133849",
  opayAccount: "7012869066",
  bankName: "OPay",
  accountName: "Umar Hadi Gwani",
  location: "Nigeria"
};

// In-Memory Database (No MongoDB Needed)
let users = [];
let transactions = [];

// Generate MarPay Account Number
function generateAccountNumber() {
  return '90' + Math.floor(10000000 + Math.random() * 90000000);
}

// ============================================
// ROUTES
// ============================================

// Home Route
app.get('/', (req, res) => {
  res.json({
    message: 'MarPay Nigeria - NIN Only, No BVN ✅',
    version: '1.0.0 - No Database Mode',
    owner: OWNER,
    totalUsers: users.length,
    totalTransactions: transactions.length,
    endpoints: {
      owner: '/api/owner',
      register: 'POST /api/auth/register',
      allUsers: '/api/users',
      wallet: 'GET /api/wallet/:phone',
      fund: 'POST /api/wallet/fund',
      transfer: 'POST /api/wallet/transfer'
    },
    status: 'Running Perfectly Without MongoDB!'
  });
});

// Get Owner Info (Your OPay)
app.get('/api/owner', (req, res) => {
  res.json({
    status: 'success',
    data: OWNER
  });
});

// Register New User - NIN Only (11 digits)
app.post('/api/auth/register', (req, res) => {
  try {
    const { phone, nin, firstName, lastName } = req.body;

    // Validation
    if (!phone || !nin || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields required: phone, nin, firstName, lastName' });
    }

    if (nin.length !== 11) {
      return res.status(400).json({ message: 'NIN must be exactly 11 digits' });
    }

    if (phone.length !== 11) {
      return res.status(400).json({ message: 'Phone must be 11 digits e.g 09026133849' });
    }

    // Check if exists
    const exists = users.find(u => u.phone === phone || u.nin === nin);
    if (exists) {
      return res.status(400).json({ message: 'User with this Phone or NIN already exists' });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      phone: phone,
      nin: nin,
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`,
      accountNumber: generateAccountNumber(),
      balance: 0,
      tierLimit: 300000,
      kycType: 'NIN Only - No BVN',
      settlementAccount: OWNER.opayAccount,
      createdAt: new Date()
    };

    users.push(newUser);

    res.json({
      status: 'success',
      message: 'MarPay Account Created Successfully!',
      data: newUser,
      owner: OWNER
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Users
app.get('/api/users', (req, res) => {
  res.json({
    status: 'success',
    total: users.length,
    owner: OWNER,
    users: users
  });
});

// Get Wallet Balance
app.get('/api/wallet/:phone', (req, res) => {
  const user = users.find(u => u.phone === req.params.phone);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({
    status: 'success',
    phone: user.phone,
    accountNumber: user.accountNumber,
    balance: user.balance,
    fullName: user.fullName,
    owner: OWNER
  });
});

// Fund Wallet (Add Money)
app.post('/api/wallet/fund', (req, res) => {
  const { phone, amount } = req.body;
  const user = users.find(u => u.phone === phone);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user

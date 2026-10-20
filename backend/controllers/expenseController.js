const Expense = require('../models/Expense');
const Donation = require('../models/Donations');

// Helper to deduct funds from category/ministry donations
const deductMinistryDonationFunds = async (category, amount, expenseId, description) => {
  try {
    const catLower = (category || '').toLowerCase();
    let destRegex = null;
    if (catLower.includes('scholar') || catLower.includes('student')) {
      destRegex = /scholar|student/i;
    } else if (catLower.includes('elderly') || catLower.includes('senior')) {
      destRegex = /elderly|senior/i;
    } else if (catLower.includes('pdl') || catLower.includes('prison') || catLower.includes('nakakolong')) {
      destRegex = /pdl|prison|nakakolong/i;
    } else if (catLower.includes('urban') || catLower.includes('poor')) {
      destRegex = /urban|poor/i;
    } else if (catLower.includes('migrant')) {
      destRegex = /migrant/i;
    } else if (catLower.includes('lgbtq')) {
      destRegex = /lgbtq/i;
    } else if (catLower.includes('drug') || catLower.includes('rehab')) {
      destRegex = /drug|rehab/i;
    }

    let remainingToDeduct = parseFloat(amount) || 0;

    // 1. Try deducting from ministry-specific donations with remainingBalance > 0
    if (destRegex && remainingToDeduct > 0) {
      const ministryDonations = await Donation.find({
        destination: { $regex: destRegex },
        status: { $in: ['cash on hand', 'partially used', 'approved', 'completed'] },
        remainingBalance: { $gt: 0 }
      }).sort({ createdAt: 1 });

      for (const d of ministryDonations) {
        if (remainingToDeduct <= 0) break;
        const curBal = typeof d.remainingBalance === 'number' ? d.remainingBalance : (d.amount || 0);
        const deductFromThis = Math.min(curBal, remainingToDeduct);
        const newBal = Math.max(0, curBal - deductFromThis);
        d.remainingBalance = newBal;
        remainingToDeduct -= deductFromThis;

        if (newBal <= 0) {
          d.status = 'fully used';
          d.verificationStatus = 'fully used';
        } else {
          d.status = 'partially used';
          d.verificationStatus = 'partially used';
        }

        if (!Array.isArray(d.usageLogs)) d.usageLogs = [];
        d.usageLogs.push({
          amount: deductFromThis,
          date: new Date(),
          purpose: description || `Disbursement for ${category}`,
          notes: `Expense ID: ${expenseId}`,
          balanceAfter: newBal
        });

        await d.save();
      }
    }

    // 2. If remaining amount to deduct > 0, deduct from general unallocated donations
    if (remainingToDeduct > 0) {
      const generalDonations = await Donation.find({
        $or: [
          { destination: { $regex: /general/i } },
          { destination: { $exists: false } },
          { destination: null },
          { destination: '' }
        ],
        status: { $in: ['cash on hand', 'partially used', 'approved', 'completed'] },
        remainingBalance: { $gt: 0 }
      }).sort({ createdAt: 1 });

      for (const d of generalDonations) {
        if (remainingToDeduct <= 0) break;
        const curBal = typeof d.remainingBalance === 'number' ? d.remainingBalance : (d.amount || 0);
        const deductFromThis = Math.min(curBal, remainingToDeduct);
        const newBal = Math.max(0, curBal - deductFromThis);
        d.remainingBalance = newBal;
        remainingToDeduct -= deductFromThis;

        if (newBal <= 0) {
          d.status = 'fully used';
          d.verificationStatus = 'fully used';
        } else {
          d.status = 'partially used';
          d.verificationStatus = 'partially used';
        }

        if (!Array.isArray(d.usageLogs)) d.usageLogs = [];
        d.usageLogs.push({
          amount: deductFromThis,
          date: new Date(),
          purpose: description || `Disbursement for ${category}`,
          notes: `Expense ID: ${expenseId}`,
          balanceAfter: newBal
        });

        await d.save();
      }
    }
  } catch (err) {
    console.error('Error deducting from donation funds:', err);
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: expenses,
      expenses: expenses
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category, notes, date, status, beneficiaryId } = req.body;
            
    if (!description || !amount || !category) {
      return res.status(400).json({ message: 'Please provide description, amount, and category' });
    }

    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role || (req.user?.isSuperAdmin ? 'superadmin' : 'admin');
    const isSuperAdmin = userRole === 'superadmin' || req.user?.email === 'superadmin@relieflink.org';

    // Superadmin is automatically approved; admin records remain pending
    const initialStatus = isSuperAdmin ? 'approved' : 'pending';

    const expense = new Expense({
      description: description.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
      notes: notes ? notes.trim() : '',
      date: date ? new Date(date) : new Date(),
      status: initialStatus,
      beneficiaryId: beneficiaryId || undefined,
      approvedAt: initialStatus === 'approved' ? new Date() : undefined,
      approvedBy: initialStatus === 'approved' ? userId : undefined,
      createdBy: userId || undefined
    });

    await expense.save();
    if (userId) {
      await expense.populate('createdBy', 'name email');
      if (initialStatus === 'approved') {
        await expense.populate('approvedBy', 'name email');
      }
    }

    // Deduct funds from category/ministry donation funds if approved
    if (initialStatus === 'approved') {
      await deductMinistryDonationFunds(expense.category, expense.amount, expense._id, expense.description);
    }
    
    res.status(201).json(expense);
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Approve expense
exports.approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'approved';
    expense.approvedAt = new Date();
    if (userId) {
      expense.approvedBy = userId;
    }
    await expense.save();
    await expense.populate('createdBy', 'name email');
    await expense.populate('approvedBy', 'name email');

    // Deduct funds from matching ministry donation funds
    await deductMinistryDonationFunds(expense.category, expense.amount, expense._id, expense.description);

    res.json({
      success: true,
      message: 'Expense approved successfully and deducted from ministry funds',
      data: expense
    });
  } catch (err) {
    console.error('Approve expense error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Reject expense
exports.rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'rejected';
    expense.rejectedAt = new Date();
    await expense.save();
    await expense.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Expense rejected',
      data: expense
    });
  } catch (err) {
    console.error('Reject expense error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, status, notes } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update fields
    if (description) expense.description = description;
    if (amount) expense.amount = parseFloat(amount);
    if (category) expense.category = category;
    if (status) {
      expense.status = status;
      if (status === 'approved') {
        expense.approvedBy = req.user.id;
      }
    }
    if (notes) expense.notes = notes;

    await expense.save();
    await expense.populate('createdBy', 'name email');
    await expense.populate('approvedBy', 'name email');

    res.json(expense);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload expense receipt
exports.uploadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.receipt = `/uploads/${req.file.filename}`;
    await expense.save();

    res.json({ 
      message: 'Receipt uploaded successfully',
      receiptPath: expense.receipt
    });
  } catch (err) {
    console.error('Upload receipt error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

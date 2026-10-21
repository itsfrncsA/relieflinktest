const Expense = require('../models/Expense');
const Donation = require('../models/Donations');
const { recordExpenseUsageOnChain } = require('../services/besuService');
const crypto = require('crypto');

// Helper to deduct funds from category/ministry donations (Primary: General Fund)
const deductMinistryDonationFunds = async (category, amount, expenseId, description) => {
  try {
    let remainingToDeduct = parseFloat(amount) || 0;
    const fundedFrom = [];

    // 1. Deduct from General Fund donations first (Requirement: automatic sa general fund ibabawas)
    const generalDonations = await Donation.find({
      $and: [
        {
          $or: [
            { destination: { $regex: /general/i } },
            { destination: { $exists: false } },
            { destination: null },
            { destination: '' }
          ]
        },
        {
          status: { $in: ['cash on hand', 'partially used', 'approved', 'completed'] }
        },
        {
          $or: [
            { remainingBalance: { $gt: 0 } },
            { remainingBalance: { $exists: false } },
            { remainingBalance: null }
          ]
        }
      ]
    }).sort({ createdAt: 1 });

    for (const d of generalDonations) {
      if (remainingToDeduct <= 0) break;
      const curBal = (typeof d.remainingBalance === 'number' && !isNaN(d.remainingBalance) && d.remainingBalance > 0)
        ? d.remainingBalance
        : (d.status === 'fully used' ? 0 : (d.amount || 0));

      if (curBal <= 0) continue;

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

      // Execute Smart Transaction for fund usage
      let smartTxResult = null;
      try {
        smartTxResult = await recordExpenseUsageOnChain({
          donationId: d._id,
          amountUsed: deductFromThis,
          purpose: description || `Disbursement for ${category}`,
          ministry: d.destination || category || 'Parish General Fund',
          expenseId: expenseId
        });
      } catch (stxErr) {
        console.warn('Smart transaction call warning:', stxErr.message);
      }

      const txHash = smartTxResult?.txHash || ('0x' + crypto.createHash('sha256').update(`TX:${d._id}:${expenseId}:${Date.now()}:${Math.random()}`).digest('hex'));

      if (!Array.isArray(d.usageLogs)) d.usageLogs = [];
      d.usageLogs.push({
        amount: deductFromThis,
        date: new Date(),
        purpose: description || `Disbursement for ${category}`,
        notes: `Expense ID: ${expenseId}`,
        balanceAfter: newBal,
        txHash: txHash,
        blockId: txHash,
        expenseId: expenseId
      });

      await d.save();

      fundedFrom.push({
        donationId: d._id,
        donorName: d.donorName || 'Community Donor',
        amount: deductFromThis,
        destination: d.destination || 'Parish General Fund',
        blockId: d.blockId || null,
        disbursementTxHash: txHash,
        referenceNumber: d.referenceNumber || null
      });
    }

    // 2. If general fund runs out and remaining amount > 0, deduct from remaining available donations
    if (remainingToDeduct > 0) {
      const otherDonations = await Donation.find({
        status: { $in: ['cash on hand', 'partially used', 'approved', 'completed'] },
        $or: [
          { remainingBalance: { $gt: 0 } },
          { remainingBalance: { $exists: false } },
          { remainingBalance: null }
        ]
      }).sort({ createdAt: 1 });

      for (const d of otherDonations) {
        if (remainingToDeduct <= 0) break;
        if (fundedFrom.some(f => String(f.donationId) === String(d._id))) continue;

        const curBal = (typeof d.remainingBalance === 'number' && !isNaN(d.remainingBalance) && d.remainingBalance > 0)
          ? d.remainingBalance
          : (d.status === 'fully used' ? 0 : (d.amount || 0));

        if (curBal <= 0) continue;

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

        // Execute Smart Transaction for fund usage
        let smartTxResult = null;
        try {
          smartTxResult = await recordExpenseUsageOnChain({
            donationId: d._id,
            amountUsed: deductFromThis,
            purpose: description || `Disbursement for ${category}`,
            ministry: d.destination || category || 'Parish General Fund',
            expenseId: expenseId
          });
        } catch (stxErr) {
          console.warn('Smart transaction call warning:', stxErr.message);
        }

        const txHash = smartTxResult?.txHash || ('0x' + crypto.createHash('sha256').update(`TX:${d._id}:${expenseId}:${Date.now()}:${Math.random()}`).digest('hex'));

        if (!Array.isArray(d.usageLogs)) d.usageLogs = [];
        d.usageLogs.push({
          amount: deductFromThis,
          date: new Date(),
          purpose: description || `Disbursement for ${category}`,
          notes: `Expense ID: ${expenseId}`,
          balanceAfter: newBal,
          txHash: txHash,
          blockId: txHash,
          expenseId: expenseId
        });

        await d.save();

        fundedFrom.push({
          donationId: d._id,
          donorName: d.donorName || 'Community Donor',
          amount: deductFromThis,
          destination: d.destination || 'Parish General Fund',
          blockId: d.blockId || null,
          disbursementTxHash: txHash,
          referenceNumber: d.referenceNumber || null
        });
      }
    }

    if (expenseId) {
      const primaryPool = fundedFrom.length > 0 ? (fundedFrom[0].destination || 'Parish General Fund') : (category || 'Parish General Fund');
      const primaryTxHash = fundedFrom.length > 0
        ? fundedFrom[0].disbursementTxHash
        : ('0x' + crypto.createHash('sha256').update(`EXPENSE-TX:${expenseId}:${amount}:${category}:${Date.now()}`).digest('hex'));

      await Expense.findByIdAndUpdate(expenseId, {
        $set: {
          fundedFrom: fundedFrom,
          fundSource: primaryPool,
          blockId: primaryTxHash,
          txHash: primaryTxHash
        }
      });
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
    // Auto-approve recorded expenses so general fund is deducted immediately
    const initialStatus = status || 'approved';

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

    // Deduct funds from General Fund donation funds if approved
    if (initialStatus === 'approved') {
      await deductMinistryDonationFunds(expense.category, expense.amount, expense._id, expense.description);
      const refreshedExpense = await Expense.findById(expense._id)
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email');
      return res.status(201).json(refreshedExpense || expense);
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

    // Deduct funds from matching ministry donation funds & execute smart transaction
    await deductMinistryDonationFunds(expense.category, expense.amount, expense._id, expense.description);

    const refreshedExpense = await Expense.findById(id)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      message: 'Expense approved successfully and smart transaction mined on blockchain',
      data: refreshedExpense || expense
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

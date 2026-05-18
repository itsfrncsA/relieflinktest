const Expense = require('../models/Expense');

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 });
    
    res.json(expenses);
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category, notes } = req.body;
            
    if (!description || !amount || !category) {
      return res.status(400).json({ message: 'Please provide description, amount, and category' });
    }

    const expense = new Expense({
      description,
      amount: parseFloat(amount),
      category,
      notes,
      createdBy: req.user.id
    });

    await expense.save();
    await expense.populate('createdBy', 'name email');
    
    res.status(201).json(expense);
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ message: 'Server error' });
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

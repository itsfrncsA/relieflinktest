const express = require('express');
const router = express.Router();
const CashAdvance = require('../models/CashAdvance');

// Get all cash advances
router.get('/', async (req, res) => {
  try {
    const cashAdvances = await CashAdvance.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: cashAdvances
    });
  } catch (err) {
    console.error('Error fetching cash advances:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cash advance records'
    });
  }
});

// Create a new cash advance audit record
router.post('/', async (req, res) => {
  try {
    const {
      applicantName,
      date,
      position,
      ministry,
      activityPurpose,
      dateNeeded,
      requestedAmount,
      outstandingAmount,
      outstandingDetails,
      requestedBy,
      recommendingApproval,
      approvedBy,
      status,
      createdBy
    } = req.body;

    if (!applicantName || !activityPurpose || requestedAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Applicant name, activity purpose, and requested amount are required'
      });
    }

    const newCashAdvance = new CashAdvance({
      applicantName,
      date: date || new Date(),
      position,
      ministry,
      activityPurpose,
      dateNeeded,
      requestedAmount: Number(requestedAmount) || 0,
      outstandingAmount: Number(outstandingAmount) || 0,
      outstandingDetails: Array.isArray(outstandingDetails) ? outstandingDetails : [],
      requestedBy: requestedBy || applicantName,
      recommendingApproval,
      approvedBy,
      status: status || 'Submitted',
      createdBy: createdBy || 'Admin'
    });

    const saved = await newCashAdvance.save();

    res.status(201).json({
      success: true,
      message: 'Cash advance audit record saved successfully',
      data: saved
    });
  } catch (err) {
    console.error('Error saving cash advance:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to save cash advance record: ' + err.message
    });
  }
});

// Delete a cash advance
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CashAdvance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Cash advance record removed' });
  } catch (err) {
    console.error('Error deleting cash advance:', err);
    res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
});

module.exports = router;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../api';

const DonationDetailsModal = ({
  selectedDonation,
  setSelectedDonation,
  deleteDonation,
  getReceiptUrl,
  currentUser,
  fetchDonations,
  setMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [statusVal, setStatusVal] = useState('');
  const [remBalVal, setRemBalVal] = useState('');
  const [disbursedAmtVal, setDisbursedAmtVal] = useState('');
  const [eventPurposeVal, setEventPurposeVal] = useState('');
  const [eventNotesVal, setEventNotesVal] = useState('');
  const [eventDateVal, setEventDateVal] = useState('');
  const [saving, setSaving] = useState(false);

  // Helper to normalize status
  const normalizeStatus = (d) => {
    if (!d) return 'cash on hand';
    const s = (d.status || d.verificationStatus || '').toLowerCase();
    if (s === 'fully used' || s === 'partially used' || s === 'cash on hand') return s;
    return 'cash on hand';
  };

  useEffect(() => {
    if (selectedDonation) {
      setIsEditing(false);
      const currentSt = normalizeStatus(selectedDonation);
      setStatusVal(currentSt);
      
      const totalAmt = selectedDonation.amount || 0;
      const initialBal = selectedDonation.remainingBalance !== undefined && selectedDonation.remainingBalance !== null && selectedDonation.remainingBalance >= 0
        ? Number(selectedDonation.remainingBalance)
        : (currentSt === 'partially used' ? totalAmt * 0.5 : (currentSt === 'fully used' ? 0 : totalAmt));
      
      setRemBalVal(initialBal);
      setDisbursedAmtVal(currentSt === 'partially used' ? (totalAmt - initialBal) : (currentSt === 'fully used' ? totalAmt : 0));
      setEventPurposeVal(selectedDonation.destination || 'Typhoon Relief - Emergency Food Packs');
      setEventNotesVal('');
      setEventDateVal(new Date().toISOString().slice(0, 16));
    }
  }, [selectedDonation]);

  if (!selectedDonation) return null;

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  const canEdit = isSuperAdmin;

  const currentStatus = normalizeStatus(selectedDonation);

  const availableStatusChoices = [
    { value: 'cash on hand', label: 'CASH ON HAND (Ready in Treasury)' },
    { value: 'partially used', label: 'PARTIALLY USED (Partially Disbursed)' },
    { value: 'fully used', label: 'FULLY USED (100% Disbursed)' }
  ];

  // Quick preset event suggestions
  const eventPresets = [
    'Typhoon Relief - Emergency Food Packs',
    'Medical Mission & Free Medicines',
    'Flood Disaster Aid & Evacuation Supplies',
    'Youth Ministry Educational Scholarship',
    'Community Kitchen & Hot Meals Outreach',
    'Parish Calamity Assistance Fund'
  ];

  const handleStatusChange = (newStatus) => {
    setStatusVal(newStatus);
    const totalAmt = selectedDonation.amount || 0;
    if (newStatus === 'cash on hand') {
      setRemBalVal(0); // display zero for cash on hand per specs
      setDisbursedAmtVal(0);
    } else if (newStatus === 'fully used') {
      setRemBalVal(0);
      setDisbursedAmtVal(totalAmt);
    } else if (newStatus === 'partially used') {
      const half = totalAmt * 0.5;
      setDisbursedAmtVal(half);
      setRemBalVal(half);
    }
  };

  const handleDisbursedAmountChange = (val) => {
    setDisbursedAmtVal(val);
    const num = parseFloat(val) || 0;
    const totalAmt = selectedDonation.amount || 0;
    const calculatedBal = Math.max(0, totalAmt - num);
    setRemBalVal(calculatedBal);
    if (calculatedBal === 0 && num >= totalAmt) {
      setStatusVal('fully used');
    } else if (num > 0) {
      setStatusVal('partially used');
    }
  };

  const handleSaveStatus = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Authentication session expired. Please log in again.');
      return;
    }

    try {
      setSaving(true);
      const totalAmt = Number(selectedDonation.amount || 0);
      let remainingBalanceNum = 0;
      let disbursedNum = parseFloat(disbursedAmtVal) || 0;

      if (statusVal === 'partially used') {
        remainingBalanceNum = Math.max(0, parseFloat(remBalVal) || (totalAmt - disbursedNum));
        if (disbursedNum <= 0) {
          disbursedNum = totalAmt - remainingBalanceNum;
        }
      } else if (statusVal === 'fully used') {
        remainingBalanceNum = 0;
        if (disbursedNum <= 0) disbursedNum = totalAmt;
      } else {
        // cash on hand
        remainingBalanceNum = 0;
        disbursedNum = 0;
      }

      let updatedLogs = selectedDonation.usageLogs ? [...selectedDonation.usageLogs] : [];

      if ((statusVal === 'partially used' || statusVal === 'fully used') && disbursedNum > 0) {
        const newLog = {
          date: eventDateVal ? new Date(eventDateVal) : new Date(),
          amount: disbursedNum,
          purpose: (eventPurposeVal || selectedDonation.destination || 'Parish Aid Disbursement').trim(),
          notes: (eventNotesVal || `Funds allocated for ${eventPurposeVal || 'parish relief'}`).trim(),
          balanceAfter: remainingBalanceNum
        };
        updatedLogs.push(newLog);
      }

      const res = await axios.put(
        `${API_URL}/donations/${selectedDonation._id}`,
        { 
          status: statusVal,
          verificationStatus: statusVal,
          remainingBalance: remainingBalanceNum,
          usageLogs: updatedLogs
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.donation || {
        ...selectedDonation,
        status: statusVal,
        verificationStatus: statusVal,
        remainingBalance: remainingBalanceNum,
        usageLogs: updatedLogs
      };
      setSelectedDonation(updated);
      setIsEditing(false);

      if (fetchDonations) await fetchDonations();
      if (setMessage) {
        setMessage(`Donation updated: ${statusVal.toUpperCase()} (${disbursedNum > 0 ? `₱${disbursedNum.toFixed(2)} allocated to ${eventPurposeVal}` : 'Status updated'})`);
        setTimeout(() => setMessage(''), 3500);
      }
    } catch (err) {
      console.error('Error updating donation status:', err);
      alert('Failed to update donation status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-modal-overlay" onClick={() => setSelectedDonation(null)}>
      <div className="dashboard-modal" style={{ maxWidth: '720px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-modal-header" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="dashboard-modal-title">Donation Details &amp; Receipt</h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>Verified contribution record &amp; audit data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDonation(null)}
            className="dashboard-close-btn"
            aria-label="Close"
          >
            <svg style={{ width: '16px', height: '16px', display: 'block' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="dashboard-modal-content" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
            {/* Column 1 */}
            <div>
              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Donor Name:</strong><br />
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{selectedDonation.donorName || 'Anonymous Donor'}</span>
              </p>

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Donation Amount:</strong><br />
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>₱{selectedDonation.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </p>

              {selectedDonation.feeAmount > 0 && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Gateway Processing Fee:</strong><br />
                  <span>₱{selectedDonation.feeAmount?.toFixed(2)} (Paid by Donor)</span>
                  {selectedDonation.grossAmount && (
                    <span style={{ display: 'block', fontSize: '12px', color: '#475569' }}>Total Charged: ₱{selectedDonation.grossAmount?.toFixed(2)}</span>
                  )}
                </p>
              )}

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Payment Method:</strong><br />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{selectedDonation.paymentMethod || 'Cash'}</span>
              </p>

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Restricted Ministry Destination:</strong><br />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>{selectedDonation.destination || 'Parish General Fund'}</span>
              </p>
            </div>

            {/* Column 2 */}
            <div>
              {/* Status with Super Admin edit icon */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Status:</strong>
                  {canEdit && !isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                      title="Edit status (Super Admin)"
                    >
                      <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Donation Status:
                      </label>
                      <select
                        value={statusVal}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="dashboard-select"
                        style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', width: '100%', fontWeight: '700', backgroundColor: '#ffffff', border: '1px solid #94a3b8' }}
                      >
                        {availableStatusChoices.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {(statusVal === 'partially used' || statusVal === 'fully used') && (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Relief Event / Purpose (What was it used for?):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Typhoon Kristine Emergency Food Packs"
                            value={eventPurposeVal}
                            onChange={(e) => setEventPurposeVal(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: '13px',
                              fontWeight: '600',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              boxSizing: 'border-box',
                              marginBottom: '6px',
                              backgroundColor: '#ffffff'
                            }}
                          />
                          {/* Quick Preset Buttons */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {eventPresets.map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setEventPurposeVal(preset)}
                                style={{
                                  fontSize: '10.5px',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: eventPurposeVal === preset ? '#dbeafe' : '#ffffff',
                                  color: eventPurposeVal === preset ? '#1e40af' : '#475569',
                                  cursor: 'pointer',
                                  fontWeight: '600'
                                }}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Disbursed Amount (₱):
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={disbursedAmtVal}
                              onChange={(e) => handleDisbursedAmountChange(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                fontSize: '13px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                color: '#dc2626',
                                boxSizing: 'border-box',
                                backgroundColor: '#ffffff'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Remaining Balance (₱):
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={remBalVal}
                              onChange={(e) => setRemBalVal(e.target.value)}
                              disabled={statusVal === 'fully used'}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                fontSize: '13px',
                                fontWeight: '800',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                color: statusVal === 'partially used' ? '#2563eb' : '#64748b',
                                boxSizing: 'border-box',
                                backgroundColor: statusVal === 'fully used' ? '#f1f5f9' : '#ffffff'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Transaction Date &amp; Time:
                            </label>
                            <input
                              type="datetime-local"
                              value={eventDateVal}
                              onChange={(e) => setEventDateVal(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                fontSize: '12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                boxSizing: 'border-box',
                                backgroundColor: '#ffffff'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Disbursement Activity Notes:
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Purchased 20 food packs"
                              value={eventNotesVal}
                              onChange={(e) => setEventNotesVal(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                fontSize: '12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                boxSizing: 'border-box',
                                backgroundColor: '#ffffff'
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '2px',
                      textTransform: 'uppercase',
                      fontWeight: '800',
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: currentStatus === 'partially used' ? '#eff6ff' : (currentStatus === 'fully used' ? '#f1f5f9' : '#ecfdf5'),
                      color: currentStatus === 'partially used' ? '#2563eb' : (currentStatus === 'fully used' ? '#64748b' : '#16a34a'),
                      border: `1px solid ${currentStatus === 'partially used' ? '#bfdbfe' : (currentStatus === 'fully used' ? '#cbd5e1' : '#a7f3d0')}`
                    }}>
                      {currentStatus}
                    </span>
                  </div>
                )}
              </div>

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Remaining Balance:</strong><br />
                <span style={{ fontSize: '15px', fontWeight: '800', color: currentStatus === 'partially used' ? '#2563eb' : '#0f172a' }}>
                  ₱{Number(currentStatus === 'partially used' ? (selectedDonation.remainingBalance !== undefined && selectedDonation.remainingBalance !== null && selectedDonation.remainingBalance > 0 ? selectedDonation.remainingBalance : (selectedDonation.amount * 0.5)) : 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </p>

              {selectedDonation.referenceNumber && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Reference / Checkout ID:</strong><br />
                  <code style={{ fontSize: '13px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#334155' }}>{selectedDonation.referenceNumber}</code>
                </p>
              )}

              {selectedDonation.paymentId && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>PayMongo Payment ID:</strong><br />
                  <code style={{ fontSize: '13px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#334155' }}>{selectedDonation.paymentId}</code>
                </p>
              )}

              {selectedDonation.blockId && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Blockchain ID:</strong><br />
                  <span className="blockchain-badge" title="Cryptographically secured on blockchain" style={{ marginLeft: 0, marginTop: '4px' }}>
                    {selectedDonation.blockId}
                  </span>
                </p>
              )}

              <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Date &amp; Time:</strong><br />
                <span style={{ fontSize: '13px', color: '#475569' }}>{new Date(selectedDonation.paidAt || selectedDonation.createdAt).toLocaleString()}</span>
              </p>

              {selectedDonation.notes && (
                <p className="dashboard-modal-text" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Notes / Mass Intention:</strong><br />
                  <span style={{ fontSize: '13px', color: '#334155' }}>{selectedDonation.notes}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fund Utilization & Event Allocation Breakdown (Visible for Partially Used & Fully Used or when usage logs exist) */}
          {(currentStatus === 'partially used' || currentStatus === 'fully used' || (selectedDonation.usageLogs && selectedDonation.usageLogs.length > 0)) ? (
            <div style={{
              background: currentStatus === 'partially used' ? '#eff6ff' : '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              border: `1px solid ${currentStatus === 'partially used' ? '#bfdbfe' : '#cbd5e1'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: currentStatus === 'partially used' ? '#1e40af' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fund Utilization &amp; Relief Event Allocation
                </h4>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  color: currentStatus === 'partially used' ? '#1d4ed8' : '#475569',
                  backgroundColor: currentStatus === 'partially used' ? '#dbeafe' : '#e2e8f0',
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}>
                  {currentStatus === 'partially used'
                    ? `Remaining Balance: ₱${Number(selectedDonation.remainingBalance !== undefined && selectedDonation.remainingBalance !== null && selectedDonation.remainingBalance > 0 ? selectedDonation.remainingBalance : (selectedDonation.amount * 0.5)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : 'Fully Disbursed (₱0.00 Remaining)'
                  }
                </span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#475569' }}>
                Audit trail of relief events and operational purposes where this donor&apos;s money was disbursed:
              </p>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #dbeafe', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700' }}>Date &amp; Time</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700' }}>Relief Event / Purpose</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>Disbursed Amount</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>Remaining Balance</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700' }}>Activity Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedDonation.usageLogs && selectedDonation.usageLogs.length > 0) ? (
                      selectedDonation.usageLogs.map((log, lIdx) => (
                        <tr key={lIdx} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: '600' }}>
                            {new Date(log.date || Date.now()).toLocaleString()}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#1e40af', fontWeight: '700' }}>
                            {log.purpose || selectedDonation.destination || 'Parish Aid Disbursement'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#dc2626', fontWeight: '700' }}>
                            -₱{Number(log.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#16a34a', fontWeight: '800' }}>
                            ₱{Number(log.balanceAfter !== undefined ? log.balanceAfter : (currentStatus === 'fully used' ? 0 : selectedDonation.amount * 0.5)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '11.5px' }}>
                            {log.notes || 'Disbursement recorded'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: '600' }}>
                          {new Date(selectedDonation.updatedAt || selectedDonation.paidAt || selectedDonation.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#1e40af', fontWeight: '700' }}>
                          {selectedDonation.destination || 'Parish Disaster Relief Operations'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: '700' }}>
                          -₱{Number(currentStatus === 'fully used' ? selectedDonation.amount : selectedDonation.amount * 0.5).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#16a34a', fontWeight: '800' }}>
                          ₱{Number(currentStatus === 'fully used' ? 0 : selectedDonation.amount * 0.5).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '11.5px' }}>
                          {currentStatus === 'fully used' ? '100% disbursed for parish relief' : 'Partially disbursed for relief assistance'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ background: '#ecfdf5', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#16a34a', flexShrink: 0 }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: '600' }}>
                100% Cash on Hand. This contribution is safely held in the parish treasury, awaiting upcoming relief missions and events.
              </span>
            </div>
          )}

          {/* Verification Status Details */}
          {(selectedDonation.verificationStatus === 'approved' || selectedDonation.verificationStatus === 'rejected') && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '20px', borderLeft: `4px solid ${selectedDonation.verificationStatus === 'approved' ? '#16a34a' : '#dc2626'}` }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Log</h4>
              {selectedDonation.verifiedBy && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Verified By:</strong> {selectedDonation.verifiedBy}</p>
              )}
              {selectedDonation.verificationDate && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Verified At:</strong> {new Date(selectedDonation.verificationDate).toLocaleString()}</p>
              )}
              {selectedDonation.verificationNotes && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Admin Notes:</strong> {selectedDonation.verificationNotes}</p>
              )}
              {selectedDonation.rejectionReason && (
                <p className="dashboard-modal-text" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Cancellation Reason:</strong> {selectedDonation.rejectionReason}</p>
              )}
            </div>
          )}

          {/* Receipt Preview */}
          {(selectedDonation.receiptPath || selectedDonation.receiptUrl || selectedDonation.proofImage) ? (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proof of Donation Receipt</h4>
              <div style={{ width: '100%', maxHeight: '320px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={getReceiptUrl(selectedDonation.receiptPath || selectedDonation.receiptUrl || selectedDonation.proofImage)}
                  alt="Receipt Proof"
                  style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', cursor: 'pointer' }}
                  onClick={() => window.open(getReceiptUrl(selectedDonation.receiptPath || selectedDonation.receiptUrl || selectedDonation.proofImage), '_blank')}
                  title="Click to view full receipt"
                />
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              No receipt image uploaded for this entry.
            </p>
          )}

          {/* Centered Modal Footer */}
          <div className="dashboard-modal-footer" style={{ justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="dashboard-submit-btn"
                  style={{ background: '#16a34a' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="dashboard-cancel-btn"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="dashboard-submit-btn"
                style={{ background: '#2563eb', padding: '10px 24px' }}
                onClick={() => {
                  const win = window.open('', '_blank');
                  win.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Official Donation Receipt - Sto. Domingo Parish</title>
                        <style>
                          body { font-family: 'Times New Roman', serif; padding: 30px; color: #1c1917; line-height: 1.5; }
                          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
                          .title { font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; }
                          .subtitle { font-size: 13px; color: #57534e; margin: 2px 0 0 0; }
                          .receipt-box { border: 1px solid #d6d3d1; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
                          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; border-bottom: 1px dashed #e7e5e4; padding-bottom: 4px; }
                          .amount { font-size: 18px; font-weight: bold; color: #047857; }
                          .footer { font-size: 11px; text-align: center; margin-top: 30px; color: #78716c; border-top: 1px solid #e7e5e4; padding-top: 10px; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div style="font-size: 20px; font-weight: bold; color: #1e3a8a;">Sto. Domingo Parish • Social Action Ministry</div>
                          <div class="subtitle">Parish Treasury, Aid Distribution &amp; Relief Operations</div>
                          <div class="title" style="margin-top: 10px; font-size: 15px;">Official Electronic Donation Acknowledgement Receipt</div>
                        </div>
                        <div class="receipt-box">
                          <div class="row"><strong>Official AR Number:</strong> <span>AR-${selectedDonation._id ? selectedDonation._id.slice(-8).toUpperCase() : 'DIRECT'}</span></div>
                          <div class="row"><strong>Reference / Tracking Code:</strong> <span>${selectedDonation.referenceNumber || 'N/A'}</span></div>
                          <div class="row"><strong>Blockchain Audit Block ID:</strong> <span>${selectedDonation.blockId || 'Verified On-Chain Ledger'}</span></div>
                          <div class="row"><strong>Date &amp; Time:</strong> <span>${new Date(selectedDonation.createdAt).toLocaleString()}</span></div>
                          <div class="row"><strong>Donor / Contributor Name:</strong> <span>${selectedDonation.donorName || 'Anonymous Donor'}</span></div>
                          <div class="row"><strong>Payment Method:</strong> <span>${selectedDonation.paymentMethod || 'Cash'}</span></div>
                          <div class="row"><strong>Restricted Destination / Ministry:</strong> <span>${selectedDonation.destination || 'General Parish Fund'}</span></div>
                          <div class="row" style="border-bottom:none; margin-top:10px;">
                            <strong>Amount Received:</strong>
                            <span class="amount">₱${selectedDonation.amount?.toFixed(2)}</span>
                          </div>
                          <div class="row"><strong>Donation Status:</strong> <span style="text-transform:uppercase; font-weight:bold;">${currentStatus}</span></div>
                          <div class="row"><strong>Current Remaining Balance:</strong> <span style="font-weight:bold; color:#1d4ed8;">₱${Number(currentStatus === 'partially used' ? (selectedDonation.remainingBalance !== undefined && selectedDonation.remainingBalance !== null && selectedDonation.remainingBalance > 0 ? selectedDonation.remainingBalance : (selectedDonation.amount * 0.5)) : 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                          ${(selectedDonation.usageLogs && selectedDonation.usageLogs.length > 0) ? `
                            <div style="margin-top: 14px; border-top: 1px dashed #78716c; padding-top: 10px;">
                              <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">Relief Event Utilization &amp; Impact History:</div>
                              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                                <thead>
                                  <tr style="background: #f5f5f4; border-bottom: 1px solid #d6d3d1;">
                                    <th style="padding: 4px; text-align: left;">Date</th>
                                    <th style="padding: 4px; text-align: left;">Event / Purpose</th>
                                    <th style="padding: 4px; text-align: right;">Disbursed</th>
                                    <th style="padding: 4px; text-align: right;">Remaining</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${selectedDonation.usageLogs.map(l => `
                                    <tr style="border-bottom: 1px dotted #e7e5e4;">
                                      <td style="padding: 4px;">${new Date(l.date || Date.now()).toLocaleDateString()}</td>
                                      <td style="padding: 4px;"><strong>${l.purpose || 'Parish Aid'}</strong><br/><small style="color:#57534e;">${l.notes || ''}</small></td>
                                      <td style="padding: 4px; text-align: right; color: #b91c1c;">-₱${Number(l.amount || 0).toFixed(2)}</td>
                                      <td style="padding: 4px; text-align: right; color: #047857;">₱${Number(l.balanceAfter || 0).toFixed(2)}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                            </div>
                          ` : ''}
                        </div>
                        <div class="footer">
                          Thank you for your generous support to Sto. Domingo Church Ministries.<br />
                          This serves as an official electronic record of your donation.
                        </div>
                      </body>
                    </html>
                  `);
                  win.document.close();
                  win.print();
                }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Official AR Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetailsModal;

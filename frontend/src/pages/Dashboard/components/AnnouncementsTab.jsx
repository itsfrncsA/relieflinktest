import React, { useState } from 'react';

const AnnouncementsTab = ({
  announcements,
  ancTitle, setAncTitle,
  ancContent, setAncContent,
  ancCategory, setAncCategory,
  ancEventDate, setAncEventDate,
  ancLocation, setAncLocation,
  ancWho, setAncWho,
  ancIsPinned, setAncIsPinned,
  ancSubmitting,
  editingAncId,
  handleEditAnnouncement,
  handleCancelEditAnnouncement,
  handleCreateAnnouncement,
  handleDeleteAnnouncement
}) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Field-level validators
  const validateField = (name, value, currentCategory = ancCategory) => {
    let err = '';
    const str = (value || '').trim();

    if (name === 'ancTitle') {
      if (!str) {
        err = 'Announcement title is required.';
      } else if (str.length < 5) {
        err = 'Title must be at least 5 characters long.';
      } else if (str.length > 120) {
        err = 'Title cannot exceed 120 characters.';
      } else if (!/[a-zA-Z\u00C0-\u024F]/.test(str)) {
        err = 'Title must contain letters or descriptive words.';
      }
    } else if (name === 'ancCategory') {
      if (!value) {
        err = 'Please select a valid announcement category.';
      }
    } else if (name === 'ancContent') {
      if (!str) {
        err = 'Details and instructions are required.';
      } else if (str.length < 10) {
        err = 'Please provide at least 10 characters of instructions or details.';
      } else if (str.length > 2000) {
        err = 'Details cannot exceed 2,000 characters.';
      }
    } else if (name === 'ancLocation') {
      if (str && str.length > 150) {
        err = 'Venue/Location cannot exceed 150 characters.';
      }
    } else if (name === 'ancEventDate') {
      if (str) {
        const d = new Date(str);
        if (isNaN(d.getTime())) {
          err = 'Please enter a valid event date and time.';
        }
      }
    }
    return err;
  };

  // Run full form validation
  const validateAll = () => {
    const newErrors = {};
    const titleErr = validateField('ancTitle', ancTitle);
    if (titleErr) newErrors.ancTitle = titleErr;

    const catErr = validateField('ancCategory', ancCategory);
    if (catErr) newErrors.ancCategory = catErr;

    const contentErr = validateField('ancContent', ancContent);
    if (contentErr) newErrors.ancContent = contentErr;

    const locErr = validateField('ancLocation', ancLocation);
    if (locErr) newErrors.ancLocation = locErr;

    const dateErr = validateField('ancEventDate', ancEventDate);
    if (dateErr) newErrors.ancEventDate = dateErr;

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, 
      field === 'ancTitle' ? ancTitle :
      field === 'ancCategory' ? ancCategory :
      field === 'ancContent' ? ancContent :
      field === 'ancLocation' ? ancLocation : ancEventDate
    );
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (touched[field] || formSubmitted) {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTouched({
      ancTitle: true,
      ancCategory: true,
      ancContent: true,
      ancLocation: true,
      ancEventDate: true
    });

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Find first error and scroll to it or let user see error banner
      return;
    }

    // Validation passed, proceed with creation/update
    handleCreateAnnouncement(e);
    setFormSubmitted(false);
    setTouched({});
    setErrors({});
  };

  const onCancelEdit = () => {
    setErrors({});
    setTouched({});
    setFormSubmitted(false);
    handleCancelEditAnnouncement();
  };

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  const filteredAnnouncements = announcements.filter(anc => {
    if (selectedMonth === 'all') return true;
    const dateStr = anc.createdAt;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    return date.getMonth().toString() === selectedMonth;
  });

  return (
    <div className="dashboard-main-content">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="dashboard-section-title" style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Announcement</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Broadcast relief distributions, schedule parish activities, and publish urgent announcements (Title, Location, Date & Time)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.3fr)', gap: '28px', alignItems: 'flex-start' }}>
        {/* Create / Edit Announcement Form */}
        <div className="dashboard-form-card" style={{ border: editingAncId ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', background: '#ffffff', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 className="form-title" style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {editingAncId ? 'Edit Announcement' : 'Publish New Announcement'}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Publish and schedule parish announcements
              </span>
            </div>
            {editingAncId && (
              <button
                type="button"
                onClick={onCancelEdit}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form className="dashboard-form" onSubmit={onFormSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top Form Alert Banner if validation errors exist */}
            {formSubmitted && Object.keys(errors).length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Please complete the required fields highlighted below before submitting.</span>
              </div>
            )}

            {/* Announcement Title */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: (touched.ancTitle || formSubmitted) && errors.ancTitle ? '#dc2626' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Announcement Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: (ancTitle || '').length > 120 ? '#dc2626' : '#94a3b8', fontWeight: '500' }}>
                  {(ancTitle || '').length}/120
                </span>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Emergency Relief Goods Distribution"
                value={ancTitle}
                maxLength={120}
                onChange={(e) => handleFieldChange('ancTitle', e.target.value, setAncTitle)}
                onBlur={() => handleBlur('ancTitle')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: (touched.ancTitle || formSubmitted) && errors.ancTitle ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  backgroundColor: (touched.ancTitle || formSubmitted) && errors.ancTitle ? '#fef2f2' : '#ffffff',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
              {(touched.ancTitle || formSubmitted) && errors.ancTitle && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#dc2626', fontWeight: '600' }}>
                  <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.ancTitle}</span>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: (touched.ancCategory || formSubmitted) && errors.ancCategory ? '#dc2626' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Category <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="form-input"
                value={ancCategory}
                onChange={(e) => handleFieldChange('ancCategory', e.target.value, setAncCategory)}
                onBlur={() => handleBlur('ancCategory')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: (touched.ancCategory || formSubmitted) && errors.ancCategory ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  backgroundColor: (touched.ancCategory || formSubmitted) && errors.ancCategory ? '#fef2f2' : '#ffffff',
                  fontSize: '13px',
                  color: ancCategory ? '#0f172a' : '#64748b',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <option value="">Select an Announcement Category</option>
                <option value="General">General Announcement</option>
                <option value="Relief Operation">Relief Operation</option>
                <option value="Ministry Schedule">Ministry Schedule</option>
                <option value="Scholarship Notice">Scholarship Notice</option>
                <option value="Urgent Advisory">Urgent Advisory</option>
                <option value="Parish Update">Parish Update</option>
                <option value="Event">Event</option>
              </select>
              {(touched.ancCategory || formSubmitted) && errors.ancCategory && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#dc2626', fontWeight: '600' }}>
                  <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.ancCategory}</span>
                </div>
              )}
            </div>

            {/* Details / Instructions */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: (touched.ancContent || formSubmitted) && errors.ancContent ? '#dc2626' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Details &amp; Instructions <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: (ancContent || '').length > 2000 ? '#dc2626' : '#94a3b8', fontWeight: '500' }}>
                  {(ancContent || '').length}/2000
                </span>
              </div>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Describe details, guidelines, or instructions for parishioners..."
                value={ancContent}
                maxLength={2000}
                onChange={(e) => handleFieldChange('ancContent', e.target.value, setAncContent)}
                onBlur={() => handleBlur('ancContent')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: (touched.ancContent || formSubmitted) && errors.ancContent ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  backgroundColor: (touched.ancContent || formSubmitted) && errors.ancContent ? '#fef2f2' : '#ffffff',
                  fontSize: '13px',
                  resize: 'vertical',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              ></textarea>
              {(touched.ancContent || formSubmitted) && errors.ancContent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#dc2626', fontWeight: '600' }}>
                  <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.ancContent}</span>
                </div>
              )}
            </div>

            {/* Venue & Event Date/Time */}
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: (touched.ancLocation || formSubmitted) && errors.ancLocation ? '#dc2626' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Venue / Location
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Parish Covered Court"
                  value={ancLocation}
                  maxLength={150}
                  onChange={(e) => handleFieldChange('ancLocation', e.target.value, setAncLocation)}
                  onBlur={() => handleBlur('ancLocation')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: (touched.ancLocation || formSubmitted) && errors.ancLocation ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: (touched.ancLocation || formSubmitted) && errors.ancLocation ? '#fef2f2' : '#ffffff',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
                {(touched.ancLocation || formSubmitted) && errors.ancLocation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#dc2626', fontWeight: '600' }}>
                    <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors.ancLocation}</span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: (touched.ancEventDate || formSubmitted) && errors.ancEventDate ? '#dc2626' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={ancEventDate}
                  onChange={(e) => handleFieldChange('ancEventDate', e.target.value, setAncEventDate)}
                  onBlur={() => handleBlur('ancEventDate')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: (touched.ancEventDate || formSubmitted) && errors.ancEventDate ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: (touched.ancEventDate || formSubmitted) && errors.ancEventDate ? '#fef2f2' : '#ffffff',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
                {(touched.ancEventDate || formSubmitted) && errors.ancEventDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#dc2626', fontWeight: '600' }}>
                    <svg style={{ width: '13px', height: '13px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errors.ancEventDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pin to Top Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 6px 0' }}>
              <input
                type="checkbox"
                id="pinAnnouncement"
                checked={ancIsPinned}
                onChange={(e) => setAncIsPinned(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <label htmlFor="pinAnnouncement" style={{ fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                Pin this announcement to top of feed
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={ancSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: ancSubmitting ? 'not-allowed' : 'pointer',
                  background: editingAncId ? '#16a34a' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  opacity: ancSubmitting ? 0.7 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                {ancSubmitting
                  ? (editingAncId ? 'Saving Changes...' : 'Publishing...')
                  : (editingAncId ? 'Save Changes' : 'Publish Announcement')}
              </button>

              {editingAncId && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Announcements Feed */}
        <div className="dashboard-chart-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="dashboard-chart-title" style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Active Announcements</h3>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                Showing {filteredAnnouncements.length} of {announcements.length} updates
              </span>
            </div>

            {/* Date Posted Month Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="monthFilter" style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Filter by Date Posted:</label>
              <select
                id="monthFilter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '640px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredAnnouncements.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No announcements found {selectedMonth !== 'all' ? `for the selected month` : ''}.
              </div>
            ) : (
              filteredAnnouncements.map((anc) => (
                <div
                  key={anc._id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: editingAncId === anc._id ? '2px solid #2563eb' : (anc.isPinned ? '2px solid #3b82f6' : '1px solid #e2e8f0'),
                    background: editingAncId === anc._id ? '#eff6ff' : (anc.isPinned ? '#f0f7ff' : '#ffffff'),
                    boxShadow: '0 2px 6px rgba(15,23,42,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1e40af', textTransform: 'uppercase' }}>
                        {anc.category || 'General'}
                      </span>
                      {anc.isPinned && (
                        <span
                          title="Pinned Announcement"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe'
                          }}
                        >
                          <svg style={{ width: '14px', height: '14px' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                          </svg>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleEditAnnouncement(anc)}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          width: '30px',
                          height: '30px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Edit Announcement"
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(anc._id)}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          width: '30px',
                          height: '30px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Delete Announcement"
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{anc.title}</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{anc.content}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    {anc.location && <span style={{ fontWeight: '700', color: '#0f172a' }}>Location: {anc.location}</span>}
                    {anc.eventDate && <span style={{ fontWeight: '700', color: '#0f172a' }}>Date & Time: {(() => {
                      const d = new Date(anc.eventDate);
                      if (!isNaN(d.getTime()) && anc.eventDate.includes('T')) {
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                          ' • ' +
                          d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                      }
                      return anc.eventDate;
                    })()}</span>}
                    {anc.creatorName && <span><strong>By:</strong> {anc.creatorName}</span>}
                    <span style={{ fontWeight: '400', color: '#64748b' }}>
                      Posted: {anc.createdAt ? (
                        new Date(anc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                        ' at ' +
                        new Date(anc.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                      ) : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsTab;

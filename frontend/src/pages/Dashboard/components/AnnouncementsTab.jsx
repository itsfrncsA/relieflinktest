import React, { useState } from 'react';

const AnnouncementsTab = ({
  announcements,
  ancTitle, setAncTitle,
  ancContent, setAncContent,
  ancCategory, setAncCategory,
  ancEventDate, setAncEventDate,
  ancLocation, setAncLocation,
  ancIsPinned, setAncIsPinned,
  ancSubmitting,
  editingAncId,
  handleEditAnnouncement,
  handleCancelEditAnnouncement,
  handleCreateAnnouncement,
  handleDeleteAnnouncement
}) => {
  const [selectedMonth, setSelectedMonth] = useState('all');

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
          Broadcast relief distributions, schedule parish activities, and publish urgent announcements
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.3fr)', gap: '28px', alignItems: 'flex-start' }}>
        {/* Create / Edit Announcement Form */}
        <div className="dashboard-form-card" style={{ border: editingAncId ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', background: '#ffffff', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="form-title" style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              {editingAncId ? 'Edit Announcement' : 'Publish New Announcement'}
            </h3>
            {editingAncId && (
              <button
                type="button"
                onClick={handleCancelEditAnnouncement}
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

          <form className="dashboard-form" onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Announcement Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Upcoming Relief Goods Distribution"
                value={ancTitle}
                onChange={(e) => setAncTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Category</label>
              <select
                className="form-input"
                value={ancCategory}
                onChange={(e) => setAncCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
              >
                <option value="">Select Category</option>
                <option value="General">General Announcement</option>
                <option value="Relief Operation">Relief Operation</option>
                <option value="Ministry Schedule">Ministry Schedule</option>
                <option value="Scholarship Notice">Scholarship Notice</option>
                <option value="Urgent Advisory">Urgent Advisory</option>
                <option value="Parish Update">Parish Update</option>
                <option value="Event">Event</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Message Details *</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Enter complete announcement details, guidelines, or beneficiary criteria..."
                value={ancContent}
                onChange={(e) => setAncContent(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
              ></textarea>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Event / Distribution Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={ancEventDate && ancEventDate.includes('T') ? ancEventDate.split('T')[0] : (ancEventDate && !isNaN(Date.parse(ancEventDate)) && ancEventDate.includes('-') ? ancEventDate.split(' ')[0] : ancEventDate)}
                  onChange={(e) => setAncEventDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Location / Venue</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Parish Gymnasium"
                  value={ancLocation}
                  onChange={(e) => setAncLocation(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 8px 0' }}>
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

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={ancSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: editingAncId ? '#16a34a' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                }}
              >
                {ancSubmitting
                  ? (editingAncId ? 'Saving Changes...' : 'Publishing...')
                  : (editingAncId ? 'Save Changes' : 'Publish Announcement')}
              </button>

              {editingAncId && (
                <button
                  type="button"
                  onClick={handleCancelEditAnnouncement}
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

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                    <span>Posted: {anc.createdAt ? new Date(anc.createdAt).toLocaleDateString() : 'Recent'}</span>
                    {anc.eventDate && <span>Event Date: {anc.eventDate.includes('T') || !isNaN(Date.parse(anc.eventDate)) ? new Date(anc.eventDate).toLocaleDateString() : anc.eventDate}</span>}
                    {anc.location && <span>Venue: {anc.location}</span>}
                    {anc.creatorName && <span>By: {anc.creatorName}</span>}
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

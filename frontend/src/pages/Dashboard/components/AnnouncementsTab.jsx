import React from 'react';

const AnnouncementsTab = ({
  announcements,
  ancTitle, setAncTitle,
  ancContent, setAncContent,
  ancCategory, setAncCategory,
  ancEventDate, setAncEventDate,
  ancLocation, setAncLocation,
  ancIsPinned, setAncIsPinned,
  ancSubmitting,
  handleCreateAnnouncement,
  handleDeleteAnnouncement
}) => {
  return (
    <div className="dashboard-main-content">
      <div style={{ marginBottom: '24px' }}>
        <h2 className="dashboard-section-title" style={{ margin: 0 }}>Parish Community Announcements</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Broadcast relief distributions, schedule parish activities, and publish urgent announcements
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.3fr)', gap: '24px', alignItems: 'flex-start' }}>
        {/* Create Announcement Form */}
        <div className="dashboard-form-card">
          <h3 className="form-title" style={{ marginBottom: '16px' }}>Publish New Announcement</h3>
          <form className="dashboard-form" onSubmit={handleCreateAnnouncement}>
            <div className="form-group">
              <label className="form-label">Announcement Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Upcoming Relief Goods Distribution"
                value={ancTitle}
                onChange={(e) => setAncTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={ancCategory} onChange={(e) => setAncCategory(e.target.value)}>
                <option value="General">General Announcement</option>
                <option value="Relief Operation">Relief Operation</option>
                <option value="Ministry Schedule">Ministry Schedule</option>
                <option value="Scholarship Notice">Scholarship Notice</option>
                <option value="Urgent Advisory">Urgent Advisory</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message Details *</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Enter complete announcement details, guidelines, or beneficiary criteria..."
                value={ancContent}
                onChange={(e) => setAncContent(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Event / Distribution Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={ancEventDate}
                  onChange={(e) => setAncEventDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location / Venue</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Parish Gymnasium"
                  value={ancLocation}
                  onChange={(e) => setAncLocation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 16px 0' }}>
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

            <button
              type="submit"
              disabled={ancSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              {ancSubmitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </div>

        {/* Existing Announcements Feed */}
        <div className="dashboard-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="dashboard-chart-title" style={{ margin: 0 }}>Active Announcements</h3>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
              {announcements.length} Published
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '640px', overflowY: 'auto' }}>
            {announcements.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No announcements posted yet. Use the form on the left to publish one.
              </div>
            ) : (
              announcements.map((anc) => (
                <div
                  key={anc._id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: anc.isPinned ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: anc.isPinned ? '#f0f7ff' : '#ffffff',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1e40af', textTransform: 'uppercase' }}>
                        {anc.category || 'General'}
                      </span>
                      {anc.isPinned && (
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', backgroundColor: '#dbeafe', padding: '3px 8px', borderRadius: '6px' }}>
                          Pinned
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(anc._id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{anc.title}</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{anc.content}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                    <span>Posted: {new Date(anc.createdAt).toLocaleDateString()}</span>
                    {anc.eventDate && <span>Event Date: {new Date(anc.eventDate).toLocaleDateString()}</span>}
                    {anc.location && <span>Venue: {anc.location}</span>}
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

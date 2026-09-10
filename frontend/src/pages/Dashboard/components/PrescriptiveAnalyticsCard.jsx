import React from 'react';
import { rankScholarsByRenewalEligibility } from '../../../utils/prescriptiveAnalytics';

const PrescriptiveAnalyticsCard = ({
  users = [],
  setMainTab,
  setSectorFilter,
  setDisburseModalUser,
  setDisburseAmount,
  setDisburseSectorId
}) => {
  const rankedScholars = rankScholarsByRenewalEligibility(users);
  
  const fastTrackCount = rankedScholars.filter(s => s.prescriptiveMetrics.recommendation === 'Fast-Track Renewal').length;
  const servicePendingCount = rankedScholars.filter(s => s.prescriptiveMetrics.recommendation === 'Service Hours Pending').length;
  const docsRequiredCount = rankedScholars.filter(s => s.prescriptiveMetrics.recommendation === 'Documents Required' || s.prescriptiveMetrics.recommendation === 'Document Review Required').length;
  const totalScholars = rankedScholars.length;

  const topPriorityScholars = rankedScholars.slice(0, 4);

  const handleOpenScholarsDirectory = () => {
    if (setSectorFilter) setSectorFilter('Scholars');
    if (setMainTab) setMainTab('sectors');
  };

  const handleQuickGrantDisburse = (scholar) => {
    if (setDisburseModalUser) setDisburseModalUser(scholar);
    if (setDisburseAmount) setDisburseAmount(String(scholar.scholarDetails?.monthlyAllowance || '2000'));
    if (setDisburseSectorId) setDisburseSectorId('Scholars');
  };

  return (
    <div className="dashboard-chart-card" style={{ marginBottom: '24px', border: '2px solid #2563eb', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 8px 24px rgba(37,99,235,0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 9px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Prescriptive Decision Support
            </span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Scholarship Grant Renewal &amp; Educational Aid Recommender
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Multi-criteria algorithm cross-referencing academic standing, verified parish community service, and document compliance to prescribe grant approvals
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenScholarsDirectory}
          style={{
            background: '#eff6ff',
            color: '#2563eb',
            border: '1.5px solid #bfdbfe',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>View All Student Scholars ({totalScholars})</span>
          <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Fast-Track Renewal</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#15803d', margin: '4px 0 0 0' }}>{fastTrackCount} Scholars</div>
          <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '2px' }}>Approved: Service &amp; grades clear</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Parish Service Pending</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', margin: '4px 0 0 0' }}>{servicePendingCount} Scholars</div>
          <div style={{ fontSize: '11.5px', color: '#1d4ed8', marginTop: '2px' }}>Passes grades; service hours required</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>Documents Required</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#b45309', margin: '4px 0 0 0' }}>{docsRequiredCount} Scholars</div>
          <div style={{ fontSize: '11.5px', color: '#b45309', marginTop: '2px' }}>Pending enrollment / grade slip</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Active Scholar Roster</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '4px 0 0 0' }}>{totalScholars} Beneficiaries</div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Parish Educational Ministry</div>
        </div>
      </div>

      {/* Top Prescriptive Renewal Action List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Prescribed Grant Decisions &amp; Allowance Actions
          </span>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Ranked by Prescriptive Decision Model (40% GWA, 35% Service, 15% Docs, 10% Need)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topPriorityScholars.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No registered student scholars found to evaluate. Add student members under the Scholars ministry.
            </div>
          ) : (
            topPriorityScholars.map((scholar, index) => {
              const m = scholar.prescriptiveMetrics;
              return (
                <div
                  key={scholar._id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: `1.5px solid ${m.tierBorder}`,
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: m.recommendation === 'Fast-Track Renewal' ? '#16a34a' : '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      #{index + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{scholar.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {m.school} • {m.courseProgram}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                      {m.prescribedAction}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span>Academics: <strong>{m.gwaLabel}</strong></span>
                      <span>•</span>
                      <span>Ministry Service: <strong>{m.isServiceRendered ? 'Completed' : 'Pending'}</strong></span>
                      <span>•</span>
                      <span>Docs: <strong>{m.submittedDocs}/{m.totalDocs} verified</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800',
                      background: m.tierBg,
                      color: m.tierColor,
                      border: `1px solid ${m.tierBorder}`,
                      whiteSpace: 'nowrap'
                    }}>
                      {m.recommendation} ({m.score}/100)
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuickGrantDisburse(scholar)}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Disburse Grant
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptiveAnalyticsCard;

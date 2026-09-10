/**
 * Prescriptive Analytics Engine: Beneficiary Vulnerability & Equity Index
 * 
 * Algorithm:
 * Vulnerability Score (0-100) = (Sector Weight * 0.35) + (Income Weight * 0.25) + (Equity/Recency * 0.30) + (Verification * 0.10)
 * 
 * Goal: Prevents aid hoarding/double-claiming and mathematically prioritizes neglected, high-risk families.
 */

export const calculateVulnerabilityScore = (user) => {
  if (!user) return { score: 0, tier: 'Normal', rationale: 'No data', daysSinceAid: null };

  // 1. Sector Vulnerability Score (35%)
  let sectorScore = 50;
  const sector = (user.sectorGroup || '').toLowerCase();
  if (sector.includes('disaster')) sectorScore = 95;
  else if (sector.includes('pwd') || sector.includes('disabilit')) sectorScore = 90;
  else if (sector.includes('senior')) sectorScore = 85;
  else if (sector.includes('solo parent')) sectorScore = 80;
  else if (sector.includes('prison')) sectorScore = 75;
  else if (sector.includes('scholar')) sectorScore = 70;

  // 2. Household Income Score (25%)
  let incomeScore = 65;
  const income = user.scholarDetails?.householdIncome;
  if (income !== undefined && income !== null && income > 0) {
    if (income < 8000) incomeScore = 95;
    else if (income <= 15000) incomeScore = 75;
    else if (income <= 25000) incomeScore = 50;
    else incomeScore = 30;
  }

  // 3. Equity & Recency Score (30% - Starvation/Neglect Protection)
  let equityScore = 100; // Default for first-time / unserved members
  let daysSinceAid = null;
  
  if (user.lastAidReceivedDate) {
    const diffTime = Math.abs(new Date() - new Date(user.lastAidReceivedDate));
    daysSinceAid = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysSinceAid > 60) equityScore = 90;
    else if (daysSinceAid >= 30) equityScore = 70;
    else if (daysSinceAid >= 14) equityScore = 40;
    else equityScore = 15; // Recently served within 2 weeks -> Deprioritize for equity
  } else {
    // If never received aid, give highest equity priority
    equityScore = 100;
  }

  // 4. Verification Factor (10%)
  let verifScore = 60;
  if (user.scholarDetails?.requirements?.indigencyCert) {
    verifScore = 100;
  } else if (user.status === 'active') {
    verifScore = 80;
  }

  // Final Weighted Multi-Criteria Prescriptive Score
  const score = Math.min(100, Math.max(1, Math.round(
    (sectorScore * 0.35) + 
    (incomeScore * 0.25) + 
    (equityScore * 0.30) + 
    (verifScore * 0.10)
  )));

  // Determine Urgency Tier
  let tier = 'Moderate Priority';
  let tierColor = '#2563eb';
  let tierBg = '#eff6ff';
  let tierBorder = '#bfdbfe';

  if (score >= 80) {
    tier = 'Critical Priority';
    tierColor = '#dc2626';
    tierBg = '#fef2f2';
    tierBorder = '#fecaca';
  } else if (score >= 65) {
    tier = 'High Priority';
    tierColor = '#d97706';
    tierBg = '#fffbeb';
    tierBorder = '#fde68a';
  } else if (daysSinceAid !== null && daysSinceAid < 14) {
    tier = 'Recently Served';
    tierColor = '#16a34a';
    tierBg = '#f0fdf4';
    tierBorder = '#bbf7d0';
  }

  // Generate Prescriptive Action Rationale
  let rationale = '';
  if (daysSinceAid === null) {
    rationale = `First-time recipient in ${user.sectorGroup || 'General'} category. High equity priority.`;
  } else if (daysSinceAid < 14) {
    rationale = `Received relief aid ${daysSinceAid} day(s) ago. Deprioritized to prevent double-claiming.`;
  } else {
    rationale = `Unserved for ${daysSinceAid} days. ${user.sectorGroup || 'Community'} sector urgency.`;
  }

  return {
    score,
    tier,
    tierColor,
    tierBg,
    tierBorder,
    daysSinceAid,
    rationale,
    sectorScore,
    incomeScore,
    equityScore
  };
};

/**
 * Ranks all beneficiaries by their calculated Prescriptive Vulnerability Index.
 */
export const rankBeneficiariesByEquity = (users = []) => {
  const beneficiaryRoles = ['user', 'volunteer'];
  
  const analyzed = users
    .filter(u => !u.role || beneficiaryRoles.includes(u.role))
    .map(user => {
      const metrics = calculateVulnerabilityScore(user);
      return {
        ...user,
        prescriptiveMetrics: metrics
      };
    });

  // Sort descending by score
  analyzed.sort((a, b) => b.prescriptiveMetrics.score - a.prescriptiveMetrics.score);

  return analyzed;
};

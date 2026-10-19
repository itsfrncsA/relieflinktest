/**
 * Prescriptive Analytics Engine:
 * 1. Beneficiary-Driven Dynamic Budget & Fund Allocation Model
 * 2. Scholarship Grant Renewal & Multi-Criteria Educational Aid Recommender
 */

/**
 * Standard Sector Definitions & Need Urgency Weights
 */
export const SECTOR_DEFINITIONS = [
  {
    id: 'LGBTQ',
    name: 'LGBTQ Ministry',
    shortName: 'LGBTQ',
    category: 'Community Inclusion',
    urgencyWeight: 1.3,
    color: '#db2777',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    icon: 'heart'
  },
  {
    id: 'Elderly',
    name: 'Elderly & Senior Ministry',
    shortName: 'Elderly',
    category: 'Healthcare & Seniors',
    urgencyWeight: 1.4,
    color: '#b45309',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    icon: 'medical'
  },
  {
    id: 'PDL',
    name: 'Persons Deprived of Liberty (PDL)',
    shortName: 'PDL',
    category: 'Pastoral & Prison Aid',
    urgencyWeight: 1.2,
    color: '#475569',
    bgColor: '#f8fafc',
    borderColor: '#cbd5e1',
    icon: 'shield'
  },
  {
    id: 'Urban Poor',
    name: 'Urban Poor Ministry',
    shortName: 'Urban Poor',
    category: 'Community Subsistence',
    urgencyWeight: 1.5,
    color: '#047857',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    icon: 'nutrition'
  },
  {
    id: 'Migrant',
    name: 'Migrant Ministry',
    shortName: 'Migrant',
    category: 'Migrants & Families',
    urgencyWeight: 1.2,
    color: '#6d28d9',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    icon: 'users'
  },
  {
    id: 'Scholars',
    name: 'Student Scholarships',
    shortName: 'Scholars',
    category: 'Education',
    urgencyWeight: 1.6,
    color: '#1d4ed8',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    icon: 'academic'
  },
  {
    id: 'Drug Rehabilitation',
    name: 'Drug Rehabilitation Ministry',
    shortName: 'Drug Rehab',
    category: 'Wellness & Recovery',
    urgencyWeight: 1.3,
    color: '#c2410c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    icon: 'heart'
  }
];

/**
 * Calculates dynamic Prescriptive Budget & Donation Allocation across all beneficiary sectors
 * based on registered beneficiary headcount, need weighting factors, and available funds.
 */
export const calculateSectorBudgetPrescription = (users = [], totalFunds = 0, expenses = []) => {
  const genuineBeneficiaries = users.filter(u => {
    if (['superadmin', 'admin', 'staff'].includes(u.role)) return false;
    return u.sectorGroup && u.sectorGroup !== 'None' && u.sectorGroup.trim() !== '';
  });

  // Calculate headcount per sector
  const headcountMap = {};
  SECTOR_DEFINITIONS.forEach(def => {
    headcountMap[def.id] = 0;
  });

  genuineBeneficiaries.forEach(u => {
    const sec = (u.sectorGroup || '').toLowerCase();
    if (sec.includes('scholar') || sec.includes('student')) {
      headcountMap['Scholars'] = (headcountMap['Scholars'] || 0) + 1;
    } else if (sec.includes('lgbtq')) {
      headcountMap['LGBTQ'] = (headcountMap['LGBTQ'] || 0) + 1;
    } else if (sec.includes('elderly') || sec.includes('senior')) {
      headcountMap['Elderly'] = (headcountMap['Elderly'] || 0) + 1;
    } else if (sec.includes('pdl') || sec.includes('nakakolong') || sec.includes('prison')) {
      headcountMap['PDL'] = (headcountMap['PDL'] || 0) + 1;
    } else if (sec.includes('urban') || sec.includes('poor')) {
      headcountMap['Urban Poor'] = (headcountMap['Urban Poor'] || 0) + 1;
    } else if (sec.includes('migrant')) {
      headcountMap['Migrant'] = (headcountMap['Migrant'] || 0) + 1;
    } else if (sec.includes('drug') || sec.includes('rehab')) {
      headcountMap['Drug Rehabilitation'] = (headcountMap['Drug Rehabilitation'] || 0) + 1;
    }
  });

  // Map expenses to sectors
  const expenseMap = {};
  expenses.forEach(e => {
    if (e.status === 'rejected') return;
    const cat = (e.category || e.description || '').toLowerCase();
    const amount = Number(e.amount || 0);

    if (cat.includes('scholar') || cat.includes('student')) {
      expenseMap['Scholars'] = (expenseMap['Scholars'] || 0) + amount;
    } else if (cat.includes('lgbtq')) {
      expenseMap['LGBTQ'] = (expenseMap['LGBTQ'] || 0) + amount;
    } else if (cat.includes('elderly') || cat.includes('senior')) {
      expenseMap['Elderly'] = (expenseMap['Elderly'] || 0) + amount;
    } else if (cat.includes('pdl') || cat.includes('prison') || cat.includes('nakakolong')) {
      expenseMap['PDL'] = (expenseMap['PDL'] || 0) + amount;
    } else if (cat.includes('urban') || cat.includes('poor')) {
      expenseMap['Urban Poor'] = (expenseMap['Urban Poor'] || 0) + amount;
    } else if (cat.includes('migrant')) {
      expenseMap['Migrant'] = (expenseMap['Migrant'] || 0) + amount;
    } else if (cat.includes('drug') || cat.includes('rehab')) {
      expenseMap['Drug Rehabilitation'] = (expenseMap['Drug Rehabilitation'] || 0) + amount;
    }
  });

  // Calculate weighted demand scores
  let totalWeightedScore = 0;
  const sectorScores = SECTOR_DEFINITIONS.map(def => {
    const count = headcountMap[def.id] || 0;
    // Base score = count * urgencyWeight. If count is 0, give minimum baseline of 0.5 * weight
    const baseDemand = count > 0 ? (count * def.urgencyWeight) : (0.4 * def.urgencyWeight);
    totalWeightedScore += baseDemand;
    return {
      ...def,
      headcount: count,
      baseDemand
    };
  });

  // Compute percentage allocations and target amounts
  const effectiveFunds = Math.max(Number(totalFunds) || 0, 0);

  const sectorAllocations = sectorScores.map(sector => {
    const rawPercent = totalWeightedScore > 0 ? (sector.baseDemand / totalWeightedScore) * 100 : 20;
    const percentage = Math.round(rawPercent);
    const targetAmount = Math.round((percentage / 100) * effectiveFunds);
    const actualDisbursed = expenseMap[sector.id] || 0;
    const fundingGap = Math.max(targetAmount - actualDisbursed, 0);

    let allocationStatus = 'Balanced';
    let statusColor = '#2563eb';
    let statusBg = '#eff6ff';

    if (fundingGap > 0 && targetAmount > 0) {
      allocationStatus = 'Funding Required';
      statusColor = '#d97706';
      statusBg = '#fffbeb';
    } else if (actualDisbursed >= targetAmount && targetAmount > 0) {
      allocationStatus = 'Target Met';
      statusColor = '#16a34a';
      statusBg = '#f0fdf4';
    }

    return {
      ...sector,
      percentage,
      targetAmount,
      actualDisbursed,
      fundingGap,
      allocationStatus,
      statusColor,
      statusBg,
      recommendationSummary: `Prescribes ${percentage}% of total fund (₱${targetAmount.toLocaleString()}) to support ${sector.headcount > 0 ? `${sector.headcount} registered beneficiaries` : 'community reserve'}.`
    };
  });

  // Normalize percentages so sum is 100%
  const sumPercent = sectorAllocations.reduce((s, a) => s + a.percentage, 0);
  if (sumPercent !== 100 && sectorAllocations.length > 0) {
    sectorAllocations[0].percentage += (100 - sumPercent);
    sectorAllocations[0].targetAmount = Math.round((sectorAllocations[0].percentage / 100) * effectiveFunds);
  }

  return {
    totalBeneficiaries: genuineBeneficiaries.length,
    totalFunds: effectiveFunds,
    sectorAllocations
  };
};

/**
 * Prescriptive Analytics Engine: Scholarship Grant Renewal & Educational Aid Recommender
 */
export const calculateScholarPrescriptive = (user) => {
  if (!user || user.sectorGroup !== 'Scholars') return null;

  const details = user.scholarDetails || {};
  
  // 1. Academic Performance Score (40%)
  let gwaScore = 70; // Baseline
  let gwaLabel = 'Regular';
  const gwa = Number(details.gwa);

  if (!isNaN(gwa) && gwa > 0) {
    if (gwa <= 1.75 || gwa >= 90) {
      gwaScore = 100;
      gwaLabel = 'Dean\'s List / Academic Honors';
    } else if (gwa <= 2.25 || gwa >= 85) {
      gwaScore = 85;
      gwaLabel = 'Good Standing';
    } else if (gwa <= 3.00 || gwa >= 75) {
      gwaScore = 65;
      gwaLabel = 'Passing Standing';
    } else {
      gwaScore = 30;
      gwaLabel = 'Academic Warning';
    }
  }

  // 2. Parish Ministry Service Score (35%)
  const isServiceRendered = details.serviceStatus === 'Served' || details.serviceStatus === 'Completed';
  const serviceScore = isServiceRendered ? 100 : 40;

  // 3. Document Compliance Score (15%)
  const reqs = details.requirements || {};
  const docList = ['reportCard', 'enrollmentForm', 'indigencyCert', 'recommendationLetter'];
  const submittedDocs = docList.filter(d => Boolean(reqs[d])).length;
  const docScore = (submittedDocs / docList.length) * 100;

  // 4. Household Economic Need Score (10%)
  let incomeScore = 75;
  const income = Number(details.householdIncome);
  if (!isNaN(income) && income > 0) {
    if (income < 10000) incomeScore = 100;
    else if (income <= 20000) incomeScore = 75;
    else incomeScore = 50;
  }

  // Final Weighted Multi-Criteria Score (0-100)
  const score = Math.round(
    (gwaScore * 0.40) +
    (serviceScore * 0.35) +
    (docScore * 0.15) +
    (incomeScore * 0.10)
  );

  // Determine Prescriptive Action Tier
  let recommendation = 'Document Review Required';
  let tierColor = '#c2410c';
  let tierBg = '#fff7ed';
  let tierBorder = '#fed7aa';
  let prescribedAction = 'Verify school enrollment and grade records.';

  if (score >= 80 && isServiceRendered && submittedDocs >= 2) {
    recommendation = 'Fast-Track Renewal';
    tierColor = '#15803d';
    tierBg = '#f0fdf4';
    tierBorder = '#bbf7d0';
    prescribedAction = 'Approve grant renewal and disburse monthly educational allowance.';
  } else if (!isServiceRendered) {
    recommendation = 'Service Hours Pending';
    tierColor = '#1d4ed8';
    tierBg = '#eff6ff';
    tierBorder = '#bfdbfe';
    prescribedAction = 'Render 4 hours of parish relief pack distribution before check issuance.';
  } else if (submittedDocs < 2) {
    recommendation = 'Documents Required';
    tierColor = '#b45309';
    tierBg = '#fffbeb';
    tierBorder = '#fde68a';
    prescribedAction = 'Submit latest enrollment form and certified grade slip to parish office.';
  }

  return {
    score,
    recommendation,
    tierColor,
    tierBg,
    tierBorder,
    prescribedAction,
    gwaScore,
    gwaLabel,
    serviceScore,
    isServiceRendered,
    docScore,
    submittedDocs,
    totalDocs: docList.length,
    incomeScore,
    school: details.school || 'Unspecified Institution',
    courseProgram: details.courseProgram || 'Degree Program',
    monthlyAllowance: details.monthlyAllowance || 1500
  };
};

/**
 * Analyzes and ranks all student scholars by prescriptive renewal priority.
 */
export const rankScholarsByRenewalEligibility = (users = []) => {
  const scholars = users
    .filter(u => u.sectorGroup === 'Scholars')
    .map(user => {
      const metrics = calculateScholarPrescriptive(user);
      return {
        ...user,
        prescriptiveMetrics: metrics
      };
    })
    .filter(u => u.prescriptiveMetrics !== null);

  scholars.sort((a, b) => b.prescriptiveMetrics.score - a.prescriptiveMetrics.score);

  return scholars;
};

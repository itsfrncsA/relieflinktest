/**
 * Prescriptive Analytics Engine: Scholarship Grant Renewal & Educational Aid Recommender
 * 
 * Multi-Criteria Decision Model:
 * 1. Academic Performance / GWA (40% Weight):
 *    - GWA <= 1.75 (or >= 90%): 100 pts (High Academic Honors / Dean's List)
 *    - GWA 1.76 - 2.25 (or 85-89%): 85 pts (Good Academic Standing)
 *    - GWA 2.26 - 3.00 (or 75-84%): 65 pts (Passing Standing)
 *    - GWA > 3.00 (or < 75%): 30 pts (Academic Warning)
 *    - Unrecorded GWA: 70 pts (Baseline)
 * 
 * 2. Parish Community Ministry Service (35% Weight):
 *    - Service Status 'Served' or 'Completed': 100 pts (Community service completed)
 *    - Service Status 'Pending': 40 pts (Service hours required before grant disbursement)
 * 
 * 3. Document Compliance & Verification (15% Weight):
 *    - Evaluates required docs: reportCard, enrollmentForm, indigencyCert, recommendationLetter
 *    - Completeness ratio (0-100 pts)
 * 
 * 4. Economic Need / Household Subsistence (10% Weight):
 *    - Household income < PHP 10,000: 100 pts
 *    - PHP 10,000 - 20,000: 75 pts
 *    - > PHP 20,000: 50 pts
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

  // Sort by highest score first
  scholars.sort((a, b) => b.prescriptiveMetrics.score - a.prescriptiveMetrics.score);

  return scholars;
};

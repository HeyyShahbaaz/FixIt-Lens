export interface ApplianceRecord {
  id: string;
  timestamp: number;
  appliance: string;
  modelNumber?: string;
  problemSummary: string;
  likelyCauses: string[];
  status: 'pending' | 'fixed' | 'needs_pro';
}

/**
 * Checks if an appliance has experienced repeat issues
 */
export function detectRepeatBreakdown(
  history: ApplianceRecord[],
  currentAppliance: string,
  problemSummary: string
): { isRepeat: boolean; count: number; message: string | null } {
  const normCurrent = currentAppliance.trim().toLowerCase();
  const keywords = problemSummary
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const matching = history.filter((item) => {
    const itemNorm = item.appliance.trim().toLowerCase();
    if (itemNorm !== normCurrent && !itemNorm.includes(normCurrent) && !normCurrent.includes(itemNorm)) {
      return false;
    }
    // Check if problem summary shares keywords or causes
    const itemProb = item.problemSummary.toLowerCase();
    const hasSharedKeyword = keywords.some((kw) => itemProb.includes(kw));
    return hasSharedKeyword || itemNorm === normCurrent;
  });

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

  const count = matching.length;
  if (count >= 2) {
    const occurrence = count + 1;
    return {
      isRepeat: true,
      count: occurrence,
      message: `This is the ${getOrdinal(occurrence)} time this ${currentAppliance} has experienced an issue. Consider a professional overhaul or appliance replacement.`
    };
  }

  return { isRepeat: false, count: 1, message: null };
}

/**
 * Ensures safety rules are strictly enforced for high-risk appliances
 */
export function enforceSafetyRules(
  appliance: string,
  problemSummary: string,
  verdictDecision: 'diy' | 'diy_with_caution' | 'call_a_pro',
  safetyWarnings: string[]
): {
  decision: 'diy' | 'diy_with_caution' | 'call_a_pro';
  overridden: boolean;
  mandatoryWarnings: string[];
} {
  const highRiskKeywords = [
    'gas',
    'lpg',
    'cylinder',
    'mcb',
    'fuse box',
    'breaker',
    'high voltage',
    'geyser',
    'water heater',
    'mains wiring',
    'electric shock',
    'burning smell'
  ];

  const textToCheck = `${appliance} ${problemSummary}`.toLowerCase();
  const matched = highRiskKeywords.filter((kw) => textToCheck.includes(kw));

  const mandatoryWarnings = [...safetyWarnings];
  let decision = verdictDecision;
  let overridden = false;

  if (matched.length > 0 && verdictDecision !== 'call_a_pro') {
    decision = 'call_a_pro';
    overridden = true;
    mandatoryWarnings.unshift(
      `DANGER: High risk components detected (${matched.join(', ')}). DIY repairs on high-voltage or gas systems are strictly hazardous. Always call a licensed technician.`
    );
  }

  return { decision, overridden, mandatoryWarnings };
}

/**
 * Calculates overall confidence score from cause confidence levels
 */
export function calculateOverallConfidence(
  causes: Array<{ confidence: 'low' | 'medium' | 'high'; probability_percent: number }>
): { score: number; label: 'low' | 'medium' | 'high' } {
  if (!causes || causes.length === 0) return { score: 30, label: 'low' };

  let weightedScore = 0;
  let totalWeight = 0;

  for (const c of causes) {
    const weight = c.probability_percent || 10;
    const val = c.confidence === 'high' ? 90 : c.confidence === 'medium' ? 65 : 35;
    weightedScore += val * weight;
    totalWeight += weight;
  }

  const score = Math.round(totalWeight > 0 ? weightedScore / totalWeight : 50);
  const label = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

  return { score, label };
}

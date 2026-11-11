import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectRepeatBreakdown,
  enforceSafetyRules,
  calculateOverallConfidence,
  ApplianceRecord
} from './safetyAndStats';

test('detectRepeatBreakdown flags multiple occurrences', () => {
  const history: ApplianceRecord[] = [
    {
      id: '1',
      timestamp: Date.now() - 100000,
      appliance: 'Ceiling Fan',
      problemSummary: 'Wobbling and grinding noise',
      likelyCauses: ['loose blade screw'],
      status: 'fixed'
    },
    {
      id: '2',
      timestamp: Date.now() - 50000,
      appliance: 'Ceiling Fan',
      problemSummary: 'Strange humming noise when high speed',
      likelyCauses: ['capacitor degradation'],
      status: 'pending'
    }
  ];

  const result = detectRepeatBreakdown(history, 'Ceiling Fan', 'Fan grinding again');
  assert.equal(result.isRepeat, true);
  assert.equal(result.count, 3);
  assert.match(result.message!, /3rd time this Ceiling Fan/);
});

test('detectRepeatBreakdown returns false for first time issues', () => {
  const history: ApplianceRecord[] = [
    {
      id: '1',
      timestamp: Date.now() - 100000,
      appliance: 'Refrigerator',
      problemSummary: 'Freezer not cooling',
      likelyCauses: ['defrost timer'],
      status: 'fixed'
    }
  ];

  const result = detectRepeatBreakdown(history, 'Washing Machine', 'Vibration during spin');
  assert.equal(result.isRepeat, false);
  assert.equal(result.count, 1);
  assert.equal(result.message, null);
});

test('enforceSafetyRules overrides DIY verdict for gas appliances', () => {
  const check = enforceSafetyRules('Gas Stove', 'Smell of gas leak near burner', 'diy', [
    'Turn off burner'
  ]);
  assert.equal(check.decision, 'call_a_pro');
  assert.equal(check.overridden, true);
  assert.ok(check.mandatoryWarnings[0].includes('DANGER: High risk'));
});

test('enforceSafetyRules overrides DIY verdict for geysers with electrical faults', () => {
  const check = enforceSafetyRules('Geyser / Water Heater', 'Sparks near thermostat plug', 'diy', [
    'Check wiring'
  ]);
  assert.equal(check.decision, 'call_a_pro');
  assert.equal(check.overridden, true);
});

test('enforceSafetyRules keeps DIY verdict for safe appliances like ceiling fans', () => {
  const check = enforceSafetyRules('Ceiling Fan', 'Wobbling blade screw', 'diy', [
    'Turn off switch at wall'
  ]);
  assert.equal(check.decision, 'diy');
  assert.equal(check.overridden, false);
});

test('enforceSafetyRules keeps DIY verdict for tap plumbing leakage without hazards', () => {
  const check = enforceSafetyRules('Tap / Plumbing', 'Leaking spout and worn rubber washer', 'diy', [
    'Shut off angle stop-cock valve before loosening fittings'
  ]);
  assert.equal(check.decision, 'diy');
  assert.equal(check.overridden, false);
  assert.equal(check.mandatoryWarnings[0], 'Shut off angle stop-cock valve before loosening fittings');
});

test('calculateOverallConfidence calculates weighted scores correctly', () => {
  const highConfidence = calculateOverallConfidence([
    { confidence: 'high', probability_percent: 80 },
    { confidence: 'medium', probability_percent: 20 }
  ]);
  assert.equal(highConfidence.label, 'high');
  assert.ok(highConfidence.score >= 75);

  const lowConfidence = calculateOverallConfidence([
    { confidence: 'low', probability_percent: 50 },
    { confidence: 'low', probability_percent: 50 }
  ]);
  assert.equal(lowConfidence.label, 'low');
  assert.ok(lowConfidence.score <= 45);
});

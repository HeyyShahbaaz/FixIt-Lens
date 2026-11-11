import { SavedDiagnosis, MaintenanceReminder, ApplianceStatus, DiagnosisResponse } from '../types/diagnosis';

const STORAGE_DIAGNOSES_KEY = 'fixit_lens_saved_diagnoses_v2';
const STORAGE_REMINDERS_KEY = 'fixit_lens_maintenance_reminders_v2';

const SEED_DIAGNOSES: SavedDiagnosis[] = [
  {
    id: 'seed-fan-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    appliance: 'Ceiling Fan',
    modelNumber: 'Havells Festiva 1200mm',
    extraNotes: 'Oscillating wobble and metal ticking sound at speed 4',
    status: 'fixed',
    completedSteps: [1, 2, 3],
    language: 'en',
    chatHistory: [],
    diagnosis: {
      appliance: 'Ceiling Fan',
      problem_summary: 'Blade imbalance and loose shank screw causing wobble and rhythmic clicking at medium-to-high RPM',
      observations: {
        visual: ['Visible vertical tilt in blade #2', 'Slight oscillation of downrod ball mount'],
        audio: ['Rhythmic mechanical ticking (approx. 4 Hz) matching fan rotation speed', 'No electrical arcing noise']
      },
      safety_warnings: [
        'Turn off the wall switch and disconnect the MCB breaker before touching the fan.',
        'Never touch fan blades while motor is spinning down.',
        'Ensure ladder is stable on level flooring.'
      ],
      likely_causes: [
        {
          cause: 'Loose blade mounting screws or warped blade pitch',
          probability_percent: 75,
          confidence: 'high',
          reasoning: 'Visual wobble directly matches single blade misalignment and cyclical click'
        },
        {
          cause: 'Downrod shackle pin wear or loose canopy bracket',
          probability_percent: 20,
          confidence: 'medium',
          reasoning: 'Upper ball joint has minor play during startup torque'
        },
        {
          cause: 'Ball bearing ball-cage dry friction',
          probability_percent: 5,
          confidence: 'low',
          reasoning: 'Sound is not continuous grinding typical of seized bearings'
        }
      ],
      fix_steps: [
        {
          step: 1,
          instruction: 'Turn off the wall switch and isolate power at the distribution board.',
          tools_needed: ['Tester / Screwdriver'],
          warning: 'Verify no current with a phase tester before ascending ladder'
        },
        {
          step: 2,
          instruction: 'Use a Philips-head screwdriver to tighten all 6 blade bracket screws firmly.',
          tools_needed: ['Philips PH2 screwdriver'],
          warning: 'Do not overtighten to avoid stripping screw threads'
        },
        {
          step: 3,
          instruction: 'Measure the distance from each blade tip to the ceiling with a ruler. Gently bend misaligned blade bracket until all 3 match within 3mm.',
          tools_needed: ['Ruler / Measuring tape'],
          warning: null
        }
      ],
      tools_and_parts_list: [
        { item: 'PH2 Philips Screwdriver', approx_price_inr: '₹80 - ₹150' },
        { item: 'Balancing Clip Kit (optional)', approx_price_inr: '₹60 - ₹120' }
      ],
      verdict: {
        decision: 'diy',
        reason: 'Loose blade bracket screws and blade balancing are safe, straightforward DIY tasks that require no motor disassembly.',
        estimated_diy_cost_inr: '₹0 - ₹120',
        estimated_pro_cost_inr: '₹300 - ₹500',
        difficulty: 'easy',
        time_needed: '15 - 20 mins'
      },
      follow_up_question: null,
      urgency: 'fix_this_week',
      maintenance_tips: [
        'Dust fan blades every 2 months to prevent dust-weight imbalance.',
        'Check downrod safety split-pin every 12 months.'
      ]
    }
  },
  {
    id: 'seed-washer-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
    appliance: 'Washing Machine',
    modelNumber: 'LG Inverter 7.0kg Front Load',
    extraNotes: 'Severe violent thumping during spin cycle, walks across the floor',
    status: 'pending',
    completedSteps: [1],
    language: 'en',
    chatHistory: [],
    diagnosis: {
      appliance: 'Washing Machine',
      problem_summary: 'Severe drum vibration and chassis knocking during high-speed extraction',
      observations: {
        visual: ['Chassis shifts laterally by 2-3 cm', 'Machine is not level on the tile surface'],
        audio: ['Heavy metallic clunking sound synchronized with spin acceleration']
      },
      safety_warnings: [
        'Unplug the power cord from the wall socket before inspecting rear or feet.',
        'Ensure water supply taps are closed before shifting heavy unit.',
        'Beware of pinch points around the lower chassis.'
      ],
      likely_causes: [
        {
          cause: 'Uneven leveling feet or transit bolts not removed',
          probability_percent: 65,
          confidence: 'high',
          reasoning: 'Front right leveling leg is floating off the floor with visible gap'
        },
        {
          cause: 'Worn drum shock absorber or cracked spider arm',
          probability_percent: 30,
          confidence: 'medium',
          reasoning: 'If leveling does not solve, internal hydraulic damper may be leaking fluid'
        },
        {
          cause: 'Unbalanced laundry load (heavy wet blanket)',
          probability_percent: 5,
          confidence: 'low',
          reasoning: 'Occurred during regular wash according to notes'
        }
      ],
      fix_steps: [
        {
          step: 1,
          instruction: 'Unplug the power socket and push on opposite diagonal corners of the machine to check for rocking.',
          tools_needed: ['Work gloves'],
          warning: 'Do not tilt machine toward yourself alone'
        },
        {
          step: 2,
          instruction: 'Use an adjustable spanner to loosen the lock nut on the floating leveling foot, twist foot down until firmly seated on floor, then tighten lock nut.',
          tools_needed: ['Adjustable spanner / Wrench', 'Spirit level app'],
          warning: null
        },
        {
          step: 3,
          instruction: 'Run an empty rinse/spin cycle with an anti-vibration rubber pad under each foot.',
          tools_needed: ['Anti-vibration pads (optional)'],
          warning: null
        }
      ],
      tools_and_parts_list: [
        { item: 'Adjustable Spanner (17mm)', approx_price_inr: '₹150 - ₹250' },
        { item: 'Rubber Anti-Vibration Washing Machine Pads (Pack of 4)', approx_price_inr: '₹250 - ₹450' }
      ],
      verdict: {
        decision: 'diy',
        reason: 'Leveling machine feet and checking diagonal stability is standard DIY homeowner maintenance.',
        estimated_diy_cost_inr: '₹250 - ₹450',
        estimated_pro_cost_inr: '₹500 - ₹800',
        difficulty: 'easy',
        time_needed: '20 mins'
      },
      follow_up_question: 'Does the drum feel loose or clunk when you push it up and down by hand from inside the door?',
      urgency: 'fix_now',
      maintenance_tips: [
        'Run a tub clean cycle with descaling powder once every 3 months.',
        'Clean drain pump lint filter at bottom-right every month.'
      ]
    }
  }
];

const SEED_REMINDERS: MaintenanceReminder[] = [
  {
    id: 'rem-1',
    appliance: 'Washing Machine',
    title: 'Clean drain pump lint filter and run tub clean',
    frequency: 'Every month',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    completed: false,
    notes: 'Remove coins and lint from bottom trap to prevent drain pump burnout'
  },
  {
    id: 'rem-2',
    appliance: 'Ceiling Fan',
    title: 'Dust blade leading edges and verify bracket tightness',
    frequency: 'Every 3 months',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString().split('T')[0],
    completed: false,
    notes: 'Balanced dust-free blades prevent motor bearing overheating'
  },
  {
    id: 'rem-3',
    appliance: 'Refrigerator',
    title: 'Vacuum condenser coils at back and clean door gasket',
    frequency: 'Every 6 months',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], // slightly overdue
    completed: false,
    notes: 'Improves compressor cooling efficiency and lowers electricity bill'
  }
];

export function getSavedDiagnoses(): SavedDiagnosis[] {
  try {
    const raw = localStorage.getItem(STORAGE_DIAGNOSES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DIAGNOSES_KEY, JSON.stringify(SEED_DIAGNOSES));
      return SEED_DIAGNOSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading diagnoses from localStorage', e);
    return SEED_DIAGNOSES;
  }
}

export function saveDiagnosis(item: SavedDiagnosis): void {
  try {
    const current = getSavedDiagnoses();
    const updated = [item, ...current.filter((d) => d.id !== item.id)];
    localStorage.setItem(STORAGE_DIAGNOSES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed saving diagnosis', e);
  }
}

export function updateDiagnosisStatus(id: string, status: ApplianceStatus): void {
  try {
    const current = getSavedDiagnoses();
    const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
    localStorage.setItem(STORAGE_DIAGNOSES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed updating diagnosis status', e);
  }
}

export function toggleStepCompletion(diagnosisId: string, stepNum: number): number[] {
  try {
    const current = getSavedDiagnoses();
    let newSteps: number[] = [];
    const updated = current.map((item) => {
      if (item.id === diagnosisId) {
        const completed = item.completedSteps || [];
        newSteps = completed.includes(stepNum)
          ? completed.filter((s) => s !== stepNum)
          : [...completed, stepNum];
        return { ...item, completedSteps: newSteps };
      }
      return item;
    });
    localStorage.setItem(STORAGE_DIAGNOSES_KEY, JSON.stringify(updated));
    return newSteps;
  } catch (e) {
    console.error('Failed toggling step', e);
    return [];
  }
}

export function getMaintenanceReminders(): MaintenanceReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_REMINDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(SEED_REMINDERS));
      return SEED_REMINDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading reminders', e);
    return SEED_REMINDERS;
  }
}

export function saveMaintenanceReminders(reminders: MaintenanceReminder[]): void {
  try {
    localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed saving reminders', e);
  }
}

export function toggleReminderCompleted(reminderId: string): void {
  try {
    const current = getMaintenanceReminders();
    const updated = current.map((r) => (r.id === reminderId ? { ...r, completed: !r.completed } : r));
    saveMaintenanceReminders(updated);
  } catch (e) {
    console.error('Failed toggling reminder', e);
  }
}

export function addMaintenanceReminder(reminder: MaintenanceReminder): void {
  try {
    const current = getMaintenanceReminders();
    saveMaintenanceReminders([reminder, ...current]);
  } catch (e) {
    console.error('Failed adding reminder', e);
  }
}

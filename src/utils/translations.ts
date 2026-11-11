import { Language } from '../types/diagnosis';

export const translations = {
  en: {
    appName: 'FixIt Lens',
    appTagline: 'AI Breakdown Diagnoser for Visuals & Sound',
    navDiagnose: 'Diagnose',
    navAppliances: 'My Appliances',
    navReminders: 'Maintenance',
    navTips: 'Recording Tips',
    navSafety: 'Safety Guide',
    
    // Persistent disclaimer
    disclaimerText: 'AI suggestions are not a substitute for a qualified technician. Never open electrical or gas equipment unless you are trained.',
    disclaimerTitle: 'Safety Precaution',

    // Home / New Diagnosis
    startDiagnosis: 'Start a Breakdown Diagnosis',
    recordVideo: 'Record Video (10-20s)',
    uploadVideo: 'Upload Video Clip',
    stopRecording: 'Stop Recording',
    recordingRemaining: 'Remaining',
    previewClip: 'Clip Preview',
    retakeVideo: 'Retake',
    useClip: 'Analyze Breakdown',
    applianceCategory: 'Appliance Category',
    modelNumberPlaceholder: 'Model number (e.g. Havells Festiva 1200mm, LG Front Load 8kg)',
    extraNotesPlaceholder: 'Extra notes or unusual sounds you noticed...',
    orTrySample: 'Or try an instant sample breakdown clip:',
    selectCategory: 'Select Appliance Category',
    voiceInputPrompt: 'Hold to speak extra notes',
    listening: 'Listening to your voice...',

    // Categories
    catFan: 'Ceiling / Table Fan',
    catWashingMachine: 'Washing Machine',
    catFridge: 'Refrigerator',
    catAC: 'Air Conditioner',
    catPlumbing: 'Tap / Plumbing / Pump',
    catBike: 'Bicycle / Motorbike',
    catMicrowave: 'Microwave Oven',
    catGeyser: 'Water Heater / Geyser',
    catOther: 'Other / Auto-detect',

    // Sample clips
    sampleFan: 'Wobbling Ceiling Fan (Squeak)',
    sampleWasher: 'Banging Washing Machine (Spin)',
    sampleChain: 'Grinding Bicycle Chain',
    sampleTap: 'Leaking Brass Tap & Shudder',

    // Loading states
    loadingAudio: 'Listening to the acoustic frequencies...',
    loadingVideo: 'Inspecting visual vibrations & hardware...',
    loadingSafety: 'Evaluating high-voltage & gas safety rules...',
    loadingFinalizing: 'Synthesizing step-by-step repair guide...',

    // Result screen
    diagnosisResult: 'Breakdown Diagnosis',
    safetyWarningsTitle: 'Critical Safety Warnings',
    safetyMandatory: 'Safety First: Complete before attempting any repair',
    sawAndHeardTitle: 'What I Saw and Heard',
    visualObservations: 'Visual Observations',
    audioObservations: 'Acoustic & Sound Analysis',
    likelyCausesTitle: 'Likely Causes',
    confidence: 'Confidence',
    probability: 'Probability',
    stepsTitle: 'Step-by-Step Fix Guide',
    stepCheckboxAria: 'Mark step complete',
    toolsNeeded: 'Tools needed',
    warningForStep: 'Warning',
    toolsAndPartsTitle: 'Tools & Replacement Parts',
    approxPrice: 'Estimated Cost (India)',
    copyList: 'Copy List',
    copied: 'Copied to clipboard!',
    verdictTitle: 'Technician Verdict',
    diyDecision: 'Safe for DIY Repair',
    diyCautionDecision: 'DIY with Caution',
    callProDecision: 'Call a Professional Technician',
    whyPro: 'Why a professional is required:',
    techHandoffTitle: 'What to tell your technician:',
    copyTechSummary: 'Copy Technician Summary',
    shareWhatsApp: 'Share to WhatsApp',
    estDiyCost: 'Est. DIY Cost',
    estProCost: 'Est. Pro Cost',
    difficulty: 'Difficulty',
    timeNeeded: 'Estimated Time',
    urgencyTitle: 'Urgency Level',
    urgency_fix_now: 'Fix Immediately (Risk of damage/hazard)',
    urgency_fix_this_week: 'Fix This Week',
    urgency_can_wait: 'Can Wait / Cosmetic',
    maintenanceTipsTitle: 'Long-term Maintenance Tips',

    // Follow-up chat
    followUpTitle: 'Clarification Needed for Higher Accuracy',
    followUpQuickYes: 'Yes, exactly',
    followUpQuickNo: 'No, does not happen',
    followUpQuickNotSure: 'Not sure / Need to check',
    sendAnswer: 'Submit Answer',
    answerPlaceholder: 'Type or speak your reply to refine the diagnosis...',
    updatingDiagnosis: 'Re-evaluating diagnosis with your answers...',

    // Grounding
    findManualParts: 'Find Official Manuals & Genuine Parts',
    searchSources: 'Verified Web Sources (Google Grounded)',
    searchingGrounding: 'Searching live manuals, schematics & prices...',
    noGroundingSources: 'No external links returned.',
    close: 'Close',

    // Hands-Free
    handsFreeMode: 'Hands-Free Voice Mode',
    handsFreeNotice: 'Say "Next", "Repeat", or "Back" while you work',
    nextStep: 'Next Step',
    prevStep: 'Previous Step',
    repeatStep: 'Repeat Step',
    readAloud: 'Read Aloud',
    stopSpeaking: 'Stop Audio',
    exitHandsFree: 'Exit Hands-Free',

    // Appliances & History
    myAppliancesTitle: 'My Appliance Breakdown Records',
    emptyHistory: 'No breakdown diagnoses recorded yet.',
    statusPending: 'Repair Pending',
    statusFixed: 'Fixed & Working',
    statusNeedsPro: 'Awaiting Technician',
    repeatAlert: 'Repeat Issue Detected',
    exportPdf: 'Print / Export PDF',
    viewDetails: 'View Diagnosis',

    // Maintenance reminders
    remindersTitle: 'Preventive Maintenance Reminders',
    addReminder: 'Add Custom Reminder',
    dueBy: 'Due by',
    markDone: 'Mark Done',
    completedReminders: 'Completed Maintenance',
    emptyReminders: 'No active maintenance reminders. Diagnosing appliances will automatically suggest preventive tips!',

    // Confidence meter
    overallConfidence: 'Overall Analysis Confidence',
    lowConfidenceTip: 'Recording was slightly unclear. For higher confidence, record 10-20 seconds closer in a quieter room with good lighting and clear audio.',
    retakeTip: 'Record Clearer Clip',

    // Tips modal
    tipsModalTitle: 'How to Record an Accurate Clip',
    tip1Title: 'Capture Clear Sound',
    tip1Desc: 'Get within 1-2 feet of the noisy motor or joint. Turn off TV or background chatter.',
    tip2Title: 'Show the Motion & Vibrations',
    tip2Desc: 'Hold the camera steady for 10-20 seconds while the appliance is running or rattling.',
    tip3Title: 'Frame the Model Plate',
    tip3Desc: 'Briefly pan across the brand logo or rating sticker to assist manual matching.',
    tip4Title: 'Never Touch Live Terminals',
    tip4Desc: 'Do not remove dangerous high-voltage covers or tamper with gas pipes for video.'
  },
  hi: {
    appName: 'फिक्स-इट लेंस (FixIt Lens)',
    appTagline: 'घरेलू उपकरणों की खराबी का AI वीडियो और आवाज़ विश्लेषक',
    navDiagnose: 'निदान करें',
    navAppliances: 'मेरे उपकरण',
    navReminders: 'रखरखाव (मेंटेनेंस)',
    navTips: 'रिकॉर्डिंग टिप्स',
    navSafety: 'सुरक्षा नियम',

    // Persistent disclaimer
    disclaimerText: 'AI सुझाव किसी प्रमाणित तकनीशियन का विकल्प नहीं हैं। जब तक आप प्रशिक्षित न हों, कभी भी बिजली या गैस उपकरणों को न खोलें।',
    disclaimerTitle: 'सुरक्षा चेतावनी',

    // Home / New Diagnosis
    startDiagnosis: 'उपकरण की खराबी का निदान करें',
    recordVideo: 'वीडियो रिकॉर्ड करें (10-20 सेकंड)',
    uploadVideo: 'वीडियो क्लिप अपलोड करें',
    stopRecording: 'रिकॉर्डिंग रोकें',
    recordingRemaining: 'शेष समय',
    previewClip: 'क्लिप का पूर्वावलोकन',
    retakeVideo: 'दोबारा रिकॉर्ड करें',
    useClip: 'खराबी का विश्लेषण करें',
    applianceCategory: 'उपकरण की श्रेणी',
    modelNumberPlaceholder: 'मॉडल नंबर (उदा. हैवेल्स 1200mm पंखा, LG 8kg वॉशिंग मशीन)',
    extraNotesPlaceholder: 'कोई विशेष आवाज़ या समस्या जो आपने देखी...',
    orTrySample: 'या तुरंत परीक्षण के लिए नमूना क्लिप चुनें:',
    selectCategory: 'उपकरण श्रेणी चुनें',
    voiceInputPrompt: 'नोट्स बोलने के लिए दबाकर रखें',
    listening: 'आपकी आवाज़ सुन रहे हैं...',

    // Categories
    catFan: 'छत / टेबल पंखा',
    catWashingMachine: 'वॉशिंग मशीन',
    catFridge: 'रेफ्रिजरेटर (फ्रिज)',
    catAC: 'एयर कंडीशनर (AC)',
    catPlumbing: 'नल / प्लंबिंग / मोटर पंप',
    catBike: 'साइकिल / मोटरसाइकिल',
    catMicrowave: 'माइक्रोवेव ओवन',
    catGeyser: 'गीज़र / वाटर हीटर',
    catOther: 'अन्य / स्वतः पहचान',

    // Sample clips
    sampleFan: 'डगमगाता छत का पंखा (चूं-चूं आवाज़)',
    sampleWasher: 'तेज़ खड़खड़ करती वॉशिंग मशीन',
    sampleChain: 'घिसती साइकिल की चेन',
    sampleTap: 'टपकता नल और पानी का झटका',

    // Loading states
    loadingAudio: 'आवाज़ और मोटर की फ्रीक्वेंसी का विश्लेषण हो रहा है...',
    loadingVideo: 'कंपन और पुर्जों की जांच की जा रही है...',
    loadingSafety: 'हाई-वोल्टेज और गैस सुरक्षा नियमों की जांच...',
    loadingFinalizing: 'मरम्मत गाइड तैयार की जा रही है...',

    // Result screen
    diagnosisResult: 'खराबी का निदान परिणाम',
    safetyWarningsTitle: 'अति आवश्यक सुरक्षा चेतावनी',
    safetyMandatory: 'सुरक्षा पहले: मरम्मत से पहले इन बातों का पालन करें',
    sawAndHeardTitle: 'वीडियो और ऑडियो में क्या दिखा व सुना',
    visualObservations: 'दृश्य अवलोकन (Visuals)',
    audioObservations: 'ध्वनि विश्लेषण (Sound)',
    likelyCausesTitle: 'संभावित कारण',
    confidence: 'विश्वसनीयता',
    probability: 'संभावना',
    stepsTitle: 'कदम-दर-कदम मरम्मत गाइड',
    stepCheckboxAria: 'कदम पूर्ण चिह्नित करें',
    toolsNeeded: 'आवश्यक औजार',
    warningForStep: 'सावधानी',
    toolsAndPartsTitle: 'आवश्यक औजार और पुर्जे',
    approxPrice: 'अनुमानित कीमत (₹ भारत)',
    copyList: 'सूची कॉपी करें',
    copied: 'कॉपी हो गया!',
    verdictTitle: 'तकनीशियन का फैसला',
    diyDecision: 'स्वयं मरम्मत कर सकते हैं (DIY)',
    diyCautionDecision: 'सावधानीपूर्वक स्वयं मरम्मत करें',
    callProDecision: 'प्रोफेशनल मैकेनिक/इंजीनियर को बुलाएं',
    whyPro: 'मैकेनिक की आवश्यकता क्यों है:',
    techHandoffTitle: 'मैकेनिक को क्या बताएं:',
    copyTechSummary: 'मैकेनिक सारांश कॉपी करें',
    shareWhatsApp: 'व्हाट्सएप पर शेयर करें',
    estDiyCost: 'अनुमानित DIY खर्च',
    estProCost: 'अनुमानित मैकेनिक खर्च',
    difficulty: 'कठिनाई स्तर',
    timeNeeded: 'अनुमानित समय',
    urgencyTitle: 'तात्कालिकता स्तर',
    urgency_fix_now: 'तुरंत ठीक करें (जोखिम हो सकता है)',
    urgency_fix_this_week: 'इस हफ्ते ठीक करें',
    urgency_can_wait: 'इंतजार किया जा सकता है',
    maintenanceTipsTitle: 'भविष्य के रखरखाव के नुस्खे',

    // Follow-up chat
    followUpTitle: 'सटीक निदान के लिए स्पष्टीकरण',
    followUpQuickYes: 'हाँ, बिल्कुल ऐसा ही है',
    followUpQuickNo: 'नहीं, ऐसा नहीं होता',
    followUpQuickNotSure: 'पक्का नहीं पता / जांचना पड़ेगा',
    sendAnswer: 'उत्तर भेजें',
    answerPlaceholder: 'निदान सुधारने के लिए अपना उत्तर लिखें या बोलें...',
    updatingDiagnosis: 'आपके उत्तर के अनुसार नया विश्लेषण हो रहा है...',

    // Grounding
    findManualParts: 'यूज़र मैनुअल और असली पुर्जे खोजें',
    searchSources: 'सत्यापित स्रोत (Google Search Grounded)',
    searchingGrounding: 'ऑनलाइन मैनुअल व पुर्जों की कीमतें खोजी जा रही हैं...',
    noGroundingSources: 'कोई बाहरी लिंक नहीं मिले।',
    close: 'बंद करें',

    // Hands-Free
    handsFreeMode: 'हैंड्स-फ्री वॉयस मोड',
    handsFreeNotice: 'काम करते समय "Next", "Repeat" या "Back" बोलें',
    nextStep: 'अगला कदम',
    prevStep: 'पिछला कदम',
    repeatStep: 'दोहराएं',
    readAloud: 'बोलकर सुनाएं',
    stopSpeaking: 'आवाज़ रोकें',
    exitHandsFree: 'हैंड्स-फ्री से बाहर आएं',

    // Appliances & History
    myAppliancesTitle: 'मेरे उपकरण और मरम्मत इतिहास',
    emptyHistory: 'अभी तक कोई मरम्मत दर्ज नहीं की गई है।',
    statusPending: 'मरम्मत बाकी है',
    statusFixed: 'ठीक हो गया',
    statusNeedsPro: 'मैकेनिक का इंतज़ार',
    repeatAlert: 'बार-बार होने वाली खराबी',
    exportPdf: 'प्रिंट / PDF एक्सपोर्ट',
    viewDetails: 'निदान देखें',

    // Maintenance reminders
    remindersTitle: 'नियमित रखरखाव के रिमाइंडर',
    addReminder: 'नया रिमाइंडर जोड़ें',
    dueBy: 'नियत तारीख',
    markDone: 'पूरा हुआ',
    completedReminders: 'पूरे किए गए कार्य',
    emptyReminders: 'कोई सक्रिय रखरखाव रिमाइंडर नहीं है। उपकरण की जांच करने पर स्वतः टिप्स मिलेंगे!',

    // Confidence meter
    overallConfidence: 'विश्लेषण की विश्वसनीयता',
    lowConfidenceTip: 'क्लिप थोड़ी अस्पष्ट थी। अधिक सटीक निदान के लिए शांत कमरे में रोशनी के साथ 10-20 सेकंड की साफ़ क्लिप बनाएं।',
    retakeTip: 'अधिक स्पष्ट क्लिप रिकॉर्ड करें',

    // Tips modal
    tipsModalTitle: 'सटीक निदान के लिए वीडियो कैसे बनाएं',
    tip1Title: 'स्पष्ट आवाज़ रिकॉर्ड करें',
    tip1Desc: 'खराबी वाले पुर्जे से 1-2 फीट की दूरी रखें। कमरे का शोर या टीवी बंद रखें।',
    tip2Title: 'कंपन और गति दिखाएं',
    tip2Desc: 'उपकरण चलते समय कैमरे को 10-20 सेकंड स्थिर पकड़ें।',
    tip3Title: 'मॉडल और ब्रांड प्लेट दिखाएं',
    tip3Desc: 'उपकरण पर लगे ब्रांड स्टीकर या मॉडल नंबर पर कुछ सेकंड कैमरा ले जाएं।',
    tip4Title: 'बिजली के नंगे तारों को न छुएं',
    tip4Desc: 'वीडियो के लिए कभी भी खतरनाक बिजली के कवर या गैस पाइप न खोलें।'
  }
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en;
}

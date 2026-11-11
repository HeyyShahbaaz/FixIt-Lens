import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  UploadCloud,
  StopCircle,
  Play,
  RotateCcw,
  Sparkles,
  Mic,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Volume2,
  Info
} from 'lucide-react';
import { Language } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';
import { startVoiceInput } from '../utils/audioVoice';

interface Props {
  language: Language;
  onAnalyze: (payload: {
    videoBase64?: string;
    mimeType?: string;
    appliance: string;
    modelNumber: string;
    extraNotes: string;
    videoDurationSec?: number;
    videoThumbnail?: string;
  }) => void;
  isLoading: boolean;
  loadingMessage: string;
  errorMessage: string | null;
  onClearError: () => void;
}

const SAMPLE_CLIPS = [
  {
    id: 'sample-tap',
    titleKey: 'sampleTap',
    appliance: 'Tap / Plumbing / Pump',
    model: 'Jaquar Brass Quarter-Turn Bib Cock',
    notes: 'Continuous water drip and violent pipe shudder/water hammer',
    icon: '🚰'
  },
  {
    id: 'sample-fan',
    titleKey: 'sampleFan',
    appliance: 'Ceiling / Table Fan',
    model: 'Havells Festiva 1200mm',
    notes: 'Wobbles at speed 4 and 5 with rhythmic ticking noise',
    icon: '🌀'
  },
  {
    id: 'sample-washer',
    titleKey: 'sampleWasher',
    appliance: 'Washing Machine',
    model: 'LG Inverter 7.0kg Front Load',
    notes: 'Violent thumping and shaking during spin extraction',
    icon: '🧺'
  },
  {
    id: 'sample-chain',
    titleKey: 'sampleChain',
    appliance: 'Bicycle / Motorbike',
    model: 'Hero Sprint 21-Speed Cycle',
    notes: 'Harsh metallic grinding and chain slipping on derailleur',
    icon: '🚲'
  }
];

export const CaptureSection: React.FC<Props> = ({
  language,
  onAnalyze,
  isLoading,
  loadingMessage,
  errorMessage,
  onClearError
}) => {
  const t = getTranslation(language);

  // Form states - defaulted to Tap / Plumbing so tap leakage works right out of the box
  const [appliance, setAppliance] = useState<string>('Tap / Plumbing / Pump');
  const [modelNumber, setModelNumber] = useState<string>('');
  const [extraNotes, setExtraNotes] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [autoDetectedBadge, setAutoDetectedBadge] = useState<string | null>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('video/webm');
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Start Camera & Microphone Recording (up to 20 seconds)
  const startRecording = async () => {
    onClearError();
    setCameraPermissionError(null);
    setSelectedSampleId(null);
    setRecordedVideoUrl(null);
    setRecordedBase64(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      streamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(console.warn);
      }

      // Check supported MIME type
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      const chosenMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';
      setRecordedMimeType(chosenMime);

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: chosenMime });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stopCameraStream();
        const blob = new Blob(recordedChunksRef.current, { type: chosenMime });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // 1-second chunks
      setIsRecording(true);
      setRecordingSeconds(0);

      // 20-second countdown timer
      let elapsed = 0;
      timerIntervalRef.current = window.setInterval(() => {
        elapsed += 1;
        setRecordingSeconds(elapsed);
        if (elapsed >= 20) {
          stopRecording();
        }
      }, 1000);
    } catch (err: unknown) {
      console.error('Camera/Mic permission failed:', err);
      setCameraPermissionError(
        'Could not access camera/microphone. Please allow camera and mic permissions in your browser or upload a saved video clip below.'
      );
      stopCameraStream();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopCameraStream();
    setIsRecording(false);
  };

  const resetRecording = () => {
    stopCameraStream();
    setIsRecording(false);
    setRecordedVideoUrl(null);
    setRecordedBase64(null);
    setSelectedSampleId(null);
    setRecordingSeconds(0);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB. Please select a shorter 10-20s video clip.');
      return;
    }

    onClearError();
    setSelectedSampleId(null);
    const mime = file.type || 'video/mp4';
    setRecordedMimeType(mime);

    const url = URL.createObjectURL(file);
    setRecordedVideoUrl(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecordedBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Select Sample Breakdown Clip
  const handleSelectSample = (sample: (typeof SAMPLE_CLIPS)[0]) => {
    onClearError();
    resetRecording();
    setSelectedSampleId(sample.id);
    setAppliance(sample.appliance);
    setModelNumber(sample.model);
    setExtraNotes(sample.notes);
  };

  // Real-time intelligent appliance detection based on notes and model text
  const detectApplianceFromText = (text: string) => {
    const lower = text.toLowerCase();
    if (
      lower.includes('tap') ||
      lower.includes('leak') ||
      lower.includes('drip') ||
      lower.includes('faucet') ||
      lower.includes('plumb') ||
      lower.includes('water') ||
      lower.includes('washbasin') ||
      lower.includes('sink') ||
      lower.includes('नल') ||
      lower.includes('पानी') ||
      lower.includes('रिसाव') ||
      lower.includes('टपक')
    ) {
      setAppliance('Tap / Plumbing / Pump');
      setAutoDetectedBadge('🚰 Tap / Plumbing');
    } else if (
      lower.includes('wash') ||
      lower.includes('washer') ||
      lower.includes('drum') ||
      lower.includes('वाशिंग') ||
      lower.includes('वॉशिंग')
    ) {
      setAppliance('Washing Machine');
      setAutoDetectedBadge('🧺 Washing Machine');
    } else if (
      lower.includes('fan') ||
      lower.includes('blade') ||
      lower.includes('wobble') ||
      lower.includes('ceiling') ||
      lower.includes('पंखा') ||
      lower.includes('ब्लेड')
    ) {
      setAppliance('Ceiling / Table Fan');
      setAutoDetectedBadge('🌀 Ceiling Fan');
    } else if (
      lower.includes('fridge') ||
      lower.includes('refrigerator') ||
      lower.includes('freezer') ||
      lower.includes('फ्रिज')
    ) {
      setAppliance('Refrigerator');
      setAutoDetectedBadge('❄️ Refrigerator');
    } else if (
      lower.includes('bike') ||
      lower.includes('cycle') ||
      lower.includes('chain') ||
      lower.includes('साइकिल') ||
      lower.includes('चेन')
    ) {
      setAppliance('Bicycle / Motorbike');
      setAutoDetectedBadge('🚲 Bicycle / Bike');
    } else if (
      lower.includes('ac') ||
      lower.includes('air conditioner') ||
      lower.includes('एसी')
    ) {
      setAppliance('Air Conditioner');
      setAutoDetectedBadge('❄️ Air Conditioner');
    }
  };

  // Voice note dictation
  const handleVoiceDictation = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    setIsVoiceListening(true);
    startVoiceInput(
      language,
      (transcript) => {
        setExtraNotes((prev) => {
          const updated = prev ? `${prev} ${transcript}` : transcript;
          detectApplianceFromText(`${modelNumber} ${updated}`);
          return updated;
        });
        setIsVoiceListening(false);
      },
      (error) => {
        console.warn('Voice error:', error);
        setIsVoiceListening(false);
      },
      () => {
        setIsVoiceListening(false);
      }
    );
  };

  // Submit diagnosis
  const handleSubmit = () => {
    if (!recordedBase64 && !selectedSampleId) {
      alert('Please record a clip, upload a video, or select a sample scenario first.');
      return;
    }

    onAnalyze({
      videoBase64: recordedBase64 || undefined,
      mimeType: recordedMimeType,
      appliance,
      modelNumber,
      extraNotes,
      videoDurationSec: recordingSeconds > 0 ? recordingSeconds : 15,
      videoThumbnail: undefined
    });
  };

  return (
    <section className="space-y-6">
      {/* Intro hero card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 sm:p-6 text-stone-800 dark:text-stone-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>{t.startDiagnosis}</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
              Record a 10-20s video with sound. Gemini analyzes motor hums, rattles, visual vibrations, and leaks together to diagnose the breakdown.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm shrink-0">
            <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>Dual Multimodal Audio + Video</span>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Analysis Notice</p>
            <p className="text-xs mt-0.5 opacity-90">{errorMessage}</p>
          </div>
          <button
            onClick={onClearError}
            className="text-xs font-semibold hover:underline px-2 py-1 text-red-600 dark:text-red-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {cameraPermissionError && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-800 dark:text-amber-200 flex items-start gap-3 text-xs sm:text-sm">
          <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p>{cameraPermissionError}</p>
        </div>
      )}

      {/* Recording & Upload Stage */}
      <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        {/* Live Camera View or Video Preview */}
        {(isRecording || recordedVideoUrl) && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-80 mx-auto border-2 border-stone-300 dark:border-stone-700 shadow-inner flex items-center justify-center">
            {isRecording ? (
              <>
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>REC ({recordingSeconds}s / 20s)</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-300"
                      style={{ width: `${(recordingSeconds / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <video
                src={recordedVideoUrl!}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            )}
          </div>
        )}

        {/* Action Buttons: Record, Stop, Upload */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            >
              <StopCircle className="w-5 h-5" />
              <span>{t.stopRecording} ({20 - recordingSeconds}s {t.recordingRemaining})</span>
            </button>
          ) : (
            <>
              <button
                onClick={startRecording}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
              >
                <Video className="w-5 h-5" />
                <span>{recordedVideoUrl ? t.retakeVideo : t.recordVideo}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-semibold text-sm border border-stone-300 dark:border-stone-600 transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>{t.uploadVideo}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {recordedVideoUrl && (
                <button
                  onClick={resetRecording}
                  className="p-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                  title="Clear recording"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Instant Test Sample Breakdown Clips */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-700/60">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2.5">
            {t.orTrySample}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_CLIPS.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              const titleText = (t as unknown as Record<string, string>)[sample.titleKey] || sample.appliance;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 text-stone-900 dark:text-stone-100'
                      : 'border-stone-200 dark:border-stone-700/80 hover:border-amber-400 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-base mb-1">
                      <span>{sample.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <p className="font-semibold text-xs line-clamp-1">{titleText}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                      {sample.notes}
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-2">
                    {sample.model}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Appliance metadata fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200 dark:border-stone-700/60">
          {/* Appliance Category with quick pills */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                {t.applianceCategory}
              </label>
              {autoDetectedBadge && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>✨ Auto-detected:</span>
                  <span className="font-bold">{autoDetectedBadge}</span>
                </span>
              )}
            </div>

            {/* Quick 1-tap category pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                { label: '🚰 Tap / Plumbing', val: 'Tap / Plumbing / Pump' },
                { label: '🌀 Ceiling Fan', val: 'Ceiling / Table Fan' },
                { label: '🧺 Washing Machine', val: 'Washing Machine' },
                { label: '❄️ Refrigerator', val: 'Refrigerator' },
                { label: '🚲 Bicycle / Bike', val: 'Bicycle / Motorbike' },
                { label: '❄️ Air Conditioner', val: 'Air Conditioner' },
                { label: '⚡ Water Heater / Geyser', val: 'Water Heater / Geyser' },
                { label: '🔍 Auto-detect', val: 'Other / Auto-detect' }
              ].map((pill) => {
                const isActive = appliance === pill.val;
                return (
                  <button
                    key={pill.val}
                    type="button"
                    onClick={() => {
                      setAppliance(pill.val);
                      setAutoDetectedBadge(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isActive
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <select
              value={appliance}
              onChange={(e) => {
                setAppliance(e.target.value);
                setAutoDetectedBadge(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Tap / Plumbing / Pump">🚰 {t.catPlumbing}</option>
              <option value="Ceiling / Table Fan">🌀 {t.catFan}</option>
              <option value="Washing Machine">🧺 {t.catWashingMachine}</option>
              <option value="Refrigerator">❄️ {t.catFridge}</option>
              <option value="Air Conditioner">❄️ {t.catAC}</option>
              <option value="Bicycle / Motorbike">🚲 {t.catBike}</option>
              <option value="Microwave Oven">📻 {t.catMicrowave}</option>
              <option value="Water Heater / Geyser">⚡ {t.catGeyser}</option>
              <option value="Other / Auto-detect">🔍 {t.catOther}</option>
            </select>
          </div>

          {/* Model Number */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Model Number / Brand (Optional)
            </label>
            <input
              type="text"
              value={modelNumber}
              onChange={(e) => {
                const val = e.target.value;
                setModelNumber(val);
                detectApplianceFromText(`${val} ${extraNotes}`);
              }}
              placeholder={t.modelNumberPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Extra Notes with Web Speech API voice input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Extra Observations / Sounds
              </label>
              <button
                type="button"
                onClick={handleVoiceDictation}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isVoiceListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isVoiceListening ? t.listening : t.voiceInputPrompt}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={extraNotes}
              onChange={(e) => {
                const val = e.target.value;
                setExtraNotes(val);
                detectApplianceFromText(`${modelNumber} ${val}`);
              }}
              placeholder={t.extraNotesPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Submit Button & Loading Indicator */}
        <div className="pt-2">
          {isLoading ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{loadingMessage}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Analyzing visual frames and audio spectrograms...
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!recordedBase64 && !selectedSampleId}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-extrabold text-base shadow-lg shadow-amber-600/25 transition-all transform active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Wrench className="w-5 h-5" />
              <span>{t.useClip}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

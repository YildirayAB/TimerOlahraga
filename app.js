// ========== AUDIO ENGINE ==========
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let alarmIntervalId = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

/** Play a short "ding" beep */
function playBeep(freq = 880, duration = 0.15, vol = 0.5, type = 'sine', delay = 0) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}

/** Play a 3-tone transition beep (phase change) */
function playTransitionBeep() {
  playBeep(523, 0.12, 0.5, 'sine', 0.0);
  playBeep(659, 0.12, 0.5, 'sine', 0.13);
  playBeep(784, 0.20, 0.6, 'sine', 0.26);
}

/** Play a countdown tick (last 3 seconds) */
function playTick() {
  playBeep(440, 0.08, 0.3, 'square', 0);
}

/** Start looping alarm sound */
function startAlarmSound() {
  stopAlarmSound(); // clear any existing
  function playAlarmCycle() {
    // Siren-like up-down sweep
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.5);
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.0);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.1);
  }
  playAlarmCycle();
  alarmIntervalId = setInterval(playAlarmCycle, 1200);
}

/** Stop looping alarm sound */
function stopAlarmSound() {
  if (alarmIntervalId !== null) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

// ========== STATE ==========
let mainTotalSec   = 0;  // total main timer in seconds
let mainRemainSec  = 0;  // remaining main timer seconds
let exerciseTotalSec = 0;
let restTotalSec   = 0;

let subRemainSec   = 0;  // remaining current sub-timer seconds
let subTotalSec    = 0;  // total of current sub-timer seconds
let phase          = 'exercise'; // 'exercise' | 'rest'
let setNumber      = 1;
let totalSets      = 0;

let paused         = false;
let running        = false;
let mainIntervalId = null;

// ========== DOM REFS ==========
const settingsPanel       = document.getElementById('settings-panel');
const timerPanel          = document.getElementById('timer-panel');
const mainDisplay         = document.getElementById('main-timer-display');
const mainProgress        = document.getElementById('main-progress');
const exerciseDisplay     = document.getElementById('exercise-timer-display');
const exerciseProgress    = document.getElementById('exercise-progress');
const restDisplay         = document.getElementById('rest-timer-display');
const restProgress        = document.getElementById('rest-progress');
const phaseText           = document.getElementById('phase-text');
const phaseIcon           = document.getElementById('phase-icon');
const exerciseCard        = document.getElementById('exercise-card');
const restCard            = document.getElementById('rest-card');
const pauseBtn            = document.getElementById('pause-btn');
const setNumberEl         = document.getElementById('set-number');
const totalSetsEl         = document.getElementById('total-sets');
const alarmOverlay        = document.getElementById('alarm-overlay');

// ========== HELPERS ==========
function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateMainDisplay() {
  mainDisplay.textContent = fmtTime(mainRemainSec);
  const pct = mainTotalSec > 0 ? (mainRemainSec / mainTotalSec) * 100 : 0;
  mainProgress.style.width = pct + '%';
}

function updateSubDisplay() {
  exerciseDisplay.textContent = fmtTime(phase === 'exercise' ? subRemainSec : 0);
  restDisplay.textContent     = fmtTime(phase === 'rest'     ? subRemainSec : 0);

  if (phase === 'exercise') {
    const pct = exerciseTotalSec > 0 ? ((exerciseTotalSec - subRemainSec) / exerciseTotalSec) * 100 : 0;
    exerciseProgress.style.width = pct + '%';
    restProgress.style.width = '0%';
    restDisplay.textContent = fmtTime(restTotalSec);
  } else {
    const pct = restTotalSec > 0 ? ((restTotalSec - subRemainSec) / restTotalSec) * 100 : 0;
    restProgress.style.width = pct + '%';
    exerciseProgress.style.width = '100%';
    exerciseDisplay.textContent = fmtTime(exerciseTotalSec);
  }
}

function updatePhaseUI() {
  if (phase === 'exercise') {
    exerciseCard.classList.add('active-phase');
    restCard.classList.remove('active-phase');
    phaseIcon.textContent = '🏋️';
    phaseText.textContent = 'Fase: Olahraga';
  } else {
    restCard.classList.add('active-phase');
    exerciseCard.classList.remove('active-phase');
    phaseIcon.textContent = '😴';
    phaseText.textContent = 'Fase: Istirahat';
  }
  setNumberEl.textContent = setNumber;
  totalSetsEl.textContent = totalSets > 0 ? totalSets : '~';
}

// ========== MAIN LOGIC ==========
function startSession() {
  const mainMin  = parseInt(document.getElementById('main-minutes').value)   || 30;
  const exMin    = parseInt(document.getElementById('exercise-minutes').value) || 0;
  const exSec    = parseInt(document.getElementById('exercise-seconds').value) || 0;
  const restMin  = parseInt(document.getElementById('rest-minutes').value)    || 0;
  const restSec  = parseInt(document.getElementById('rest-seconds').value)    || 0;

  exerciseTotalSec = exMin * 60 + exSec;
  restTotalSec     = restMin * 60 + restSec;
  mainTotalSec     = mainMin * 60;
  mainRemainSec    = mainTotalSec;

  if (exerciseTotalSec === 0) { alert('Waktu olahraga harus lebih dari 0!'); return; }
  if (restTotalSec === 0)     { alert('Waktu istirahat harus lebih dari 0!'); return; }

  const cycleLen = exerciseTotalSec + restTotalSec;
  totalSets = Math.floor(mainTotalSec / cycleLen);

  phase      = 'exercise';
  setNumber  = 1;
  subRemainSec = exerciseTotalSec;
  subTotalSec  = exerciseTotalSec;
  paused     = false;
  running    = true;

  // Wake AudioContext on user gesture
  getAudioCtx().resume();

  settingsPanel.classList.add('hidden');
  timerPanel.classList.remove('hidden');

  updateMainDisplay();
  updateSubDisplay();
  updatePhaseUI();

  clearInterval(mainIntervalId);
  mainIntervalId = setInterval(tick, 1000);
}

function tick() {
  if (paused || !running) return;

  // Countdown ticks for last 3s of sub-timer
  if (subRemainSec <= 3 && subRemainSec > 0) playTick();

  mainRemainSec--;
  subRemainSec--;

  updateMainDisplay();
  updateSubDisplay();

  // Main timer done
  if (mainRemainSec <= 0) {
    mainRemainSec = 0;
    updateMainDisplay();
    clearInterval(mainIntervalId);
    running = false;
    triggerAlarm();
    return;
  }

  // Sub-timer done → switch phase
  if (subRemainSec <= 0) {
    if (phase === 'exercise') {
      phase = 'rest';
      subRemainSec = restTotalSec;
      subTotalSec  = restTotalSec;
      playTransitionBeep();
    } else {
      phase = 'exercise';
      subRemainSec = exerciseTotalSec;
      subTotalSec  = exerciseTotalSec;
      setNumber++;
      playTransitionBeep();
    }
    updatePhaseUI();
    updateSubDisplay();
  }
}

function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? '▶ Lanjutkan' : '⏸ Jeda';
}

function resetSession() {
  clearInterval(mainIntervalId);
  stopAlarmSound();
  running = false;
  paused  = false;
  timerPanel.classList.add('hidden');
  settingsPanel.classList.remove('hidden');
  alarmOverlay.classList.add('hidden');
  // reset displays
  mainDisplay.textContent     = '00:00';
  exerciseDisplay.textContent = '00:00';
  restDisplay.textContent     = '00:00';
  mainProgress.style.width    = '100%';
  exerciseProgress.style.width = '0%';
  restProgress.style.width    = '0%';
  pauseBtn.textContent = '⏸ Jeda';
}

function triggerAlarm() {
  startAlarmSound();
  alarmOverlay.classList.remove('hidden');
}

function stopAlarm() {
  stopAlarmSound();
  alarmOverlay.classList.add('hidden');
}

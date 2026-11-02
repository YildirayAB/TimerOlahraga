// ========== AUDIO ENGINE ==========
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let alarmIntervalId = null;
let alarmTimeoutId  = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

/**
 * Low-level: play a single oscillator note.
 * @param {number} freq        - frequency in Hz
 * @param {number} duration    - duration in seconds
 * @param {number} vol         - peak volume (0–1)
 * @param {string} type        - OscillatorType ('sine'|'square'|'sawtooth'|'triangle')
 * @param {number} delay       - start offset from now in seconds
 * @param {number} [freqEnd]   - if set, sweep frequency to this value over duration
 * @param {number} [attackTime]- seconds to reach peak volume (default 0.01)
 */
function playNote(freq, duration, vol, type, delay, freqEnd, attackTime = 0.01) {
  const ctx = getAudioCtx();
  const t   = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, t + duration);
  }
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + attackTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// ------------------------------------------------------------------
// 🏁  MAIN TIMER DONE — Victory / "Perjuangan hari ini selesai!"
//     Triumphant ascending fanfare: C → E → G → C (major chord arpeggiated),
//     lalu diakhiri held chord dengan vibrato shimmer.
// ------------------------------------------------------------------
function playVictoryFanfare() {
  // === Arpeggiated fanfare notes ===
  // C5 – E5 – G5 – C6 (naik dramatis)
  playNote(523,  0.18, 0.55, 'sine',     0.00);
  playNote(659,  0.18, 0.55, 'sine',     0.20);
  playNote(784,  0.18, 0.55, 'sine',     0.40);
  playNote(1047, 0.40, 0.65, 'sine',     0.60);

  // === Held triumphant chord (C5+E5+G5 together) ===
  playNote(523,  0.90, 0.30, 'sine',     1.10);
  playNote(659,  0.90, 0.30, 'sine',     1.10);
  playNote(784,  0.90, 0.35, 'sine',     1.10);

  // === Sub-bass thud untuk feel "epic finish" ===
  playNote(65,   0.25, 0.40, 'triangle', 0.60);
  playNote(65,   0.18, 0.30, 'triangle', 1.10);

  // === Shimmer high overtone ===
  playNote(2093, 0.60, 0.12, 'sine',     1.10);
}

// ------------------------------------------------------------------
// 😴  EXERCISE SET DONE → REST — "Napas dulu, istirahat sebentar"
//     Nada turun lembut, airy & smooth — kayak lega setelah berjuang.
// ------------------------------------------------------------------
function playRestTransition() {
  // Descending gentle tones: G5 → E5 → C5
  playNote(784,  0.28, 0.42, 'sine',     0.00);
  playNote(659,  0.28, 0.38, 'sine',     0.32);
  playNote(523,  0.55, 0.35, 'sine',     0.64);

  // Soft airy shimmer chord (high, quiet)
  playNote(1047, 0.70, 0.10, 'sine',     0.64);
  playNote(1319, 0.70, 0.07, 'sine',     0.64);

  // Gentle "exhale" low pad
  playNote(130,  0.80, 0.15, 'triangle', 0.64);
}

// ------------------------------------------------------------------
// 💪  REST SET DONE → EXERCISE — "Ayo bangkit, waktunya berjuang lagi!"
//     Nada naik energetik, punchy, kayak "LET'S GO!"
// ------------------------------------------------------------------
function playFightTransition() {
  // Punchy bass hit dulu
  playNote(98,   0.12, 0.50, 'sawtooth', 0.00);

  // Rapid ascending stabs: C4 → G4 → C5 → E5 → G5
  playNote(262,  0.10, 0.50, 'square',   0.15);
  playNote(392,  0.10, 0.55, 'square',   0.27);
  playNote(523,  0.12, 0.60, 'square',   0.39);
  playNote(659,  0.12, 0.60, 'square',   0.51);
  playNote(784,  0.30, 0.65, 'square',   0.63);

  // Final power chord hold (G4+C5+E5)
  playNote(392,  0.55, 0.28, 'sine',     0.93);
  playNote(523,  0.55, 0.28, 'sine',     0.93);
  playNote(659,  0.55, 0.30, 'sine',     0.93);

  // Punchy bass end hit
  playNote(98,   0.18, 0.45, 'triangle', 0.93);
}

// ------------------------------------------------------------------
// ⏱  COUNTDOWN TICK — last 3 seconds of any sub-timer
// ------------------------------------------------------------------
function playTick() {
  playNote(880, 0.06, 0.25, 'square', 0);
}

// ------------------------------------------------------------------
// 🚨  MAIN ALARM — loops until dismissed (Victory fanfare plays first,
//     then a looping triumphant pulse keeps reminding)
// ------------------------------------------------------------------
function startAlarmSound() {
  stopAlarmSound();

  // Play full victory fanfare first
  playVictoryFanfare();

  // After fanfare (~2.2s), start looping reminder pulse
  alarmTimeoutId = setTimeout(() => {
    function loopCycle() {
      // Triumphant rising 2-note pulse
      playNote(784,  0.20, 0.45, 'sine', 0.00);
      playNote(1047, 0.30, 0.50, 'sine', 0.22);

      // Bass thud
      playNote(65, 0.18, 0.35, 'triangle', 0.00);
    }
    loopCycle();
    alarmIntervalId = setInterval(loopCycle, 1400);
  }, 2300);
}

/** Stop looping alarm sound */
function stopAlarmSound() {
  if (alarmTimeoutId !== null) {
    clearTimeout(alarmTimeoutId);
    alarmTimeoutId = null;
  }
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
      // Exercise set selesai → masuk istirahat
      phase = 'rest';
      subRemainSec = restTotalSec;
      subTotalSec  = restTotalSec;
      playRestTransition();       // 😴 Suara: "napas dulu, istirahat"
    } else {
      // Istirahat selesai → balik olahraga
      phase = 'exercise';
      subRemainSec = exerciseTotalSec;
      subTotalSec  = exerciseTotalSec;
      setNumber++;
      playFightTransition();      // 💪 Suara: "ayo bangkit, berjuang lagi!"
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

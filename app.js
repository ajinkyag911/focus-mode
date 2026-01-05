/**
 * ============================================
 * FOCUS MODE - MAIN APPLICATION
 * ============================================
 * Components:
 * - Timer (top center)
 * - Noise Meter (top left) 
 * - Analog Clock (top right)
 * - Bottom Bar (2 rows)
 * - Robot with speech bubble (center)
 * - 6 Themed backgrounds
 */

// ========== CONFIGURATION ========== //
const CONFIG = {
    defaultMinutes: 5,
    noiseSensitivity: 0.2,
    gaugeScale: 3.5,
    speechBubbleDuration: 3000,
    alertCooldown: 5000
};

// Theme backgrounds (Unsplash - open source)
const THEMES = {
    space: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1920&q=80',
    dinosaur: 'https://images.unsplash.com/photo-1606856110002-d0991ce78250?w=1920&q=80',
    dance: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80',
    egypt: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1920&q=80',
    wizard: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80',
    minecraft: 'https://static.toiimg.com/thumb/msid-121156431,width-1280,height-720,resizemode-4/121156431.jpg'
};

// Random messages for noise alerts
const QUIET_MESSAGES = [
    "Whisper time!", "Let's use quiet voices!", "Oops, a bit loud!",
    "Soft voices please!", "Time to hush!", "Shhh, quiet time!",
    "Let's be mice!", "Indoor voices!", "Quieter please!",
    "Gentle voices!", "Library mode!", "Hush now!",
    "Too loud, friends!", "Can we whisper?", "Quiet zone!", "Softer please!"
];

// Friendly emojis
const FACE_EMOJIS = [
    "🤫", "🙊", "😊", "🐭", "📚", "💤", "🌙", "🤐",
    "😇", "🙂", "🐰", "🦉", "🧘", "☁️", "🌸", "🍃"
];

// ========== DOM ELEMENTS ========== //
// Timer
const timerDisplay = document.getElementById('timerDisplay');
const timerInputContainer = document.getElementById('timerInputContainer');
const minutesInput = document.getElementById('minutesInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Robot
const robotWrapper = document.getElementById('robotWrapper');
const speechBubble = document.getElementById('speechBubble');
const speechText = document.getElementById('speechText');

// Noise Meter
const noiseMeterContainer = document.getElementById('noiseMeterContainer');
const micBtn = document.getElementById('micBtn');
const gaugeFill = document.getElementById('gaugeFill');
const gaugeNeedle = document.getElementById('gaugeNeedle');
const gaugeThreshold = document.getElementById('gaugeThreshold');
const gaugeThresholdLabel = document.getElementById('gaugeThresholdLabel');
const noiseCounter = document.getElementById('noiseCounter');
const sensitivitySlider = document.getElementById('sensitivitySlider');
const sensitivityValue = document.getElementById('sensitivityValue');

// Clock
const clockContainer = document.getElementById('clockContainer');
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const digitalTime = document.getElementById('digitalTime');

// Audio
const audioPlayBtn = document.getElementById('audioPlayBtn');
const audioPlayIcon = document.getElementById('audioPlayIcon');
const radioChannel = document.getElementById('radioChannel');
const audioPlayer = document.getElementById('audioPlayer');

// Bottom bar toggles
const themeSelect = document.getElementById('themeSelect');
const robotToggleBtn = document.getElementById('robotToggleBtn');
const noiseMeterToggleBtn = document.getElementById('noiseMeterToggleBtn');
const clockToggleBtn = document.getElementById('clockToggleBtn');

// ========== STATE ========== //
let timerState = {
    totalSeconds: CONFIG.defaultMinutes * 60,
    isRunning: false,
    intervalId: null
};

let audioState = {
    isListening: false,
    audioContext: null,
    analyser: null,
    mediaStream: null,
    lastAlertTime: 0,
    alertCount: 0
};

let musicState = {
    isPlaying: false
};

let componentVisibility = {
    robot: true,
    noiseMeter: true,
    clock: true
};

// ========== INITIALIZATION ========== //
function init() {
    loadPreferences();
    updateTimerDisplay();
    setupEventListeners();
    startClock();
    addGaugeGradient();
    updateToggleButtons();
    console.log('🤖 Focus Mode initialized!');
}

function loadPreferences() {
    // Theme
    const savedTheme = localStorage.getItem('focusMode_theme') || 'space';
    setTheme(savedTheme);
    themeSelect.value = savedTheme;
    
    // Robot visibility
    if (localStorage.getItem('focusMode_robotHidden') === 'true') {
        componentVisibility.robot = false;
        document.body.classList.add('robot-hidden');
    }
    
    // Noise meter visibility
    if (localStorage.getItem('focusMode_noiseMeterHidden') === 'true') {
        componentVisibility.noiseMeter = false;
        noiseMeterContainer.classList.add('hidden');
    }
    
    // Clock visibility
    if (localStorage.getItem('focusMode_clockHidden') === 'true') {
        componentVisibility.clock = false;
        clockContainer.classList.add('hidden');
    }
    
    // Noise sensitivity
    const savedSensitivity = localStorage.getItem('focusMode_sensitivity');
    if (savedSensitivity) {
        const sensitivityPercent = parseInt(savedSensitivity);
        sensitivitySlider.value = sensitivityPercent;
        sensitivityValue.textContent = sensitivityPercent;
        updateSensitivity(sensitivityPercent);
    } else {
        updateSensitivity(70);
    }
    
    // Timer duration
    minutesInput.value = CONFIG.defaultMinutes;
    timerState.totalSeconds = CONFIG.defaultMinutes * 60;
    
    // Saved radio channel
    const savedChannel = localStorage.getItem('focusMode_radioChannel');
    if (savedChannel) {
        radioChannel.value = savedChannel;
    }
}

function savePreference(key, value) {
    localStorage.setItem(`focusMode_${key}`, value);
}

function addGaugeGradient() {
    const svg = document.querySelector('.gauge');
    if (!svg) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#4CAF50"/>
            <stop offset="50%" style="stop-color:#FFC107"/>
            <stop offset="100%" style="stop-color:#F44336"/>
        </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
    gaugeFill.style.stroke = 'url(#gaugeGradient)';
}

// ========== EVENT LISTENERS ========== //
function setupEventListeners() {
    // Timer
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    minutesInput.addEventListener('change', () => {
        const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
        timerState.totalSeconds = minutes * 60;
        updateTimerDisplay();
        savePreference('minutes', minutes);
    });
    
    // Noise meter
    micBtn.addEventListener('click', toggleMicrophone);
    sensitivitySlider.addEventListener('input', () => {
        const percent = parseInt(sensitivitySlider.value);
        sensitivityValue.textContent = percent;
        updateSensitivity(percent);
        savePreference('sensitivity', percent);
    });
    
    // Audio
    audioPlayBtn.addEventListener('click', toggleMusic);
    radioChannel.addEventListener('change', () => {
        if (musicState.isPlaying) {
            playMusic();
        }
    });
    
    // Theme
    themeSelect.addEventListener('change', () => {
        const theme = themeSelect.value;
        setTheme(theme);
        savePreference('theme', theme);
    });
    
    // Component toggles
    robotToggleBtn.addEventListener('click', toggleRobot);
    noiseMeterToggleBtn.addEventListener('click', toggleNoiseMeter);
    clockToggleBtn.addEventListener('click', toggleClock);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    switch(e.key.toLowerCase()) {
        case ' ':
            e.preventDefault();
            timerState.isRunning ? pauseTimer() : startTimer();
            break;
        case 'r': resetTimer(); break;
        case 'm': toggleMicrophone(); break;
    }
}

// ========== THEME ========== //
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
}

// ========== TIMER ========== //
function startTimer() {
    if (timerState.isRunning) return;
    
    if (!timerState.intervalId) {
        const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
        timerState.totalSeconds = minutes * 60;
    }
    
    timerState.isRunning = true;
    timerInputContainer.classList.add('hidden');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    robotWrapper.classList.add('studying');
    
    timerState.intervalId = setInterval(() => {
        timerState.totalSeconds--;
        updateTimerDisplay();
        if (timerState.totalSeconds <= 0) timerComplete();
    }, 1000);
}

function pauseTimer() {
    if (!timerState.isRunning) return;
    timerState.isRunning = false;
    clearInterval(timerState.intervalId);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    robotWrapper.classList.remove('studying');
}

function resetTimer() {
    pauseTimer();
    timerState.intervalId = null;
    const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
    timerState.totalSeconds = minutes * 60;
    updateTimerDisplay();
    timerInputContainer.classList.remove('hidden');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function timerComplete() {
    pauseTimer();
    showSpeechBubble("Time's up! 🎉");
    
    robotWrapper.classList.add('celebrate');
    setTimeout(() => robotWrapper.classList.remove('celebrate'), 800);
    
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => osc.stop(), 500);
    } catch (e) {}
}

function updateTimerDisplay() {
    const mins = Math.floor(timerState.totalSeconds / 60);
    const secs = timerState.totalSeconds % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ========== ANALOG CLOCK ========== //
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const hourDeg = (hours * 30) + (minutes * 0.5);
    const minDeg = minutes * 6;
    const secDeg = seconds * 6;
    
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
    
    const hours24 = now.getHours();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    digitalTime.textContent = `${hours12}:${m} ${ampm}`;
}

// ========== NOISE DETECTION ========== //
async function toggleMicrophone() {
    if (audioState.isListening) {
        stopListening();
    } else {
        await startListening();
    }
}

async function startListening() {
    try {
        audioState.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioState.analyser = audioState.audioContext.createAnalyser();
        
        const source = audioState.audioContext.createMediaStreamSource(audioState.mediaStream);
        source.connect(audioState.analyser);
        
        audioState.analyser.fftSize = 256;
        audioState.analyser.smoothingTimeConstant = 0.8;
        audioState.isListening = true;
        
        micBtn.classList.add('active');
        analyzeAudio();
    } catch (error) {
        alert('Microphone access needed for noise detection.');
    }
}

function stopListening() {
    audioState.isListening = false;
    
    if (audioState.mediaStream) {
        audioState.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioState.audioContext) {
        audioState.audioContext.close();
    }
    
    micBtn.classList.remove('active');
    updateGauge(0);
}

function analyzeAudio() {
    if (!audioState.isListening) return;
    
    const dataArray = new Uint8Array(audioState.analyser.frequencyBinCount);
    audioState.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedVolume = average / 255;
    
    const volumePercent = Math.min(100, normalizedVolume * 200);
    updateGauge(volumePercent);
    
    if (volumePercent > parseInt(sensitivitySlider.value)) {
        const now = Date.now();
        if (now - audioState.lastAlertTime > CONFIG.alertCooldown) {
            triggerNoiseAlert();
            audioState.lastAlertTime = now;
        }
    }
    
    requestAnimationFrame(analyzeAudio);
}

function updateGauge(percent) {
    const maxDash = 126;
    const offset = maxDash - (percent / 100) * maxDash;
    gaugeFill.style.strokeDashoffset = offset;
    
    const angle = -90 + (percent / 100) * 180;
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;
}

function updateSensitivity(percent) {
    const angle = -90 + (percent / 100) * 180;
    gaugeThreshold.setAttribute('transform', `rotate(${angle}, 50, 50)`);
    
    const labelAngle = (angle - 90) * Math.PI / 180;
    const labelRadius = 42;
    const labelX = 50 + Math.cos(labelAngle) * labelRadius;
    const labelY = 50 + Math.sin(labelAngle) * labelRadius;
    gaugeThresholdLabel.setAttribute('x', labelX);
    gaugeThresholdLabel.setAttribute('y', labelY);
    gaugeThresholdLabel.textContent = `${percent}%`;
}

function triggerNoiseAlert() {
    const message = QUIET_MESSAGES[Math.floor(Math.random() * QUIET_MESSAGES.length)];
    const emoji = FACE_EMOJIS[Math.floor(Math.random() * FACE_EMOJIS.length)];
    showSpeechBubble(`${message} ${emoji}`);
    
    audioState.alertCount++;
    noiseCounter.textContent = audioState.alertCount;
    
    robotWrapper.classList.remove('studying');
    robotWrapper.classList.add('alert');
    setTimeout(() => {
        robotWrapper.classList.remove('alert');
        if (timerState.isRunning) {
            robotWrapper.classList.add('studying');
        }
    }, 500);
}

function showSpeechBubble(message) {
    speechText.textContent = message;
    speechBubble.classList.add('show');
    setTimeout(() => speechBubble.classList.remove('show'), CONFIG.speechBubbleDuration);
}

// ========== MUSIC PLAYER ========== //
function toggleMusic() {
    if (musicState.isPlaying) {
        stopMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    const streamUrl = radioChannel.value;
    
    audioPlayer.src = streamUrl;
    audioPlayer.volume = 0.1;
    audioPlayer.play().then(() => {
        musicState.isPlaying = true;
        audioPlayBtn.classList.add('active');
        audioPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        savePreference('radioChannel', streamUrl);
    }).catch(err => {
        console.error('Audio playback failed:', err);
    });
}

function stopMusic() {
    audioPlayer.pause();
    audioPlayer.src = '';
    musicState.isPlaying = false;
    
    audioPlayBtn.classList.remove('active');
    audioPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
}

// ========== COMPONENT TOGGLES ========== //
function toggleRobot() {
    componentVisibility.robot = !componentVisibility.robot;
    document.body.classList.toggle('robot-hidden', !componentVisibility.robot);
    savePreference('robotHidden', !componentVisibility.robot);
    updateToggleButtons();
}

function toggleNoiseMeter() {
    componentVisibility.noiseMeter = !componentVisibility.noiseMeter;
    noiseMeterContainer.classList.toggle('hidden', !componentVisibility.noiseMeter);
    savePreference('noiseMeterHidden', !componentVisibility.noiseMeter);
    updateToggleButtons();
}

function toggleClock() {
    componentVisibility.clock = !componentVisibility.clock;
    clockContainer.classList.toggle('hidden', !componentVisibility.clock);
    savePreference('clockHidden', !componentVisibility.clock);
    updateToggleButtons();
}

function updateToggleButtons() {
    robotToggleBtn.classList.toggle('active', componentVisibility.robot);
    noiseMeterToggleBtn.classList.toggle('active', componentVisibility.noiseMeter);
    clockToggleBtn.classList.toggle('active', componentVisibility.clock);
}

// ========== START ========== //
document.addEventListener('DOMContentLoaded', init);

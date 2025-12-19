/**
 * ============================================
 * FOCUS MODE - MAIN APPLICATION
 * ============================================
 * Components:
 * - Timer (top center)
 * - Noise Meter (top left) 
 * - Analog Clock (top right)
 * - Audio Player (bottom)
 * - Robot with speech bubble (center)
 */

// ========== CONFIGURATION ========== //
const CONFIG = {
    defaultMinutes: 5,
    noiseSensitivity: 0.2,
    gaugeScale: 3.5, // Scale factor so 0.2 sensitivity shows as 70% on meter
    speechBubbleDuration: 3000,
    alertCooldown: 5000
};

// Random messages for noise alerts (with facial expression emojis)
const QUIET_MESSAGES = [
    "Shhh!", "Quiet please!", "Let's focus!", "Study time!",
    "Whisper voices!", "Indoor voices!", "Too noisy!", "Shhhhh...",
    "Focus mode!", "Keep it down!", "Quiet zone!", "Let's be quiet!",
    "Working here!", "Silence please!", "Shh!", "Studying!"
];

// Facial expression emojis (angry, stern, pleading, etc.)
const FACE_EMOJIS = [
    "😠", "😤", "😡", "🤨", "😑", "😒", "🙄", "😾", 
    "😐", "😕", "😟", "🥺", "😣", "😖", "😬", "🤫"
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
const robotImage = document.getElementById('robotImage');
const speechBubble = document.getElementById('speechBubble');
const speechText = document.getElementById('speechText');

// Noise Meter
const micBtn = document.getElementById('micBtn');
const gaugeFill = document.getElementById('gaugeFill');
const gaugeNeedle = document.getElementById('gaugeNeedle');
const noiseCounter = document.getElementById('noiseCounter');

// Clock
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const digitalTime = document.getElementById('digitalTime');

// Audio
const audioPlayBtn = document.getElementById('audioPlayBtn');
const audioPlayIcon = document.getElementById('audioPlayIcon');
const audioStatus = document.getElementById('audioStatus');
const radioChannel = document.getElementById('radioChannel');
const audioPlayer = document.getElementById('audioPlayer');

// Theme
const themeBtn = document.getElementById('themeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

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

// ========== INITIALIZATION ========== //
function init() {
    loadPreferences();
    updateTimerDisplay();
    setupEventListeners();
    startClock();
    addGaugeGradient();
    console.log('🤖 Focus Mode initialized!');
}

function loadPreferences() {
    // Dark mode
    if (localStorage.getItem('focusMode_darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
    
    // Timer duration - use default, don't load saved value
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

// Add gradient definition for gauge
function addGaugeGradient() {
    const svg = document.querySelector('.gauge');
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
    
    // Audio
    audioPlayBtn.addEventListener('click', toggleMusic);
    radioChannel.addEventListener('change', () => {
        if (musicState.isPlaying) {
            playMusic(); // Auto-switch to new channel
        }
    });
    
    // Theme & Fullscreen
    themeBtn.addEventListener('click', toggleTheme);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key.toLowerCase()) {
        case ' ':
            e.preventDefault();
            timerState.isRunning ? pauseTimer() : startTimer();
            break;
        case 'r': resetTimer(); break;
        case 'm': toggleMicrophone(); break;
        case 'd': toggleTheme(); break;
        case 'f': toggleFullscreen(); break;
    }
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
}

function resetTimer() {
    timerState.isRunning = false;
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    
    const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
    timerState.totalSeconds = minutes * 60;
    
    timerInputContainer.classList.remove('hidden');
    updateTimerDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function timerComplete() {
    pauseTimer();
    showSpeechBubble("Time's up! 🎉");
    
    // Play beep
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
    
    // Calculate rotation angles
    const hourDeg = (hours * 30) + (minutes * 0.5);
    const minDeg = minutes * 6;
    const secDeg = seconds * 6;
    
    // Apply rotations
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
    
    // Update digital time with AM/PM
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
    
    // Scale the gauge display (0.2 sensitivity = 70% on meter)
    const volumePercent = Math.min(100, normalizedVolume * 100 * CONFIG.gaugeScale);
    updateGauge(volumePercent);
    
    // Threshold at 70% on the gauge (0.2 * 3.5 * 100 = 70)
    if (normalizedVolume > CONFIG.noiseSensitivity) {
        const now = Date.now();
        if (now - audioState.lastAlertTime > CONFIG.alertCooldown) {
            triggerNoiseAlert();
            audioState.lastAlertTime = now;
        }
    }
    
    requestAnimationFrame(analyzeAudio);
}

function updateGauge(percent) {
    // Update arc fill (stroke-dashoffset)
    const maxDash = 126; // Approximate arc length
    const offset = maxDash - (percent / 100) * maxDash;
    gaugeFill.style.strokeDashoffset = offset;
    
    // Update needle rotation (-90 to 90 degrees)
    const angle = -90 + (percent / 100) * 180;
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;
}

function triggerNoiseAlert() {
    const message = QUIET_MESSAGES[Math.floor(Math.random() * QUIET_MESSAGES.length)];
    const emoji = FACE_EMOJIS[Math.floor(Math.random() * FACE_EMOJIS.length)];
    showSpeechBubble(`${message} ${emoji}`);
    
    // Increment and update counter
    audioState.alertCount++;
    noiseCounter.textContent = audioState.alertCount;
    
    robotImage.classList.add('alert');
    setTimeout(() => robotImage.classList.remove('alert'), 500);
}

function showSpeechBubble(message) {
    speechText.textContent = message;
    speechBubble.classList.add('show');
    setTimeout(() => speechBubble.classList.remove('show'), CONFIG.speechBubbleDuration);
}

// ========== MUSIC PLAYER (Soma.fm) ========== //
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
    audioPlayer.volume = 0.1; // Set volume to 10%
    audioPlayer.play().then(() => {
        musicState.isPlaying = true;
        audioPlayBtn.classList.add('active');
        audioPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        audioStatus.textContent = 'Playing...';
        savePreference('radioChannel', streamUrl);
    }).catch(err => {
        console.error('Audio playback failed:', err);
        audioStatus.textContent = 'Error - try again';
    });
}

function stopMusic() {
    audioPlayer.pause();
    audioPlayer.src = '';
    musicState.isPlaying = false;
    
    audioPlayBtn.classList.remove('active');
    audioPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    audioStatus.textContent = 'Select a channel';
}

// ========== THEME ========== //
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    updateThemeIcon(isDark);
    savePreference('darkMode', isDark);
}

function updateThemeIcon(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    if (isDark) {
        themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>';
    } else {
        themeIcon.innerHTML = '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
    }
}

// ========== FULLSCREEN ========== //
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

// ========== START ========== //
document.addEventListener('DOMContentLoaded', init);

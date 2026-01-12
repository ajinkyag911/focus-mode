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
    space: 'assets/backgrounds/space.png',
    dinosaur: 'assets/backgrounds/dinosaur.png',
    dance: 'assets/backgrounds/dance.png',
    egypt: 'assets/backgrounds/egypt.png',
    wizard: 'assets/backgrounds/wizard.png',
    zombies: 'assets/backgrounds/zombie.png',
    library: 'assets/backgrounds/library.png'
};

// Robot images per theme (filename in assets/robots/normal/ and assets/robots/alert/)
const ROBOT_IMAGES = {
    space: 'space.png',
    dinosaur: 'dinosaur.png',
    dance: 'dance.png',
    egypt: 'egypt.png',
    wizard: 'wizard.png',
    zombies: 'zombie.png',
    library: 'library.png'
};

// Theme-specific messages for noise alerts
const THEMED_MESSAGES = {
    space: [
        "Quiet in\nthe spacecraft! 🚀", "Houston says:\ntoo loud!", "Silent like\nspace! 🌌",
        "Astronauts\nwhisper! 👨‍🚀", "Zero gravity\nvoices!", "Mission control:\nshhh!",
        "Starship\nquiet mode! ⭐", "Aliens might\nhear us!"
    ],
    dinosaur: [
        "Don't wake\nthe T-Rex! 🦖", "Quiet or dinos\nwill find us!", "Prehistoric\nwhispers!",
        "Shhh, raptors\nnearby! 🦕", "Fossils need\nsilence!", "Dino nap\ntime!",
        "Quiet in\nthe jungle!", "Even pterodactyls\nare quieter!"
    ],
    dance: [
        "Save energy\nfor dancing! 💃", "Quiet between\nsongs!", "Shhh, DJ's\nmixing! 🎧",
        "Dance floor\nwhispers! 🕺", "Soft moves\nonly!", "Groove\nquietly!",
        "Keep the rhythm\ninside!", "Silent disco\nmode! 🪩"
    ],
    egypt: [
        "Quiet in\nthe pyramid! 🏛️", "Pharaohs need\nsilence!", "Sphinx says\nshhh! 🐪",
        "Don't disturb\nthe mummies!", "Ancient whispers\nonly!", "Tomb silence\nplease!",
        "Hieroglyphic\nhush! ☀️", "Desert calm\nneeded!"
    ],
    wizard: [
        "Quiet for\nthe spell! ✨", "Wizards need\nfocus!", "Shhh, magic\nbrewing! 🧙",
        "Don't break\nthe enchantment!", "Wand whispers\nonly! 🪄", "Potion needs\nsilence!",
        "Mystical hush\nplease!", "Spellcasting\nin progress! 🔮"
    ],
    zombies: [
        "Shhh, zombies\nwill hear! 🧟", "Stay quiet\nto survive!", "Don't attract\nthe horde!",
        "Whisper or\nthey'll find us! 💀", "Undead silence\nneeded!", "Brain-saving\nquiet!",
        "Zombie apocalypse\nrules: hush!", "The walking dead\nare listening! 🪦"
    ],
    library: [
        "Library voices\nplease! 📚", "Books need\nquiet!", "Shhh, readers\nstudying! 🦉",
        "Whisper in\nthe stacks!", "Page-turning\nsilence!", "Librarian\nsays hush!",
        "Quiet reading\nzone! 📖", "Knowledge\nneeds calm! ✏️"
    ]
};

// Theme-specific emojis
const THEMED_EMOJIS = {
    space: ["🚀", "🌟", "👨‍🚀", "🛸", "🌙", "⭐", "🪐", "🌌"],
    dinosaur: ["🦖", "🦕", "🌿", "🥚", "🌴", "🦴", "🐊", "🌋"],
    dance: ["💃", "🕺", "🎵", "🎧", "🪩", "✨", "🎤", "🎶"],
    egypt: ["🏛️", "🐪", "☀️", "⭐", "🏜️", "👑", "🐍", "🌙"],
    wizard: ["🧙", "✨", "🪄", "🔮", "⚡", "🌟", "📜", "🦉"],
    zombies: ["🧟", "💀", "🪦", "🧠", "👻", "🦇", "🌙", "⚰️"],
    library: ["📚", "🦉", "📖", "✏️", "🔖", "📝", "🎓", "💡"]
};

// ========== DOM ELEMENTS ========== //
// Timer
const timerDisplay = document.getElementById('timerDisplay');
const timerEditInput = document.getElementById('timerEditInput');
const timerArcProgress = document.getElementById('timerArcProgress');
const timerCard = document.querySelector('.timer-card');
const minutesInput = document.getElementById('minutesInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Robot
const robotWrapper = document.getElementById('robotWrapper');
const robotImage = document.getElementById('robotImage');
const speechBubble = document.getElementById('speechBubble');
const speechText = document.getElementById('speechText');

// Noise Meter
const noiseMeterContainer = document.getElementById('noiseMeterContainer');
const micBtn = document.getElementById('micBtn');
const gaugeFill = document.getElementById('gaugeFill');
const gaugeNeedle = document.getElementById('gaugeNeedle');
const gaugeThreshold = document.getElementById('gaugeThreshold');
const noiseCounter = document.getElementById('noiseCounter');
const sensitivitySlider = document.getElementById('sensitivitySlider');
const sensitivityValue = document.getElementById('sensitivityValue');

// Audio
const audioPlayBtn = document.getElementById('audioPlayBtn');
const audioPlayIcon = document.getElementById('audioPlayIcon');
const radioChannel = document.getElementById('radioChannel');
const audioPlayer = document.getElementById('audioPlayer');

// Theme
const themeSelect = document.getElementById('themeSelect');

// ========== STATE ========== //
let timerState = {
    totalSeconds: CONFIG.defaultMinutes * 60,
    initialSeconds: CONFIG.defaultMinutes * 60,
    isRunning: false,
    intervalId: null,
    isEditing: false
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
    noiseMeter: true
};

// ========== INITIALIZATION ========== //
function init() {
    loadPreferences();
    updateTimerDisplay();
    updateArc();
    setupEventListeners();
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
    const savedMinutes = localStorage.getItem('focusMode_minutes');
    const minutes = savedMinutes ? parseInt(savedMinutes) : CONFIG.defaultMinutes;
    minutesInput.value = minutes;
    timerState.totalSeconds = minutes * 60;
    timerState.initialSeconds = minutes * 60;
    
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
    
    // Inline editing - click timer display to edit
    timerDisplay.addEventListener('click', startTimerEdit);
    timerDisplay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startTimerEdit();
        }
    });
    
    // Edit input handling
    timerEditInput.addEventListener('blur', finishTimerEdit);
    timerEditInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishTimerEdit();
        } else if (e.key === 'Escape') {
            cancelTimerEdit();
        }
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
    updateNoiseMeterLabel(theme);
    updateRobotImage(theme, false);
}

function updateRobotImage(theme, isAlert = false) {
    const filename = ROBOT_IMAGES[theme] || ROBOT_IMAGES.space;
    const folder = isAlert ? 'alert' : 'normal';
    robotImage.src = `assets/robots/${folder}/${filename}`;
}

function updateNoiseMeterLabel(theme, noiseLevel = 0) {
    const labels = THEME_NOISE_LABELS[theme] || THEME_NOISE_LABELS.space;
    const gaugeLabel = document.querySelector('.gauge-label');
    if (!gaugeLabel) return;
    
    let label;
    if (noiseLevel < 30) {
        label = labels.quiet;
    } else if (noiseLevel < 70) {
        label = labels.medium;
    } else {
        label = labels.loud;
    }
    gaugeLabel.textContent = label;
}

// ========== TIMER ========== //
function startTimerEdit() {
    if (timerState.isRunning) return;
    timerState.isEditing = true;
    timerDisplay.style.opacity = '0';
    timerEditInput.classList.add('editing');
    timerEditInput.value = timerDisplay.textContent;
    timerEditInput.focus();
    timerEditInput.select();
}

function finishTimerEdit() {
    if (!timerState.isEditing) return;
    timerState.isEditing = false;
    
    const value = timerEditInput.value.trim();
    let totalSeconds = parseTimeInput(value);
    
    if (totalSeconds > 0 && totalSeconds <= 180 * 60) {
        timerState.totalSeconds = totalSeconds;
        timerState.initialSeconds = totalSeconds;
        const minutes = Math.ceil(totalSeconds / 60);
        minutesInput.value = minutes;
        savePreference('minutes', minutes);
    }
    
    timerEditInput.classList.remove('editing');
    timerDisplay.style.opacity = '1';
    updateTimerDisplay();
    updateArc();
}

function cancelTimerEdit() {
    timerState.isEditing = false;
    timerEditInput.classList.remove('editing');
    timerDisplay.style.opacity = '1';
}

function parseTimeInput(value) {
    if (value.includes(':')) {
        const parts = value.split(':');
        const mins = parseInt(parts[0]) || 0;
        const secs = parseInt(parts[1]) || 0;
        return mins * 60 + secs;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
        return num * 60;
    }
    return 0;
}

function startTimer() {
    if (timerState.isRunning) return;
    
    if (!timerState.intervalId) {
        timerState.initialSeconds = timerState.totalSeconds;
    }
    
    timerState.isRunning = true;
    timerCard.classList.add('running');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    robotWrapper.classList.add('studying');
    
    timerState.intervalId = setInterval(() => {
        timerState.totalSeconds--;
        updateTimerDisplay();
        updateArc();
        if (timerState.totalSeconds <= 0) timerComplete();
    }, 1000);
}

function pauseTimer() {
    if (!timerState.isRunning) return;
    timerState.isRunning = false;
    clearInterval(timerState.intervalId);
    timerCard.classList.remove('running');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    robotWrapper.classList.remove('studying');
}

function resetTimer() {
    pauseTimer();
    timerState.intervalId = null;
    const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
    timerState.totalSeconds = minutes * 60;
    timerState.initialSeconds = minutes * 60;
    updateTimerDisplay();
    updateArc();
    timerCard.classList.remove('running');
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

function updateArc() {
    const arcLength = 251.33; // Length of semi-circle arc (π * r = π * 80)
    const progress = timerState.initialSeconds > 0 
        ? timerState.totalSeconds / timerState.initialSeconds 
        : 1;
    
    // Fill from left to right (offset decreases as time passes)
    const offset = arcLength * progress;
    timerArcProgress.style.strokeDasharray = arcLength;
    timerArcProgress.style.strokeDashoffset = offset;
}

// Theme indicator emojis
const THEME_INDICATORS = {
    space: '🛸',
    dinosaur: '🦖',
    dance: '🪩',
    egypt: '👁️',
    wizard: '🔮',
    zombies: '🧟',
    library: '📚'
};

// Theme clock emojis (for 12, 3, 6, 9 positions)
const THEME_CLOCK_EMOJIS = {
    space: ['🚀', '🌟', '🌙', '🪐'],
    dinosaur: ['🦕', '🌿', '🦴', '🌋'],
    dance: ['🎵', '💃', '🎶', '🕺'],
    egypt: ['☀️', '🐪', '🏺', '🐍'],
    wizard: ['⭐', '🧙', '📖', '🦉'],
    zombies: ['🧟', '🪦', '💀', '🌙'],
    library: ['📖', '🦉', '📚', '🕯️']
};

// Theme noise meter labels
const THEME_NOISE_LABELS = {
    space: { quiet: '🤫 Silent Space', medium: '🛸 Spacecraft Hum', loud: '🚀 Rocket Launch!' },
    dinosaur: { quiet: '🦕 Peaceful Forest', medium: '🌿 Rustling Leaves', loud: '🦖 T-Rex Roar!' },
    dance: { quiet: '🎵 Soft Melody', medium: '💃 Dance Floor', loud: '🎸 Rock Concert!' },
    egypt: { quiet: '🏺 Quiet Tomb', medium: '🐪 Desert Winds', loud: '👁️ Pharaoh\'s Call!' },
    wizard: { quiet: '📖 Library Whisper', medium: '✨ Magic Brewing', loud: '🔮 Spell Casting!' },
    zombies: { quiet: '🪦 Graveyard Silence', medium: '🦇 Spooky Sounds', loud: '🧟 Zombie Horde!' },
    library: { quiet: '📖 Silent Reading', medium: '✏️ Page Turning', loud: '📢 Shh! Too Loud!' }
};

// Theme decorative images (open-source SVG icons from OpenMoji/Twemoji CDN)
const THEME_DECORATIONS = {
    space: [
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f31f.svg',  // Star
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f30c.svg'   // Milky Way
    ],
    dinosaur: [
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1fab4.svg',  // Potted Plant
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f33f.svg'   // Herb
    ],
    dance: [
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f3b5.svg',  // Music Note
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/2728.svg'    // Sparkles
    ],
    egypt: [
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f3db.svg',  // Classical Building
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/2b50.svg'    // Star
    ],
    wizard: [
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/2728.svg',   // Sparkles
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f31f.svg'   // Glowing Star
    ],
    zombies: [
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f9df.svg',  // Zombie
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f480.svg'   // Skull
    ],
    library: [
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4da.svg',  // Books
        'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f989.svg'   // Owl
    ]
};

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
    
    const currentTheme = document.body.getAttribute('data-theme') || 'space';
    updateNoiseMeterLabel(currentTheme, percent);
}

function updateSensitivity(percent) {
    const angle = -90 + (percent / 100) * 180;
    gaugeThreshold.setAttribute('transform', `rotate(${angle}, 50, 50)`);
}

function triggerNoiseAlert() {
    const currentTheme = document.body.getAttribute('data-theme') || 'space';
    const messages = THEMED_MESSAGES[currentTheme] || THEMED_MESSAGES.space;
    const emojis = THEMED_EMOJIS[currentTheme] || THEMED_EMOJIS.space;
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    showSpeechBubble(`${message} ${emoji}`);
    
    audioState.alertCount++;
    noiseCounter.textContent = audioState.alertCount;
    
    robotWrapper.classList.remove('studying');
    robotWrapper.classList.add('alert');
    updateRobotImage(currentTheme, true);
    
    setTimeout(() => {
        robotWrapper.classList.remove('alert');
        updateRobotImage(currentTheme, false);
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

// ========== START ========== //
document.addEventListener('DOMContentLoaded', init);

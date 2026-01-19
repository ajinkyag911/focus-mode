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
    alertCooldown: 5000,
    ballCount: 15,
    ballRadius: 20,
    gravity: 0.5,
    bounce: 0.8,
    friction: 0.98
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

// ========== BALLS SYSTEM ========== //
class Ball {
    constructor(x, y, radius = CONFIG.ballRadius) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.radius = radius;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.dragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }
    
    update(width, height, noiseIntensity) {
        if (this.dragging) return;
        
        // Apply gravity
        this.vy += CONFIG.gravity;
        
        // Apply friction
        this.vx *= CONFIG.friction;
        this.vy *= CONFIG.friction;
        
        // Add noise-based impulse
        if (noiseIntensity > 0) {
            const angle = Math.random() * Math.PI * 2;
            const force = noiseIntensity * 3;
            this.vx += Math.cos(angle) * force;
            this.vy += Math.sin(angle) * force;
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Boundary collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -CONFIG.bounce;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -CONFIG.bounce;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -CONFIG.bounce;
        }
        if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -CONFIG.bounce;
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    contains(x, y) {
        const dist = Math.hypot(x - this.x, y - this.y);
        return dist <= this.radius;
    }
}

class BallsSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.balls = [];
        this.draggedBall = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentNoiseIntensity = 0;
        
        this.resizeCanvas();
        this.createBalls();
        this.setupEventListeners();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    createBalls() {
        this.balls = [];
        for (let i = 0; i < CONFIG.ballCount; i++) {
            const x = Math.random() * (this.canvas.width - CONFIG.ballRadius * 2) + CONFIG.ballRadius;
            const y = Math.random() * (this.canvas.height * 0.5) + CONFIG.ballRadius;
            this.balls.push(new Ball(x, y));
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createBalls();
        });
    }
    
    getCanvasCoords(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    handleMouseDown(e) {
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        for (let i = this.balls.length - 1; i >= 0; i--) {
            if (this.balls[i].contains(coords.x, coords.y)) {
                this.draggedBall = this.balls[i];
                this.draggedBall.dragging = true;
                this.draggedBall.dragOffsetX = coords.x - this.draggedBall.x;
                this.draggedBall.dragOffsetY = coords.y - this.draggedBall.y;
                break;
            }
        }
    }
    
    handleMouseMove(e) {
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        this.mouseX = coords.x;
        this.mouseY = coords.y;
        
        if (this.draggedBall) {
            this.draggedBall.x = coords.x - this.draggedBall.dragOffsetX;
            this.draggedBall.y = coords.y - this.draggedBall.dragOffsetY;
            this.draggedBall.vx = 0;
            this.draggedBall.vy = 0;
        }
    }
    
    handleMouseUp() {
        if (this.draggedBall) {
            this.draggedBall.dragging = false;
            this.draggedBall = null;
        }
    }
    
    handleTouchStart(e) {
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        for (let i = this.balls.length - 1; i >= 0; i--) {
            if (this.balls[i].contains(coords.x, coords.y)) {
                this.draggedBall = this.balls[i];
                this.draggedBall.dragging = true;
                this.draggedBall.dragOffsetX = coords.x - this.draggedBall.x;
                this.draggedBall.dragOffsetY = coords.y - this.draggedBall.y;
                break;
            }
        }
    }
    
    handleTouchMove(e) {
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        
        if (this.draggedBall) {
            this.draggedBall.x = coords.x - this.draggedBall.dragOffsetX;
            this.draggedBall.y = coords.y - this.draggedBall.dragOffsetY;
            this.draggedBall.vx = 0;
            this.draggedBall.vy = 0;
        }
    }
    
    handleTouchEnd() {
        if (this.draggedBall) {
            this.draggedBall.dragging = false;
            this.draggedBall = null;
        }
    }
    
    update(noiseIntensity) {
        this.currentNoiseIntensity = noiseIntensity;
        
        for (let ball of this.balls) {
            ball.update(this.canvas.width, this.canvas.height, noiseIntensity);
        }
        
        // Ball-to-ball collision
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                this.checkCollision(this.balls[i], this.balls[j]);
            }
        }
    }
    
    checkCollision(ball1, ball2) {
        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ball1.radius + ball2.radius;
        
        if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            // Resolve overlap
            const overlap = minDist - dist;
            ball1.x -= overlap * cos * 0.5;
            ball1.y -= overlap * sin * 0.5;
            ball2.x += overlap * cos * 0.5;
            ball2.y += overlap * sin * 0.5;
            
            // Exchange velocities
            const vx1 = ball1.vx * cos + ball1.vy * sin;
            const vy1 = ball1.vy * cos - ball1.vx * sin;
            const vx2 = ball2.vx * cos + ball2.vy * sin;
            const vy2 = ball2.vy * cos - ball2.vx * sin;
            
            ball1.vx = vx2 * cos - vy1 * sin;
            ball1.vy = vy1 * cos + vx2 * sin;
            ball2.vx = vx1 * cos - vy2 * sin;
            ball2.vy = vy2 * cos + vx1 * sin;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'transparent';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw balls
        for (let ball of this.balls) {
            ball.draw(this.ctx);
        }
    }
    
    animate = () => {
        this.update(this.currentNoiseIntensity);
        this.draw();
        requestAnimationFrame(this.animate);
    }
}

let ballsSystem = null;

// ========== DOM ELEMENTS ========== //
// Timer
const timerDisplay = document.getElementById('timerDisplay');
const timerEditInput = document.getElementById('timerEditInput');
const timerArcProgress = document.getElementById('timerArcProgress');
const timerCard = document.querySelector('.timer-card');
const minutesInput = document.getElementById('minutesInput');
const toggleBtn = document.getElementById('toggleBtn');
const toggleIcon = document.getElementById('toggleIcon');
const editBtn = document.getElementById('editBtn');
const resetBtn = document.getElementById('resetBtn');

// Robot
const robotWrapper = document.getElementById('robotWrapper');
const robotImage = document.getElementById('robotImage');
const robotVideo = document.getElementById('robotVideo');
const speechBubble = document.getElementById('speechBubble');
const speechText = document.getElementById('speechText');

// Noise Meter
const noiseMeterContainer = document.getElementById('noiseMeterContainer');
const micBtn = document.getElementById('micBtn');
const gaugeFill = document.getElementById('gaugeFill');
const gaugeNeedle = document.getElementById('gaugeNeedle');
const gaugeThreshold = document.getElementById('gaugeThreshold');
const sensitivitySlider = document.getElementById('sensitivitySlider');
const sensitivityValue = document.getElementById('sensitivityValue');
const noiseEffectLayer = document.getElementById('noiseEffectLayer');
const alertSoundDropdown = document.getElementById('alertSoundDropdown');
const alertSoundTrigger = document.getElementById('alertSoundTrigger');
const alertSoundMenu = document.getElementById('alertSoundMenu');
const alertSoundValue = document.getElementById('alertSoundValue');

// Audio
const audioPlayBtn = document.getElementById('audioPlayBtn');
const audioPlayIcon = document.getElementById('audioPlayIcon');
const radioChannel = document.getElementById('radioChannel');
const audioPlayer = document.getElementById('audioPlayer');

// Theme
const themeSelect = document.getElementById('themeSelect');
const timerThemeIndicator = document.getElementById('timerThemeIndicator');

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

let soundState = {
    alertSound: 'none' // 'none', 'bell', 'shush'
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
    updateMicIcon(); // Set initial mic icon
    startListening(); // Enable microphone by default
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
    
    // Saved alert sound
    const savedAlertSound = localStorage.getItem('focusMode_alertSound') || 'none';
    soundState.alertSound = savedAlertSound;
    alertSoundValue.textContent = savedAlertSound.charAt(0).toUpperCase() + savedAlertSound.slice(1);
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

// ========== CUSTOM DROPDOWN SETUP ========== //
function setupCustomDropdowns() {
    // Theme dropdown
    const themeDropdown = document.getElementById('themeDropdown');
    const themeTrigger = document.getElementById('themeTrigger');
    const themeMenu = document.getElementById('themeMenu');
    const themeValue = document.getElementById('themeValue');
    const themeOptions = themeMenu.querySelectorAll('.dropdown-option');
    
    themeTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        themeTrigger.classList.toggle('open');
        themeMenu.classList.toggle('open');
    });
    
    themeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            themeValue.textContent = text;
            themeSelect.value = value;
            themeSelect.dispatchEvent(new Event('change'));
            themeTrigger.classList.remove('open');
            themeMenu.classList.remove('open');
            themeOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    // Music dropdown
    const musicDropdown = document.getElementById('musicDropdown');
    const musicTrigger = document.getElementById('musicTrigger');
    const musicMenu = document.getElementById('musicMenu');
    const musicValue = document.getElementById('musicValue');
    const musicOptions = musicMenu.querySelectorAll('.dropdown-option');
    
    musicTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        musicTrigger.classList.toggle('open');
        musicMenu.classList.toggle('open');
    });
    
    musicOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            musicValue.textContent = text;
            radioChannel.value = value;
            radioChannel.dispatchEvent(new Event('change'));
            musicTrigger.classList.remove('open');
            musicMenu.classList.remove('open');
            musicOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeDropdown.contains(e.target)) {
            themeTrigger.classList.remove('open');
            themeMenu.classList.remove('open');
        }
        if (!musicDropdown.contains(e.target)) {
            musicTrigger.classList.remove('open');
            musicMenu.classList.remove('open');
        }
        if (!alertSoundDropdown.contains(e.target)) {
            alertSoundTrigger.classList.remove('open');
            alertSoundMenu.classList.remove('open');
        }
    });
}

// ========== EVENT LISTENERS ========== //
function setupEventListeners() {
    setupCustomDropdowns();
    
    // Timer
    toggleBtn.addEventListener('click', toggleTimer);
    editBtn.addEventListener('click', startTimerEdit);
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
    
    // Alert sound dropdown
    alertSoundTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        alertSoundTrigger.classList.toggle('open');
        alertSoundMenu.classList.toggle('open');
    });
    
    alertSoundMenu.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            soundState.alertSound = value;
            alertSoundValue.textContent = option.textContent;
            alertSoundTrigger.classList.remove('open');
            alertSoundMenu.classList.remove('open');
            savePreference('alertSound', value);
        });
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
            toggleTimer();
            break;
        case 'r': resetTimer(); break;
        case 'm': toggleMicrophone(); break;
    }
}

// ========== THEME ========== //
// Theme-specific noise meter colors (based on background image colors)
const THEME_GAUGE_COLORS = {
    space: { start: '#1a237e', mid: '#5c6bc0', end: '#e91e63', needle: '#7c4dff' },
    dinosaur: { start: '#2e7d32', mid: '#8bc34a', end: '#ff5722', needle: '#4e342e' },
    dance: { start: '#e91e63', mid: '#ff4081', end: '#7b1fa2', needle: '#f50057' },
    egypt: { start: '#ff8f00', mid: '#ffc107', end: '#d84315', needle: '#5d4037' },
    wizard: { start: '#4a148c', mid: '#9c27b0', end: '#e91e63', needle: '#7c4dff' },
    zombies: { start: '#1b5e20', mid: '#4caf50', end: '#b71c1c', needle: '#212121' },
    library: { start: '#3e2723', mid: '#8d6e63', end: '#bf360c', needle: '#4e342e' }
};

// Theme video files
const THEME_VIDEOS = {
    space: 'space.mp4',
    dinosaur: 'dinosaur.mp4',
    dance: 'dance.mp4',
    egypt: 'egypt.mp4',
    wizard: 'wizard.mp4',
    zombies: 'zombie.mp4',
    library: 'library.mp4'
};

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    updateNoiseMeterLabel(theme);
    updateRobotForTheme(theme);
    updateTimerThemeIndicator(theme);
    updateNoiseMeterColors(theme);
    updateTimerTitle(theme);
    updateTimerArcGradient(theme);
    updateBallsTheme(theme);
}

function updateNoiseMeterColors(theme) {
    const colors = THEME_GAUGE_COLORS[theme] || THEME_GAUGE_COLORS.space;
    
    // Update gradient stops
    const gradient = document.getElementById('gaugeGradient');
    if (gradient) {
        const stops = gradient.querySelectorAll('stop');
        if (stops.length >= 3) {
            stops[0].style.stopColor = colors.start;
            stops[1].style.stopColor = colors.mid;
            stops[2].style.stopColor = colors.end;
        }
    }
    
    // Update needle and center colors
    if (gaugeNeedle) {
        gaugeNeedle.style.stroke = colors.needle;
    }
    const gaugeCenter = document.querySelector('.gauge-center');
    if (gaugeCenter) {
        gaugeCenter.style.fill = colors.needle;
    }
}

function updateTimerThemeIndicator(theme) {
    if (timerThemeIndicator) {
        timerThemeIndicator.textContent = THEME_INDICATORS[theme] || THEME_INDICATORS.space;
    }
}

function updateTimerTitle(theme) {
    const cardTitle = document.querySelector('.card-title');
    if (cardTitle) {
        cardTitle.textContent = THEME_TIMER_TITLES[theme] || THEME_TIMER_TITLES.space;
    }
}

function updateTimerArcGradient(theme) {
    const gradient = document.getElementById('arcGradient');
    if (gradient) {
        const colors = THEME_ARC_GRADIENTS[theme] || THEME_ARC_GRADIENTS.space;
        const stops = gradient.querySelectorAll('stop');
        if (stops.length >= 3) {
            stops[0].style.stopColor = colors.start;
            stops[1].style.stopColor = colors.end;
            stops[2].style.stopColor = colors.end;
        }
    }
}

function updateBallsTheme(theme) {
    const ballsCanvas = document.getElementById('ballsCanvas');
    if (theme === 'balls') {
        ballsCanvas.style.display = 'block';
        if (!ballsSystem) {
            ballsSystem = new BallsSystem(ballsCanvas);
        }
    } else {
        ballsCanvas.style.display = 'none';
        ballsSystem = null;
    }
}

function updateTimerTextColor(theme) {
    const colors = THEME_ARC_GRADIENTS[theme] || THEME_ARC_GRADIENTS.space;
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.style.color = colors.start;
    }
}

function updateTimerArcBgColor(theme) {
    const colors = THEME_ARC_GRADIENTS[theme] || THEME_ARC_GRADIENTS.space;
    const arcBg = document.querySelector('.timer-arc-bg');
    if (arcBg) {
        // Extract RGB values and make it lighter with lower opacity
        arcBg.style.stroke = colors.start;
        arcBg.style.opacity = '0.25';
    }
}

function updateNoiseNeedleColor(theme) {
    const colors = THEME_ARC_GRADIENTS[theme] || THEME_ARC_GRADIENTS.space;
    const gaugeNeedle = document.getElementById('gaugeNeedle');
    if (gaugeNeedle) {
        gaugeNeedle.style.stroke = colors.start;
    }
}

function updateRobotForTheme(theme) {
    // All themes now use video
    const videoFile = THEME_VIDEOS[theme];
    if (videoFile) {
        robotImage.style.display = 'none';
        robotVideo.style.display = 'block';
        robotVideo.src = `assets/videos/${videoFile}`;
        robotVideo.currentTime = 0;
        robotVideo.pause(); // Start paused at 0 sec (normal state)
        videoAlertState = false;
        videoAtAlertFrame = false;
        videoPlayingToAlert = false;
        videoTransitioning = false;
    } else {
        // Fallback to image if no video
        robotImage.style.display = 'block';
        robotVideo.style.display = 'none';
        robotVideo.pause();
        updateRobotImage(theme, false);
    }
}

function updateRobotImage(theme, isAlert = false) {
    const filename = ROBOT_IMAGES[theme] || ROBOT_IMAGES.space;
    const folder = isAlert ? 'alert' : 'normal';
    robotImage.src = `assets/robots/${folder}/${filename}`;
}

// Video alert state (for all themes with videos)
// Normal: paused at 0 seconds
// Alert: plays from 0 to 4 seconds, stays at 4 while noise is high
// When noise goes low: plays from 4 to end, then resets to 0
let videoAlertState = false;
let videoTransitioning = false;
let videoAtAlertFrame = false;
let videoPlayingToAlert = false;

function keepVideoAtAlert() {
    const currentTheme = document.body.getAttribute('data-theme');
    if (!THEME_VIDEOS[currentTheme]) return;
    
    // If already at alert frame, keep it there
    if (videoAtAlertFrame) {
        return;
    }
    
    // If already playing towards alert, let it continue
    if (videoPlayingToAlert) {
        // Check if reached 4 seconds
        if (robotVideo.currentTime >= 4) {
            robotVideo.pause();
            videoAtAlertFrame = true;
            videoPlayingToAlert = false;
        }
        return;
    }
    
    // If transitioning back to normal, let it finish first
    if (videoTransitioning) {
        return;
    }
    
    // Start playing to alert if not already
    if (!videoAlertState) {
        videoAlertState = true;
        videoPlayingToAlert = true;
        robotVideo.play();
    }
}

function releaseVideoFromAlert() {
    const currentTheme = document.body.getAttribute('data-theme');
    if (!THEME_VIDEOS[currentTheme]) return;
    if (videoTransitioning) return;
    if (videoPlayingToAlert) return; // Let it finish playing to alert first
    if (!videoAlertState && !videoAtAlertFrame) return;
    
    videoAlertState = false;
    videoAtAlertFrame = false;
    videoTransitioning = true;
    
    // Continue playing from current position to end, then reset to 0
    robotVideo.play();
    
    const checkEndTime = () => {
        if (robotVideo.ended || robotVideo.currentTime >= robotVideo.duration - 0.1) {
            robotVideo.pause();
            robotVideo.currentTime = 0;
            videoTransitioning = false;
        } else if (videoTransitioning) {
            requestAnimationFrame(checkEndTime);
        }
    };
    requestAnimationFrame(checkEndTime);
}

function setVideoAlertState(isAlert) {
    if (isAlert) {
        keepVideoAtAlert();
    }
}

// Legacy dinosaur functions for backwards compatibility
function keepDinosaurAtAlert() {
    keepVideoAtAlert();
}

function releaseDinosaurFromAlert() {
    releaseVideoFromAlert();
}

function setDinosaurAlertState(isAlert) {
    setVideoAlertState(isAlert);
}

function updateNoiseMeterLabel(theme, noiseLevel = 0) {
    const gaugeLabel = document.querySelector('.gauge-label');
    if (!gaugeLabel) return;
    
    gaugeLabel.textContent = '🔊 Noise Level';
}

// ========== TIMER ========== //
function startTimerEdit() {
    // Pause timer if it's running
    if (timerState.isRunning) {
        pauseTimer();
    }
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

function toggleTimer() {
    if (timerState.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function updateToggleButtonIcon() {
    // Play icon path: M8 5v14l11-7z
    // Pause icon path: M6 19h4V5H6v14zm8-14v14h4V5h-4z
    if (timerState.isRunning) {
        // Show pause icon
        toggleIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />';
    } else {
        // Show play icon
        toggleIcon.innerHTML = '<path d="M8 5v14l11-7z" />';
    }
}

function startTimer() {
    if (timerState.isRunning) return;
    
    // If timer is at 0, reset it before starting
    if (timerState.totalSeconds <= 0) {
        const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
        timerState.totalSeconds = minutes * 60;
        timerState.initialSeconds = minutes * 60;
        updateTimerDisplay();
        updateArc();
    }
    
    if (!timerState.intervalId) {
        timerState.initialSeconds = timerState.totalSeconds;
    }
    
    timerState.isRunning = true;
    timerCard.classList.add('running');
    updateToggleButtonIcon();
    
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
    updateToggleButtonIcon();
    
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
    updateToggleButtonIcon();
}

function timerComplete() {
    pauseTimer();
    
    showSpeechBubble("Time's up! 🎉");
    
    robotWrapper.classList.add('celebrate');
    setTimeout(() => robotWrapper.classList.remove('celebrate'), 800);
    
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        
        // Create a pleasant bell sound with harmonics
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Bell-like envelope with natural decay
            const volume = 0.15 / (i + 1); // Harmonics are quieter
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            
            osc.start(now);
            osc.stop(now + 1.5);
        });
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
    
    // Update indicator position along the arc
    updateIndicatorPosition(progress);
}

function updateIndicatorPosition(progress) {
    if (!timerThemeIndicator) return;
    
    // Indicator starts at left (progress=1) and moves to right (progress=0)
    // angle = π when progress=1 (left), angle = 0 when progress=0 (right)
    const angle = Math.PI * progress;
    
    // Calculate position on the arc (viewBox is 200x120, arc center at 100,100)
    const centerX = 50; // percentage
    const centerY = 83; // percentage (100/120 ≈ 83%)
    const radiusX = 40; // percentage (80/200 = 40%)
    const radiusY = 67; // percentage (80/120 ≈ 67%)
    
    // cos(π) = -1 (left), cos(0) = 1 (right)
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY - radiusY * Math.sin(angle);
    
    timerThemeIndicator.style.left = `${x}%`;
    timerThemeIndicator.style.top = `${y}%`;
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

// Theme timer titles
const THEME_TIMER_TITLES = {
    space: 'Launch Timer',
    dinosaur: 'Dino Clock',
    dance: 'Dance Timer',
    egypt: 'Sand Timer',
    wizard: 'Wizard Watch',
    zombies: 'Spooky Timer',
    library: 'Study Timer'
};

// Theme timer arc gradients (left to right)
const THEME_ARC_GRADIENTS = {
    space: { start: 'rgba(59, 59, 59, 1)', end: 'rgba(156, 252, 236, 1)' },
    dinosaur: { start: 'rgba(2, 171, 71, 1)', end: 'rgba(189, 206, 70, 1)' },
    dance: { start: 'rgba(111, 63, 177, 1)', end: 'rgba(129, 212, 250, 1)' },
    egypt: { start: 'rgba(178, 73, 56, 1)', end: 'rgba(243, 171, 71, 1)' },
    wizard: { start: 'rgba(184, 100, 199, 1)', end: 'rgba(145, 177, 234, 1)' },
    zombies: { start: 'rgba(234, 99, 99, 1)', end: 'rgba(255, 179, 179, 1)' },
    library: { start: 'rgba(0, 145, 234, 1)', end: 'rgba(244, 67, 54, 1)' }
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
        micBtn.classList.remove('muted');
        updateMicIcon();
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
    micBtn.classList.add('muted');
    updateMicIcon();
    updateGauge(0);
}

function updateMicIcon() {
    const micIcon = document.getElementById('micIcon');
    if (!micIcon) return;
    
    if (audioState.isListening) {
        // Normal mic icon
        micIcon.innerHTML = '<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />';
    } else {
        // Muted mic icon with slash
        micIcon.innerHTML = '<path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.48L5.84 2.7C6.89 1.86 8.02 1.5 9 1.5c3.59 0 6.18 3.41 6.18 6.72h2c0-3.28-2.59-6.72-6.18-6.72-.88 0-1.73.16-2.51.45l2.49 2.49c.06 0 .11.02.17.02zm7.12.33l-1.23-1.23c.27-.62.43-1.31.43-2.05H19c0 1.19-.34 2.3-.9 3.28zM2.1 3.51L3.51 2.1 21.9 20.49l-1.41 1.41L2.1 3.51zM12 19c-3.59 0-6.18-3.41-6.18-6.72H3.82c0 3.28 2.59 6.72 6.18 6.72zm0-10c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />';
    }
}

function analyzeAudio() {
    if (!audioState.isListening) return;
    
    const dataArray = new Uint8Array(audioState.analyser.frequencyBinCount);
    audioState.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedVolume = average / 255;
    
    const volumePercent = Math.min(100, normalizedVolume * 200);
    updateGauge(volumePercent);
    
    const isNoiseHigh = volumePercent > parseInt(sensitivitySlider.value);
    
    // Calculate intensity for noise effects
    const threshold = parseInt(sensitivitySlider.value);
    const excessNoise = Math.max(0, volumePercent - threshold);
    const maxExcess = 100 - threshold;
    const intensity = Math.min(1, excessNoise / maxExcess);
    
    // Update balls system with noise intensity
    if (ballsSystem) {
        ballsSystem.currentNoiseIntensity = intensity;
    }
    
    // Toggle visual effect layer with intensity based on noise level
    if (noiseEffectLayer) {
        if (isNoiseHigh) {
            noiseEffectLayer.classList.add('active');
            updateNoiseEffectIntensity(intensity);
        } else {
            noiseEffectLayer.classList.remove('active');
        }
    }
    
    // Handle video state continuously for all themes
    const currentTheme = document.body.getAttribute('data-theme');
    if (THEME_VIDEOS[currentTheme]) {
        if (isNoiseHigh) {
            keepVideoAtAlert();
        } else {
            releaseVideoFromAlert();
        }
    }
    
    if (isNoiseHigh) {
        const now = Date.now();
        if (now - audioState.lastAlertTime > CONFIG.alertCooldown) {
            triggerNoiseAlert();
            audioState.lastAlertTime = now;
        }
    }
    
    requestAnimationFrame(analyzeAudio);
}

function updateNoiseEffectIntensity(intensity) {
    // intensity ranges from 0 to 1
    // 0 = just above threshold (subtle)
    // 1 = max noise (intense)
    
    const ripples = document.querySelectorAll('.ripple');
    const soundWaves = document.querySelectorAll('.sound-wave');
    const waveGroups = document.querySelectorAll('.wave-group');
    
    // Scale ripple expansion based on intensity - MAXIMUM INTENSITY
    const minRippleScale = 2;
    const maxRippleScale = 4;
    const rippleScale = minRippleScale + (maxRippleScale - minRippleScale) * intensity;
    
    // Scale ripple opacity based on intensity
    const minRippleOpacity = 0.8;
    const maxRippleOpacity = 1;
    const rippleOpacity = minRippleOpacity + (maxRippleOpacity - minRippleOpacity) * intensity;
    
    ripples.forEach(ripple => {
        ripple.style.setProperty('--ripple-scale', rippleScale);
        ripple.style.setProperty('--ripple-opacity', rippleOpacity);
    });
    
    // Scale sound wave heights and animation speed - MAXIMUM INTENSITY
    const minWaveScale = 2;
    const maxWaveScale = 5;
    const waveScale = minWaveScale + (maxWaveScale - minWaveScale) * intensity;
    
    // Faster animation at 45%+ intensity
    const minAnimationDuration = 1.2;
    const maxAnimationDuration = intensity > 0.45 ? 0.08 : 0.15;
    const animationDuration = minAnimationDuration - (minAnimationDuration - maxAnimationDuration) * intensity;
    
    soundWaves.forEach(wave => {
        wave.style.setProperty('--wave-scale', waveScale);
        wave.style.setProperty('--animation-duration', animationDuration + 's');
    });
    
    // Show multiple wave groups based on intensity - AGGRESSIVE AT 45%+
    // 0-0.2: 1 group, 0.2-0.35: 2 groups, 0.35-0.45: 3 groups, 0.45-1: 4 groups (all)
    let groupsToShow = 1;
    if (intensity > 0.2) groupsToShow = 2;
    if (intensity > 0.35) groupsToShow = 3;
    if (intensity > 0.45) groupsToShow = 4;
    
    // Stagger group animations - much more frequent at 45%+
    // At 45%+: super fast cascading (0.02s), at lower: slower
    const groupStaggerBase = intensity > 0.45 
        ? 0.02 
        : 0.12 - (intensity * 0.1); // From 0.12s down to 0.02s
    
    // At 45%+: pulse every 0.3s, below 45%: slower pulse
    const pulseDuration = intensity > 0.45 ? 0.3 : 0.6;
    
    waveGroups.forEach((group, index) => {
        if (index < groupsToShow) {
            // Each group starts at a staggered time
            const staggerDelay = (index * groupStaggerBase).toFixed(3);
            group.style.setProperty('--group-animation-delay', staggerDelay + 's');
            group.style.setProperty('--group-pulse-duration', pulseDuration + 's');
        } else {
            group.style.setProperty('--group-pulse-duration', pulseDuration + 's');
        }
    });
    
    // Update effect layer opacity for extra intensity
    const minLayerOpacity = 0.5;
    const maxLayerOpacity = 1;
    const layerOpacity = minLayerOpacity + (maxLayerOpacity - minLayerOpacity) * intensity;
    noiseEffectLayer.style.opacity = layerOpacity;
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
    
    // Play alert sound if enabled
    playAlertSound(soundState.alertSound);
    
    robotWrapper.classList.remove('studying');
    robotWrapper.classList.add('alert');
    
    // Handle video alert state for all video themes
    if (THEME_VIDEOS[currentTheme]) {
        setVideoAlertState(true);
    } else {
        updateRobotImage(currentTheme, true);
    }
    
    setTimeout(() => {
        robotWrapper.classList.remove('alert');
        if (THEME_VIDEOS[currentTheme]) {
            setVideoAlertState(false);
        } else {
            updateRobotImage(currentTheme, false);
        }
        if (timerState.isRunning) {
            robotWrapper.classList.add('studying');
        }
    }, CONFIG.speechBubbleDuration);
}

function showSpeechBubble(message) {
    speechText.textContent = message;
    speechBubble.classList.add('show');
    setTimeout(() => speechBubble.classList.remove('show'), CONFIG.speechBubbleDuration);
}

function playAlertSound(soundType) {
    if (soundType === 'none') return;
    
    const soundFiles = {
        'bell': 'assets/sounds/bell.wav',
        'shush': 'assets/sounds/shush.mp3'
    };
    
    const soundFile = soundFiles[soundType];
    if (!soundFile) return;
    
    const audio = new Audio(soundFile);
    audio.volume = 0.3;
    audio.play().catch(err => {
        console.error('Failed to play alert sound:', err);
    });
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

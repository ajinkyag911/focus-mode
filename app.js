/**
 * ============================================
 * FOCUS MODE - MAIN APPLICATION
 * ============================================
 * 
 * This file contains all the JavaScript logic for the Focus Mode app.
 * It handles:
 * - Countdown timer functionality
 * - Noise detection using the microphone
 * - Speech bubble alerts with random messages
 * - YouTube background music player
 * - Dark/Light mode toggle
 * - Local storage for saving preferences
 * 
 * The code is organized into sections with comments explaining
 * what each part does. Perfect for learning!
 */

// ========== CONFIGURATION ========== //
/**
 * App configuration settings.
 * Change these values to customize the behavior.
 */
const CONFIG = {
    // Default timer duration in minutes
    defaultMinutes: 25,
    
    // Noise detection sensitivity (0-1, lower = more sensitive)
    // 0.1 means sounds at 10% of max volume will trigger alert
    noiseSensitivity: 0.15,
    
    // How long the speech bubble stays visible (milliseconds)
    speechBubbleDuration: 3000,
    
    // Minimum time between noise alerts (milliseconds)
    // Prevents spam when there's constant noise
    alertCooldown: 5000,
    
    // Default YouTube video for background music (lofi hip hop radio)
    defaultMusicUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
};


// ========== RANDOM MESSAGES ========== //
/**
 * Array of messages the robot can say when noise is detected.
 * Add or remove messages as you like!
 */
const QUIET_MESSAGES = [
    "Shhh! 🤫",
    "Quiet please!",
    "Let's focus! 📚",
    "Study time! 🧠",
    "Whisper voices!",
    "Indoor voices! 🙊",
    "Too noisy!",
    "Shhhhh...",
    "Focus mode! 🎯",
    "Keep it down!",
    "Quiet zone! 🔇",
    "Let's be quiet!",
    "Working here! 💼",
    "Silence please!",
    "🤫 Shh!",
    "Studying! 📖",
    "Too loud! 🔊",
    "Peace & quiet!",
    "Hush! 🤭"
];


// ========== DOM ELEMENTS ========== //
/**
 * Get references to all the HTML elements we need to interact with.
 * We store these in variables so we don't have to look them up every time.
 * 
 * document.getElementById() finds an element by its id attribute.
 */

// Timer elements
const timerDisplay = document.getElementById('timerDisplay');
const timerInputContainer = document.getElementById('timerInputContainer');
const minutesInput = document.getElementById('minutesInput');

// Robot elements
const robotImage = document.getElementById('robotImage');
const speechBubble = document.getElementById('speechBubble');
const speechText = document.getElementById('speechText');

// Dock buttons
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const micBtn = document.getElementById('micBtn');
const musicBtn = document.getElementById('musicBtn');
const themeBtn = document.getElementById('themeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Noise indicator
const noiseIndicator = document.getElementById('noiseIndicator');
const noiseLevel = document.getElementById('noiseLevel');

// Music modal
const musicModal = document.getElementById('musicModal');
const closeMusicModal = document.getElementById('closeMusicModal');
const youtubeUrl = document.getElementById('youtubeUrl');
const playMusicBtn = document.getElementById('playMusicBtn');
const stopMusicBtn = document.getElementById('stopMusicBtn');
const youtubePlayer = document.getElementById('youtubePlayer');
const youtubePlayerContainer = document.getElementById('youtubePlayerContainer');


// ========== APP STATE ========== //
/**
 * Variables to track the current state of the application.
 * These change as the user interacts with the app.
 */
let timerState = {
    totalSeconds: CONFIG.defaultMinutes * 60,  // Total seconds remaining
    isRunning: false,                           // Is the timer currently running?
    intervalId: null                            // Reference to the timer interval
};

let audioState = {
    isListening: false,       // Is the microphone active?
    audioContext: null,       // Web Audio API context
    analyser: null,           // Audio analyser for volume detection
    mediaStream: null,        // Microphone stream
    lastAlertTime: 0          // Timestamp of last noise alert
};

let musicState = {
    isPlaying: false,         // Is music currently playing?
    currentUrl: CONFIG.defaultMusicUrl  // Current YouTube URL
};


// ========== INITIALIZATION ========== //
/**
 * Initialize the app when the page loads.
 * This function runs once when the page is first opened.
 */
function init() {
    // Load saved preferences from localStorage
    loadPreferences();
    
    // Update the timer display with initial value
    updateTimerDisplay();
    
    // Set up event listeners for all buttons
    setupEventListeners();
    
    // Log that the app is ready (helpful for debugging)
    console.log('🤖 Focus Mode initialized!');
}

/**
 * Load user preferences from localStorage.
 * localStorage allows us to save data that persists even after the browser is closed.
 */
function loadPreferences() {
    // Check if dark mode was previously enabled
    const darkMode = localStorage.getItem('focusMode_darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
    
    // Load saved timer duration
    const savedMinutes = localStorage.getItem('focusMode_minutes');
    if (savedMinutes) {
        minutesInput.value = savedMinutes;
        timerState.totalSeconds = parseInt(savedMinutes) * 60;
    }
    
    // Load saved YouTube URL
    const savedUrl = localStorage.getItem('focusMode_musicUrl');
    if (savedUrl) {
        youtubeUrl.value = savedUrl;
        musicState.currentUrl = savedUrl;
    }
}

/**
 * Save a preference to localStorage.
 * @param {string} key - The key to save under
 * @param {any} value - The value to save
 */
function savePreference(key, value) {
    localStorage.setItem(`focusMode_${key}`, value);
}


// ========== EVENT LISTENERS ========== //
/**
 * Set up all the click handlers for buttons.
 * Event listeners wait for user actions and call our functions.
 */
function setupEventListeners() {
    // Timer controls
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Update timer when input changes
    minutesInput.addEventListener('change', () => {
        const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
        timerState.totalSeconds = minutes * 60;
        updateTimerDisplay();
        savePreference('minutes', minutes);
    });
    
    // Microphone toggle
    micBtn.addEventListener('click', toggleMicrophone);
    
    // Music button - opens modal
    musicBtn.addEventListener('click', () => {
        musicModal.classList.add('show');
    });
    
    // Close music modal
    closeMusicModal.addEventListener('click', () => {
        musicModal.classList.remove('show');
    });
    
    // Click outside modal to close
    musicModal.addEventListener('click', (e) => {
        if (e.target === musicModal) {
            musicModal.classList.remove('show');
        }
    });
    
    // Music controls
    playMusicBtn.addEventListener('click', playMusic);
    stopMusicBtn.addEventListener('click', stopMusic);
    
    // Theme toggle
    themeBtn.addEventListener('click', toggleTheme);
    
    // Fullscreen toggle
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

/**
 * Handle keyboard shortcuts for quick access.
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyboard(e) {
    // Don't trigger if user is typing in an input field
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key.toLowerCase()) {
        case ' ':  // Spacebar - start/pause
            e.preventDefault();
            timerState.isRunning ? pauseTimer() : startTimer();
            break;
        case 'r':  // R - reset
            resetTimer();
            break;
        case 'm':  // M - toggle mic
            toggleMicrophone();
            break;
        case 'd':  // D - toggle dark mode
            toggleTheme();
            break;
        case 'f':  // F - fullscreen
            toggleFullscreen();
            break;
        case 'escape':  // Escape - close modal
            musicModal.classList.remove('show');
            break;
    }
}


// ========== TIMER FUNCTIONS ========== //
/**
 * Start the countdown timer.
 * Uses setInterval to call a function every 1000ms (1 second).
 */
function startTimer() {
    // Don't start if already running
    if (timerState.isRunning) return;
    
    // Get the current input value
    if (!timerState.isRunning && timerState.intervalId === null) {
        const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
        timerState.totalSeconds = minutes * 60;
    }
    
    timerState.isRunning = true;
    
    // Hide the input, show we're running
    timerInputContainer.classList.add('hidden');
    
    // Update button states
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Start the countdown - this runs every second
    timerState.intervalId = setInterval(() => {
        timerState.totalSeconds--;
        updateTimerDisplay();
        
        // Check if timer has finished
        if (timerState.totalSeconds <= 0) {
            timerComplete();
        }
    }, 1000);
    
    console.log('⏱️ Timer started!');
}

/**
 * Pause the timer.
 * Stops the interval but keeps the current time.
 */
function pauseTimer() {
    if (!timerState.isRunning) return;
    
    timerState.isRunning = false;
    
    // Stop the interval
    clearInterval(timerState.intervalId);
    
    // Update button states
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    console.log('⏸️ Timer paused');
}

/**
 * Reset the timer to the initial value.
 * Stops everything and goes back to the beginning.
 */
function resetTimer() {
    // Stop the timer if running
    timerState.isRunning = false;
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    
    // Reset to input value
    const minutes = parseInt(minutesInput.value) || CONFIG.defaultMinutes;
    timerState.totalSeconds = minutes * 60;
    
    // Show the input again
    timerInputContainer.classList.remove('hidden');
    
    // Update display and buttons
    updateTimerDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    console.log('🔄 Timer reset');
}

/**
 * Called when the timer reaches zero.
 * Shows an alert and resets the timer.
 */
function timerComplete() {
    pauseTimer();
    
    // Show a completion message
    showSpeechBubble("Time's up! 🎉");
    
    // Play a sound if available (browser notification sound)
    try {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 500);
    } catch (e) {
        console.log('Could not play completion sound');
    }
    
    console.log('✅ Timer complete!');
}

/**
 * Update the timer display to show current time.
 * Converts total seconds into MM:SS format.
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timerState.totalSeconds / 60);
    const seconds = timerState.totalSeconds % 60;
    
    // padStart adds leading zeros (e.g., "5" becomes "05")
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerDisplay.textContent = display;
}


// ========== NOISE DETECTION ========== //
/**
 * Toggle the microphone on/off.
 * When on, listens for noise and triggers alerts.
 */
async function toggleMicrophone() {
    if (audioState.isListening) {
        stopListening();
    } else {
        await startListening();
    }
}

/**
 * Start listening to the microphone.
 * Uses the Web Audio API to analyze audio levels.
 */
async function startListening() {
    try {
        // Request microphone permission
        // This will show a browser popup asking the user for permission
        audioState.mediaStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true,
            video: false 
        });
        
        // Create audio context and analyser
        audioState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioState.analyser = audioState.audioContext.createAnalyser();
        
        // Connect the microphone to the analyser
        const source = audioState.audioContext.createMediaStreamSource(audioState.mediaStream);
        source.connect(audioState.analyser);
        
        // Configure the analyser
        audioState.analyser.fftSize = 256;  // Size of analysis
        audioState.analyser.smoothingTimeConstant = 0.8;  // Smooth the readings
        
        audioState.isListening = true;
        
        // Update UI
        micBtn.classList.add('active');
        micBtn.querySelector('.dock-tooltip').textContent = 'Mic Off';
        noiseIndicator.classList.add('show');
        
        // Start analyzing audio
        analyzeAudio();
        
        console.log('🎤 Microphone activated');
        
    } catch (error) {
        console.error('Microphone access denied:', error);
        alert('Microphone access is needed for noise detection. Please allow microphone access and try again.');
    }
}

/**
 * Stop listening to the microphone.
 * Clean up audio resources.
 */
function stopListening() {
    audioState.isListening = false;
    
    // Stop all audio tracks
    if (audioState.mediaStream) {
        audioState.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    // Close the audio context
    if (audioState.audioContext) {
        audioState.audioContext.close();
    }
    
    // Update UI
    micBtn.classList.remove('active');
    micBtn.querySelector('.dock-tooltip').textContent = 'Mic On';
    noiseIndicator.classList.remove('show');
    noiseLevel.style.width = '0%';
    
    console.log('🔇 Microphone deactivated');
}

/**
 * Continuously analyze audio levels.
 * This function calls itself repeatedly using requestAnimationFrame.
 */
function analyzeAudio() {
    if (!audioState.isListening) return;
    
    // Get audio data
    const dataArray = new Uint8Array(audioState.analyser.frequencyBinCount);
    audioState.analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume (0-255)
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    // Convert to percentage (0-100)
    const volumePercent = Math.min(100, (average / 128) * 100);
    
    // Update noise level indicator
    noiseLevel.style.width = volumePercent + '%';
    
    // Check if noise exceeds threshold
    const normalizedVolume = average / 255;  // 0-1 range
    
    if (normalizedVolume > CONFIG.noiseSensitivity) {
        // Check cooldown to prevent spam
        const now = Date.now();
        if (now - audioState.lastAlertTime > CONFIG.alertCooldown) {
            triggerNoiseAlert();
            audioState.lastAlertTime = now;
        }
    }
    
    // Continue analyzing on next frame
    requestAnimationFrame(analyzeAudio);
}

/**
 * Trigger a noise alert.
 * Shows the speech bubble with a random message.
 */
function triggerNoiseAlert() {
    // Get a random message from our array
    const randomIndex = Math.floor(Math.random() * QUIET_MESSAGES.length);
    const message = QUIET_MESSAGES[randomIndex];
    
    // Show the speech bubble
    showSpeechBubble(message);
    
    // Make the robot shake
    robotImage.classList.add('alert');
    setTimeout(() => {
        robotImage.classList.remove('alert');
    }, 500);
    
    console.log('🔊 Noise detected! Robot says:', message);
}


// ========== SPEECH BUBBLE ========== //
/**
 * Show the speech bubble with a message.
 * @param {string} message - The message to display
 */
function showSpeechBubble(message) {
    // Set the message text
    speechText.textContent = message;
    
    // Show the bubble
    speechBubble.classList.add('show');
    
    // Hide after duration
    setTimeout(() => {
        speechBubble.classList.remove('show');
    }, CONFIG.speechBubbleDuration);
}


// ========== MUSIC PLAYER ========== //
/**
 * Play background music from YouTube.
 * Extracts the video ID and creates an embed URL.
 */
function playMusic() {
    const url = youtubeUrl.value.trim();
    
    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }
    
    // Extract video ID from various YouTube URL formats
    const videoId = extractYoutubeId(url);
    
    if (!videoId) {
        alert('Invalid YouTube URL. Please enter a valid YouTube video or livestream link.');
        return;
    }
    
    // Create embed URL with autoplay
    // The ?autoplay=1 makes it start automatically
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
    
    // Set the iframe source
    youtubePlayer.src = embedUrl;
    
    // Update state
    musicState.isPlaying = true;
    musicState.currentUrl = url;
    
    // Save to preferences
    savePreference('musicUrl', url);
    
    // Show playing indicator
    youtubePlayerContainer.classList.add('show');
    musicBtn.classList.add('active');
    
    console.log('🎵 Playing music:', videoId);
}

/**
 * Stop the background music.
 */
function stopMusic() {
    // Clear the iframe source to stop playback
    youtubePlayer.src = '';
    
    musicState.isPlaying = false;
    
    // Hide playing indicator
    youtubePlayerContainer.classList.remove('show');
    musicBtn.classList.remove('active');
    
    console.log('🔇 Music stopped');
}

/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch, youtu.be, youtube.com/embed, youtube.com/live
 * 
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The video ID or null if invalid
 */
function extractYoutubeId(url) {
    // Regular expression to match YouTube video IDs
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,  // Standard URL
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,              // Short URL
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,   // Embed URL
        /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,    // Live URL
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/        // Old format
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}


// ========== THEME TOGGLE ========== //
/**
 * Toggle between light and dark mode.
 */
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    
    // Update the theme icon
    updateThemeIcon(isDark);
    
    // Save preference
    savePreference('darkMode', isDark);
    
    console.log(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
}

/**
 * Update the theme toggle icon.
 * @param {boolean} isDark - Whether dark mode is active
 */
function updateThemeIcon(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    const tooltip = themeBtn.querySelector('.dock-tooltip');
    
    if (isDark) {
        // Show sun icon in dark mode (clicking will switch to light)
        themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
        tooltip.textContent = 'Light Mode';
    } else {
        // Show moon icon in light mode (clicking will switch to dark)
        themeIcon.innerHTML = '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
        tooltip.textContent = 'Dark Mode';
    }
}


// ========== FULLSCREEN ========== //
/**
 * Toggle fullscreen mode.
 * Uses the Fullscreen API to enter/exit fullscreen.
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen not supported:', err);
        });
    } else {
        // Exit fullscreen
        document.exitFullscreen();
    }
}


// ========== START THE APP ========== //
/**
 * Wait for the page to fully load, then initialize the app.
 * DOMContentLoaded fires when the HTML is parsed (before images load).
 */
document.addEventListener('DOMContentLoaded', init);

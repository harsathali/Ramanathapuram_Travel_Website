/**
 * Ramanathapuram Tourism Portal — Cinematic Ocean Ambient Audio Engine & UI Acoustics
 * Pure Web Audio API Procedural Synthesis + Continuous Ocean Ambience + Micro UI Acoustics
 * 
 * Generates an organic, continuous, deep Indian Ocean coastal surf atmosphere
 * with zero external dependencies, zero looping clicks, and subtle interaction audio.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'ramnad_ocean_ambience_pref';
    const SESSION_KEY = 'ramnad_ocean_ambience_session';

    // Global audio namespace
    window.RamnadAudio = {
        ctx: null,
        isPlaying: false,
        isMuted: false,
        targetVolume: 0.38, // Louder, deeper, full coastal presence
        lastInteractionTime: 0,
        init: initAudioEngine,
        toggle: toggleAmbience,
        play: startAmbience,
        pause: stopAmbience,
        playTransitionSound: playTransitionSound,
        playClickSound: playClickSound
    };

    // Internal Web Audio nodes
    let audioCtx = null;
    let masterGain = null;
    let noiseSource = null;
    let waveLfo1 = null;
    let waveLfo2 = null;
    let isInitialized = false;

    /**
     * Initialize Web Audio Context and Multi-Layer Synthesis Graph
     */
    function initAudioEngine() {
        if (isInitialized) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.info('[RamnadAudio] Web Audio API not supported on this browser.');
            return;
        }

        try {
            audioCtx = new AudioContextClass();
            window.RamnadAudio.ctx = audioCtx;

            // Master Gain (Controlled via floating AUDIO button)
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);

            // Create procedural deep Indian Ocean surf generator
            createProceduralOceanAmbience(audioCtx, masterGain);

            isInitialized = true;

            // Default on initial website load is ON, unless explicitly set to disabled
            const savedPref = localStorage.getItem(STORAGE_KEY);
            if (savedPref !== 'disabled') {
                // Immediate autoplay attempt when website opens
                attemptImmediateAutoplay();
            } else {
                window.RamnadAudio.isMuted = true;
                window.RamnadAudio.isPlaying = false;
                updateToggleUI(false);
            }
        } catch (err) {
            console.warn('[RamnadAudio] Unable to initialize audio context:', err);
        }
    }

    /**
     * Enhanced Multi-Layer Procedural Ocean Ambience Synthesizer
     * 
     * Synthesizes 3 parallel coastal layers:
     * 1. Deep Oceanic Body (Brownian undertow, 45-120Hz warmth)
     * 2. Rhythmic Rolling Swell (Lowpass modulated by LFO1 ~0.075Hz = 13.3s wave period)
     * 3. Shoreline Foam Wash & Surf Shimmer (Stereo decorrelated bandpass modulated by LFO2)
     */
    function createProceduralOceanAmbience(ctx, outputNode) {
        // 1. Generate a 6-second seamless stereo Brownian/Pink noise buffer
        const bufferSize = ctx.sampleRate * 6;
        const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        const leftChannel = noiseBuffer.getChannelData(0);
        const rightChannel = noiseBuffer.getChannelData(1);

        let lastOutL = 0.0;
        let lastOutR = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const whiteL = Math.random() * 2 - 1;
            const whiteR = Math.random() * 2 - 1;

            // Smooth Brownian integration for deep, natural coastal undertones
            lastOutL = (lastOutL + (0.022 * whiteL)) / 1.022;
            lastOutR = (lastOutR + (0.022 * whiteR)) / 1.022;

            leftChannel[i] = lastOutL * 3.8;
            rightChannel[i] = lastOutR * 3.8;
        }

        noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        // --- LAYER 1: Deep Ocean Sub-Swell Undertow (Deep & Full) ---
        const subLowpass = ctx.createBiquadFilter();
        subLowpass.type = 'lowpass';
        subLowpass.frequency.value = 110;
        subLowpass.Q.value = 1.4;

        const subGain = ctx.createGain();
        subGain.gain.value = 0.42;

        // --- LAYER 2: Rolling Wave Swell (Modulated Mid-Body) ---
        const midHighpass = ctx.createBiquadFilter();
        midHighpass.type = 'highpass';
        midHighpass.frequency.value = 75;

        const swellLowpass = ctx.createBiquadFilter();
        swellLowpass.type = 'lowpass';
        swellLowpass.frequency.value = 340;
        swellLowpass.Q.value = 1.8;

        const swellGain = ctx.createGain();
        swellGain.gain.value = 0.48;

        // Primary Wave LFO (Slow Indian Ocean rhythmic swell cycle ~0.075 Hz = ~13.3s period)
        waveLfo1 = ctx.createOscillator();
        waveLfo1.type = 'sine';
        waveLfo1.frequency.value = 0.075;

        const waveLfo1FreqMod = ctx.createGain();
        waveLfo1FreqMod.gain.value = 260; // Frequency modulation sweep
        waveLfo1.connect(waveLfo1FreqMod);
        waveLfo1FreqMod.connect(swellLowpass.frequency);

        const waveLfo1AmpMod = ctx.createGain();
        waveLfo1AmpMod.gain.value = 0.35; // Amplitude swell sweep
        waveLfo1.connect(waveLfo1AmpMod);
        waveLfo1AmpMod.connect(swellGain.gain);

        // --- LAYER 3: Shoreline Wash & Distant Surf Shimmer (Spacious & Natural) ---
        const surfBandpass = ctx.createBiquadFilter();
        surfBandpass.type = 'bandpass';
        surfBandpass.frequency.value = 460;
        surfBandpass.Q.value = 0.95;

        const surfGain = ctx.createGain();
        surfGain.gain.value = 0.32;

        // Secondary Organic Wavelet LFO (0.125 Hz = ~8.0s offset wash)
        waveLfo2 = ctx.createOscillator();
        waveLfo2.type = 'sine';
        waveLfo2.frequency.value = 0.125;

        const waveLfo2FreqMod = ctx.createGain();
        waveLfo2FreqMod.gain.value = 140;
        waveLfo2.connect(waveLfo2FreqMod);
        waveLfo2FreqMod.connect(surfBandpass.frequency);

        const waveLfo2AmpMod = ctx.createGain();
        waveLfo2AmpMod.gain.value = 0.22;
        waveLfo2.connect(waveLfo2AmpMod);
        waveLfo2AmpMod.connect(surfGain.gain);

        // Wiring the procedural ocean graph:
        // Noise -> SubLowpass -> SubGain -> Output
        noiseSource.connect(subLowpass);
        subLowpass.connect(subGain);
        subGain.connect(outputNode);

        // Noise -> MidHighpass -> SwellLowpass -> SwellGain -> Output
        noiseSource.connect(midHighpass);
        midHighpass.connect(swellLowpass);
        swellLowpass.connect(swellGain);
        swellGain.connect(outputNode);

        // Noise -> SurfBandpass -> SurfGain -> Output
        noiseSource.connect(surfBandpass);
        surfBandpass.connect(surfGain);
        surfGain.connect(outputNode);

        // Start infinite procedural synthesis sources
        noiseSource.start(0);
        waveLfo1.start(0);
        waveLfo2.start(0);
    }

    /**
     * Immediate Autoplay Attempt when website opens
     */
    function attemptImmediateAutoplay() {
        if (!audioCtx) return;

        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                startAmbience();
            }).catch(() => {
                // Autoplay blocked by browser security policy.
                // Prepare immediate resume on the very first user gesture.
                prepareAutoResume();
            });
        } else {
            startAmbience();
        }
    }

    /**
     * Start / Smoothly Fade In Ocean Ambience (500–1200ms)
     */
    function startAmbience() {
        if (!isInitialized) initAudioEngine();
        if (!audioCtx || !masterGain) return;

        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                executeFadeIn();
            }).catch(() => {
                prepareAutoResume();
            });
            return;
        }

        executeFadeIn();
    }

    function executeFadeIn() {
        const now = audioCtx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(window.RamnadAudio.targetVolume, now + 1.0);

        window.RamnadAudio.isPlaying = true;
        window.RamnadAudio.isMuted = false;
        localStorage.setItem(STORAGE_KEY, 'enabled');
        sessionStorage.setItem(SESSION_KEY, 'enabled');

        updateToggleUI(true);
    }

    /**
     * Stop / Smoothly Fade Out Ocean Ambience
     */
    function stopAmbience() {
        if (!audioCtx || !masterGain) return;

        const now = audioCtx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);

        window.RamnadAudio.isPlaying = false;
        window.RamnadAudio.isMuted = true;
        localStorage.setItem(STORAGE_KEY, 'disabled');
        sessionStorage.setItem(SESSION_KEY, 'disabled');

        updateToggleUI(false);
    }

    /**
     * Toggle Ambience ON / OFF
     */
    function toggleAmbience() {
        if (window.RamnadAudio.isPlaying && !window.RamnadAudio.isMuted) {
            stopAmbience();
        } else {
            startAmbience();
        }
    }

    /**
     * Subtle Coastal Swell for Page Transitions (~350ms)
     */
    function playTransitionSound() {
        const nowTime = Date.now();
        if (nowTime - window.RamnadAudio.lastInteractionTime < 260) return; // Debounce
        window.RamnadAudio.lastInteractionTime = nowTime;

        if (!audioCtx || audioCtx.state !== 'running' || window.RamnadAudio.isMuted) return;

        try {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.36);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.038, now + 0.12);
            gain.gain.linearRampToValueAtTime(0.0001, now + 0.36);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.38);
        } catch (e) {
            // Silently ignore interaction sound failure
        }
    }

    /**
     * Soft, Warm, Premium UI Click Audio (~36ms)
     * Centralized micro-acoustic feedback for meaningful interactions
     */
    function playClickSound() {
        if (!audioCtx || audioCtx.state !== 'running' || window.RamnadAudio.isMuted) return;

        try {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(480, now);
            osc.frequency.exponentialRampToValueAtTime(240, now + 0.035);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(650, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.032, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.036);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.038);
        } catch (e) {
            // Silently ignore click acoustic failure
        }
    }

    /**
     * Update UI Floating AUDIO Button
     */
    function updateToggleUI(isActive) {
        const toggleBtns = document.querySelectorAll('.floating-audio-pill');
        toggleBtns.forEach(btn => {
            btn.classList.toggle('audio-active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

            const labelEl = btn.querySelector('.audio-pill-label');
            if (labelEl) {
                labelEl.textContent = 'AUDIO';
            }

            const icon = btn.querySelector('i');
            if (icon) {
                if (isActive) {
                    icon.className = 'fa-solid fa-volume-high';
                } else {
                    icon.className = 'fa-solid fa-volume-xmark';
                }
            }
        });
    }

    /**
     * Auto-resume on first legitimate user interaction if autoplay was blocked
     */
    function prepareAutoResume() {
        function onFirstInteraction() {
            if (localStorage.getItem(STORAGE_KEY) !== 'disabled') {
                startAmbience();
            }
            window.removeEventListener('click', onFirstInteraction);
            window.removeEventListener('touchstart', onFirstInteraction);
            window.removeEventListener('keydown', onFirstInteraction);
            window.removeEventListener('pointerdown', onFirstInteraction);
        }

        window.addEventListener('click', onFirstInteraction, { once: true });
        window.addEventListener('touchstart', onFirstInteraction, { once: true });
        window.addEventListener('keydown', onFirstInteraction, { once: true });
        window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    }

    /**
     * Centralized Click Acoustics & DOM Binding
     */
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize engine immediately
        initAudioEngine();

        // Attach click listeners to the floating AUDIO button
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.floating-audio-pill');
            if (btn) {
                e.preventDefault();
                toggleAmbience();
            }
        });

        // Attach centralized subtle click acoustic feedback for meaningful UI elements
        // (Excludes floating AUDIO button to avoid unnecessary sound)
        document.addEventListener('click', (e) => {
            const interactiveEl = e.target.closest(
                '.nav-link, .mobile-nav-link, .dropdown-item a, .btn, .theme-toggle-btn, #back-to-top, .btn-go-home, .lightbox-btn, .hamburger-btn, .mobile-close-btn, button[type="submit"], input[type="submit"]'
            );
            if (interactiveEl && !interactiveEl.closest('.floating-audio-pill')) {
                playClickSound();
            }
        }, { passive: true });

        // Sync initial UI based on saved preference
        const savedPref = localStorage.getItem(STORAGE_KEY);
        updateToggleUI(savedPref !== 'disabled');

        // Hook into internal navigation links for page transition audio
        const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])');
        internalLinks.forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                if (href && (href.endsWith('.html') || href.endsWith('/'))) {
                    playTransitionSound();
                }
            });
        });
    });

})();

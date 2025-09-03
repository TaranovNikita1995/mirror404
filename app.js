document.addEventListener('DOMContentLoaded', () => {

    // MIRROR404: CONFIGURATION OBJECT
    const M404_CONFIG = {
        BASE_ADMIT_COUNT: 14582,
        ADMIT_COOLDOWN_MS: 30_000,
        WATCH_LOOPS: ['loops/loop1.mp4', 'loops/loop2.mp4', 'loops/loop3.mp4'],
        DIARY_JSON_URL: './data/diary.json',
        FALLBACK_DIARY: [{ date: "XXXX-XX-XX", title: "ОШИБКА ЗАГРУЗКИ АРХИВА", body: "Файл data/diary.json не найден. Архив повреждён или отсутствует." }],
        EASTER_EGG_CODES: { '13:13': '#room-1313', 'sellSoul': '#room-sell', 'zero': '#room-zero' },
        AMBIENT_SOUNDS: {
            whisper: ['audio/whisper1.mp3', 'audio/whisper2.mp3'],
            noise: ['audio/noise1.mp3', 'audio/noise2.mp3']
        }
    };

    // MIRROR404: Error handling utils
    const M404_Errors = {
        log: (error, context = '') => console.error(`MIRROR404 Error [${context}]:`, error),
        wrap: (fn, context) => (...args) => { try { return fn(...args); } catch (e) { M404_Errors.log(e, context); } }
    };
    
    // MIRROR404: Module loader
    const M404_Modules = {
        core: [initAudio, initAgeGate, initIntroVideo],
        ui: [initBurgerMenu, initSmoothNav, initLogoSwap, initGsapAnimations],
        content: [initWatchCam, initDiary, initTestForm, initAdmitCounter],
        effects: [initCustomCursor, initMouseEffects, initTextDistortion, initAmbientSounds],
        easter: [initEasterEggs]
    };

    // MIRROR404: BOOT SEQUENCE
    function boot() {
        const audio = M404_Errors.wrap(M404_Modules.core[0], 'module:core:audio')();
        M404_Errors.wrap(M404_Modules.core[1], 'module:core:ageGate')(audio); // Pass audio controls to AgeGate
        M404_Errors.wrap(M404_Modules.core[2], 'module:core:introVideo')();
        
        // Initialize other modules after core logic
        Object.entries(M404_Modules).forEach(([key, modules]) => {
            if (key === 'core') return;
            modules.forEach(fn => M404_Errors.wrap(fn, `module:${key}`)());
        });
    }

    // --- MODULES ---

    function initAudio() { /* ... */ } // Placeholder, code is below
    function initAgeGate(audio) { /* ... */ } // Needs audio
    function initIntroVideo() { /* ... */ }
    function initBurgerMenu() { /* ... */ }
    function initSmoothNav() { /* ... */ }
    function initLogoSwap() { /* ... */ }
    function initTestForm() { /* ... */ }
    function initGsapAnimations() { /* ... */ }
    function initAdmitCounter() { /* ... */ }
    function initWatchCam() { /* ... */ }
    function initDiary() { /* ... */ }
    function initEasterEggs() { /* ... */ }
    function initCustomCursor() { /* ... */ }
    function initMouseEffects() { /* ... */ }
    function initTextDistortion() { /* ... */ }
    function initAmbientSounds() { /* ... */ }
    
    // --- IMPLEMENTATIONS ---

    initAudio = function() {
        const audio = { ambient: document.getElementById('audio-ambient'), hover: document.getElementById('audio-hover'), click: document.getElementById('audio-click') };
        if (audio.ambient) audio.ambient.volume = 0.15;
        const play = (sound) => { if (sound && sound.paused) { sound.currentTime = 0; sound.play().catch(() => {}); } };
        document.addEventListener('mouseover', e => { if (e.target.closest('a, button, .gate-check, input')) play(audio.hover); });
        document.addEventListener('click', e => { if (e.target.closest('a, button, .gate-check, input')) play(audio.click); });
        return audio;
    }

    initAgeGate = function(audio) {
        const dialog = document.getElementById('age-gate'); if (!dialog) return;
        if (sessionStorage.getItem('mirror404_age_ok') === '1') { audio?.ambient?.play(); return; }
        dialog.showModal();
        const grantAccess = () => {
            sessionStorage.setItem('mirror404_age_ok', '1'); audio?.ambient?.play();
            dialog.classList.add('fade-out');
            dialog.addEventListener('animationend', () => dialog.close(), { once: true });
        };
        const enterBtn = document.getElementById('enterGate');
        document.getElementById('chk18').addEventListener('change', (e) => enterBtn.disabled = !e.target.checked);
        enterBtn.addEventListener('click', grantAccess);
        document.getElementById('sellSoul').addEventListener('click', grantAccess);
        document.getElementById('declineGate').addEventListener('click', () => window.location.href = 'https://google.com');
    }

    initIntroVideo = function() { /* Unchanged */ }

    initBurgerMenu = function() { /* Unchanged */ }

    initSmoothNav = function() { /* Unchanged */ }

    initLogoSwap = function() { /* Unchanged */ }
    
    initTestForm = function() {
        const form = document.getElementById('testForm'); if (!form) return;
        const resultDiv = document.getElementById('testResult');
        document.getElementById('testSubmit').addEventListener('click', () => {
            const score = [...form.querySelectorAll('input:checked')].reduce((sum, c) => sum + Number(c.value), 0);
            resultDiv.textContent = score >= 80 ? `Допуск подтверждён (${score}/100).` : `Недостаточно (${score}/100).`;
            if (score >= 80) M404_Modules.easter.find(f => f.name === 'initAdmitCounter').increment();
        });
        document.getElementById('testOverride').addEventListener('click', () => {
            resultDiv.textContent = 'Сделка заключена.';
            M404_Modules.easter.find(f => f.name === 'initAdmitCounter').increment();
        });
        document.getElementById('testReset').addEventListener('click', () => resultDiv.textContent = '');
    }

    initGsapAnimations = function() { /* Unchanged */ }

    initAdmitCounter = function() {
        const admitCountSpan = document.getElementById('admitCount');
        let localInc = parseInt(localStorage.getItem('m404_admit_local_inc') || '0', 10);
        admitCountSpan.textContent = M404_CONFIG.BASE_ADMIT_COUNT + localInc;

        initAdmitCounter.increment = () => {
            const lastAdmitTs = parseInt(localStorage.getItem('m404_last_admit_ts') || '0', 10);
            if (Date.now() - lastAdmitTs < M404_CONFIG.ADMIT_COOLDOWN_MS) return;
            localInc++;
            localStorage.setItem('m404_admit_local_inc', String(localInc));
            localStorage.setItem('m404_last_admit_ts', String(Date.now()));
            admitCountSpan.textContent = M404_CONFIG.BASE_ADMIT_COUNT + localInc;
        };
    }
    
    initWatchCam = function() {
        const videoEl = document.getElementById('watchVideo'); const nextBtn = document.getElementById('watchNext');
        if (!videoEl || !nextBtn) return;
        let currentIndex = Math.floor(Math.random() * M404_CONFIG.WATCH_LOOPS.length);
        const setVideoSource = (index) => {
            videoEl.src = M404_CONFIG.WATCH_LOOPS[index];
            videoEl.classList.add('video-loading');
            videoEl.load();
            videoEl.play().catch(e => { videoEl.classList.remove('video-loading'); M404_Errors.log(e, 'watchCamPlay'); });
        };
        videoEl.addEventListener('loadeddata', () => videoEl.classList.remove('video-loading'));
        videoEl.addEventListener('error', () => { videoEl.classList.remove('video-loading'); M404_Errors.log('Failed to load video', M404_CONFIG.WATCH_LOOPS[currentIndex]); });
        nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % M404_CONFIG.WATCH_LOOPS.length; setVideoSource(currentIndex); });
        setVideoSource(currentIndex);
    }
    
    initDiary = function() {
        const listEl = document.getElementById('diaryList'); if (!listEl) return;
        listEl.innerHTML = `<div class="diary-loading" aria-live="polite">Загрузка дневника...</div>`;
        listEl.setAttribute('aria-busy', 'true');
        const renderEntries = (entries) => {
            listEl.setAttribute('aria-busy', 'false');
            listEl.innerHTML = entries.map(entry => `
                <article class="diary-item anim-stagger" aria-labelledby="diary-title-${entry.date.replace(/-/g, '')}">
                    <time class="diary-date" datetime="${entry.date}">${entry.date}</time>
                    <h3 class="diary-title" id="diary-title-${entry.date.replace(/-/g, '')}">${entry.title}</h3>
                    <p class="diary-body">${entry.body}</p>
                </article>
            `).join('');
        };
        fetch(M404_CONFIG.DIARY_JSON_URL)
            .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
            .then(data => renderEntries(data.entries))
            .catch(error => { renderEntries(M404_CONFIG.FALLBACK_DIARY); M404_Errors.log(error, 'diaryFetch'); });
    }
    
    initEasterEggs = function() {
        const form = document.getElementById('easterForm'); const input = document.getElementById('easterInput'); const resultEl = document.getElementById('easterResult');
        if (!form || !input) return;
        const codeHistory = []; const maxHistory = 5; let historyIndex = -1;
        form.addEventListener('submit', (e) => {
            e.preventDefault(); const code = input.value.trim();
            if (code) { codeHistory.unshift(code); if (codeHistory.length > maxHistory) codeHistory.pop(); }
            const targetId = M404_CONFIG.EASTER_EGG_CODES[code];
            document.querySelectorAll('.room-secret.open').forEach(room => { room.classList.remove('open'); room.setAttribute('aria-hidden', 'true'); });
            if (targetId) {
                const room = document.querySelector(targetId);
                if (room) {
                    room.classList.add('open'); room.setAttribute('aria-hidden', 'false');
                    resultEl.textContent = 'Доступ разрешён...'; resultEl.className = 'easter-result success';
                    setTimeout(() => room.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    if (targetId === '#room-sell') { const a = document.createElement('div'); a.className = 'soul-sell-effect'; document.body.appendChild(a); setTimeout(() => document.body.removeChild(a), 3000); }
                }
            } else {
                resultEl.textContent = 'Неверный код.'; resultEl.className = 'easter-result error';
                input.classList.add('error'); setTimeout(() => input.classList.remove('error'), 800);
            }
            input.value = ''; historyIndex = -1;
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' && codeHistory.length > 0) { e.preventDefault(); historyIndex = Math.min(historyIndex + 1, codeHistory.length - 1); input.value = codeHistory[historyIndex]; }
            else if (e.key === 'ArrowDown' && codeHistory.length > 0) { e.preventDefault(); historyIndex = Math.max(historyIndex - 1, -1); input.value = historyIndex < 0 ? '' : codeHistory[historyIndex]; }
        });
    }

    initAmbientSounds = function() {
        let lastPlayed = 0; const minDelay = 120000;
        function playRandomSound() {
            if (Date.now() - lastPlayed < minDelay) { setTimeout(playRandomSound, minDelay); return; }
            const soundType = Math.random() > 0.7 ? 'noise' : 'whisper';
            const soundFiles = M404_CONFIG.AMBIENT_SOUNDS[soundType];
            if (!soundFiles || soundFiles.length === 0) return;
            const soundFile = soundFiles[Math.floor(Math.random() * soundFiles.length)];
            const audio = new Audio(soundFile);
            audio.volume = soundType === 'whisper' ? 0.2 : 0.1;
            audio.play().catch(() => {});
            lastPlayed = Date.now();
            setTimeout(playRandomSound, minDelay + Math.random() * 120000);
        }
        window.addEventListener('load', () => setTimeout(playRandomSound, 30000));
    }
    
    // (Код для initCustomCursor, initMouseEffects, initTextDistortion, etc. без изменений)
    
    // ===== GO! =====
    boot();
});


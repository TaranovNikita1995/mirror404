document.addEventListener('DOMContentLoaded', () => {

    // MIRROR404: CONFIGURATION OBJECT
    const M404_CONFIG = {
        BASE_ADMIT_COUNT: 14582,
        ADMIT_COOLDOWN_MS: 30_000,
        WATCH_LOOPS: ['loops/loop1.mp4', 'loops/loop2.mp4', 'loops/loop3.mp4'],
        DIARY_JSON_URL: './data/diary.json',
        FALLBACK_DIARY: [{ date: "XXXX-XX-XX", title: "ОШИБКА ЗАГРУЗКИ АРХИВА", body: "Файл data/diary.json не найден или повреждён." }],
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
        content: [initWatchCam, initDiary, initTestForm],
        effects: [initCustomCursor, initMouseEffects, initTextDistortion, initAmbientSounds],
        easter: [initEasterEggs, initAdmitCounter]
    };

    // MIRROR404: BOOT SEQUENCE
    function boot() {
        console.log("Booting MIRROR404...");
        const audio = M404_Errors.wrap(M404_Modules.core[0], 'audio')();
        M404_Errors.wrap(M404_Modules.core[1], 'ageGate')(audio, () => {
             M404_Errors.wrap(M404_Modules.core[2], 'introVideo')();
        });
        
        M404_Modules.ui.forEach(fn => M404_Errors.wrap(fn, fn.name)());
        M404_Modules.content.forEach(fn => M404_Errors.wrap(fn, fn.name)());
        M404_Modules.easter.forEach(fn => M404_Errors.wrap(fn, fn.name)());

        if (!window.matchMedia("(pointer: coarse)").matches) {
            M404_Modules.effects.forEach(fn => M404_Errors.wrap(fn, fn.name)());
        }
        console.log("Boot sequence complete.");
    }
    
    // --- MODULE IMPLEMENTATIONS (Hardened versions) ---

    function initAudio() {
        const audio = { ambient: document.getElementById('audio-ambient'), hover: document.getElementById('audio-hover'), click: document.getElementById('audio-click') };
        if (audio.ambient) audio.ambient.volume = 0.15;
        const play = (sound) => { if (sound && sound.src && sound.paused) { sound.currentTime = 0; sound.play().catch(() => {}); } };
        document.addEventListener('mouseover', e => { if (e.target.closest('a, button, .gate-check, input')) play(audio.hover); });
        document.addEventListener('click', e => { if (e.target.closest('a, button, .gate-check, input')) play(audio.click); });
        return audio;
    }

    function initAgeGate(audio, onAccessGranted) {
        const dialog = document.getElementById('age-gate'); if (!dialog) return;
        if (sessionStorage.getItem('mirror404_age_ok') === '1') { onAccessGranted?.(); audio?.ambient?.play().catch(()=>{}); return; }
        dialog.showModal();
        const grantAccess = () => {
            sessionStorage.setItem('mirror404_age_ok', '1'); audio?.ambient?.play().catch(()=>{});
            dialog.classList.add('fade-out');
            dialog.addEventListener('animationend', () => { dialog.close(); onAccessGranted?.(); }, { once: true });
        };
        const enterBtn = document.getElementById('enterGate');
        const chk18 = document.getElementById('chk18');
        if(chk18 && enterBtn) chk18.addEventListener('change', (e) => enterBtn.disabled = !e.target.checked);
        if(enterBtn) enterBtn.addEventListener('click', grantAccess);
        document.getElementById('sellSoul')?.addEventListener('click', grantAccess);
        document.getElementById('declineGate')?.addEventListener('click', () => window.location.href = 'https://google.com');
    }

    function initIntroVideo() {
        const intro = document.getElementById('intro'); const video = document.getElementById('introVideo'); const skipBtn = document.getElementById('introSkip');
        if (!intro || !video || !skipBtn || !video.src || !video.src.includes('media')) return;
        video.addEventListener('canplay', () => { intro.hidden = false; intro.classList.add('visible'); video.play().catch(() => {}); }, { once: true });
        const hideIntro = () => {
            intro.classList.remove('visible');
            intro.addEventListener('transitionend', () => { intro.hidden = true; video.pause(); }, { once: true });
        };
        skipBtn.addEventListener('click', hideIntro);
        video.addEventListener('ended', hideIntro);
    }

    // Остальные функции JS остаются без изменений, так как они уже отлажены.
    // ... (весь остальной JS код из предыдущего ответа)

    boot();
});

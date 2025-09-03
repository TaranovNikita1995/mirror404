document.addEventListener('DOMContentLoaded', () => {

    // MIRROR404: CONFIGURATION OBJECT
    const M404_CONFIG = {
        BASE_ADMIT_COUNT: 14582,
        ADMIT_COOLDOWN_MS: 30_000,
        WATCH_LOOPS: ['loops/loop1.mp4', 'loops/loop2.mp4', 'loops/loop3.mp4'], // Пути к видео для камеры
        DIARY_JSON_URL: './data/diary.json', // Путь к JSON файлу дневника
        FALLBACK_DIARY: [{ date: "XXXX-XX-XX", title: "ОШИБКА ЗАГРУЗКИ АРХИВА", body: "Файл data/diary.json не найден или повреждён." }],
        EASTER_EGG_CODES: { '13:13': '#room-1313', 'sellSoul': '#room-sell', 'zero': '#room-zero' }, // Пасхальные коды
        AMBIENT_SOUNDS: {
            whisper: ['audio/whisper1.mp3', 'audio/whisper2.mp3'], // Пути к файлам шепота
            noise: ['audio/noise1.mp3', 'audio/noise2.mp3']       // Пути к файлам шумов
        }
    };

    // MIRROR404: Error handling utils
    const M404_Errors = {
        log: (error, context = '') => console.error(`MIRROR404 Error [${context}]:`, error),
        wrap: (fn, context) => (...args) => { try { return fn(...args); } catch (e) { M404_Errors.log(e, context); } }
    };
    
    // MIRROR404: Module loader - СЕЙЧАС СОДЕРЖИТ ВСЕ ФУНКЦИИ
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
        
        // Инициализация аудио, если файлы существуют (иначе функции просто не работают)
        const audio = M404_Errors.wrap(M404_Modules.core[0], 'audio')(); 
        
        // Инициализация AgeGate. onAccessGranted вызывается после успешного прохождения AgeGate
        M404_Errors.wrap(M404_Modules.core[1], 'ageGate')(audio, () => {
             // После доступа инициализируем интро-видео (если оно есть)
             M404_Errors.wrap(M404_Modules.core[2], 'introVideo')();
        });
        
        // Инициализация UI модулей
        M404_Modules.ui.forEach(fn => M404_Errors.wrap(fn, fn.name)());
        
        // Инициализация контент-модулей
        M404_Modules.content.forEach(fn => M404_Errors.wrap(fn, fn.name)());
        
        // Инициализация пасхалок и счетчика душ
        M404_Modules.easter.forEach(fn => M404_Errors.wrap(fn, fn.name)());

        // Инициализация эффект-модулей только на устройствах с точным указателем (не на тачскринах)
        if (!window.matchMedia("(pointer: coarse)").matches) {
            M404_Modules.effects.forEach(fn => M404_Errors.wrap(fn, fn.name)());
        }
        console.log("Boot sequence complete.");
    }
    
    // --- MODULE IMPLEMENTATIONS (Hardened versions) ---

    // Initializes audio elements and adds hover/click sounds
    function initAudio() {
        const audio = { ambient: document.getElementById('audio-ambient'), hover: document.getElementById('audio-hover'), click: document.getElementById('audio-click') };
        if (audio.ambient) audio.ambient.volume = 0.15; // Set ambient volume
        const play = (sound) => { 
            // Only play if sound element exists, has a source, and is not already playing
            if (sound && sound.src && sound.src !== window.location.href && sound.paused) { 
                sound.currentTime = 0; 
                sound.play().catch(() => {}); // Catch potential autoplay errors
            } 
        };
        document.addEventListener('mouseover', e => { if (e.target.closest('a, button, .gate-check, input')) play(audio.hover); });
        document.addEventListener('click', e => { if (e.target.closest('a, button, .gate-check, input')) play(audio.click); });
        return audio;
    }

    // Handles the age gate dialog
    function initAgeGate(audio, onAccessGranted) {
        const dialog = document.getElementById('age-gate'); if (!dialog) return; // Exit if dialog not found
        if (sessionStorage.getItem('mirror404_age_ok') === '1') { onAccessGranted?.(); audio?.ambient?.play().catch(()=>{}); return; } // Skip if already accessed
        dialog.showModal(); // Show the dialog
        const grantAccess = () => {
            sessionStorage.setItem('mirror404_age_ok', '1'); // Mark as accessed
            audio?.ambient?.play().catch(()=>{}); // Try to play ambient audio
            dialog.classList.add('fade-out'); // Add fade-out animation
            dialog.addEventListener('animationend', () => { dialog.close(); onAccessGranted?.(); }, { once: true });
        };
        const enterBtn = document.getElementById('enterGate');
        const chk18 = document.getElementById('chk18');
        // Enable enter button when checkbox is checked
        if(chk18 && enterBtn) chk18.addEventListener('change', (e) => enterBtn.disabled = !e.target.checked);
        // Event listeners for dialog buttons
        if(enterBtn) enterBtn.addEventListener('click', grantAccess);
        document.getElementById('sellSoul')?.addEventListener('click', grantAccess);
        document.getElementById('declineGate')?.addEventListener('click', () => window.location.href = 'https://google.com'); // Redirect on decline
    }

    // Handles the intro video
    function initIntroVideo() {
        const intro = document.getElementById('intro'); const video = document.getElementById('introVideo'); const skipBtn = document.getElementById('introSkip');
        if (!intro || !video || !skipBtn || !video.src || !video.src.includes('media')) return; // Exit if elements or video source are missing
        video.addEventListener('canplay', () => { 
            intro.hidden = false; intro.classList.add('visible'); 
            video.play().catch(() => { M404_Errors.log("Autoplay blocked for intro video.", "initIntroVideo"); }); 
        }, { once: true });
        const hideIntro = () => {
            intro.classList.remove('visible');
            intro.addEventListener('transitionend', () => { intro.hidden = true; video.pause(); }, { once: true });
        };
        skipBtn.addEventListener('click', hideIntro);
        video.addEventListener('ended', hideIntro);
    }

    // Initializes burger menu functionality
    function initBurgerMenu() {
        const burger = document.getElementById('burger'); const navLinks = document.getElementById('navLinks');
        if(!burger || !navLinks) return; // Exit if elements not found
        burger.addEventListener('click', () => { 
            const isOpen = navLinks.classList.toggle('open'); 
            burger.setAttribute('aria-expanded', String(isOpen)); 
        });
    }

    // Handles smooth scrolling for navigation links
    function initSmoothNav() {
        const veil = document.getElementById('veil');
        document.querySelectorAll('[data-nav]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const targetId = anchor.getAttribute('href'); 
                if (!targetId || !targetId.startsWith('#')) return; // Ensure it's an internal link
                const targetEl = document.querySelector(targetId);
                if (!targetEl) return; // Exit if target element not found
                e.preventDefault(); 
                if(veil) veil.classList.add('on'); // Show veil
                setTimeout(() => {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setTimeout(() => veil?.classList.remove('on'), 450); // Hide veil after scroll
                }, 200);
                // Close mobile nav if open
                document.getElementById('navLinks')?.classList.remove('open');
                document.getElementById('burger')?.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Handles logo swap animation
    function initLogoSwap() {
        const logo = document.getElementById('logo');
        if (logo) setInterval(() => { logo.classList.add('is-alt'); setTimeout(() => logo.classList.remove('is-alt'), 500); }, 12000);
    }
    
    // Handles the "Test on Inclination" form logic
    function initTestForm() {
        const form = document.getElementById('testForm'); if (!form) return;
        const resultDiv = document.getElementById('testResult');
        const submitBtn = document.getElementById('testSubmit');
        const overrideBtn = document.getElementById('testOverride');
        const resetBtn = document.getElementById('testReset');

        if(!resultDiv || !submitBtn || !overrideBtn || !resetBtn) return; // Exit if elements not found

        const calculateScore = () => {
            const score = [...form.querySelectorAll('input:checked')].reduce((sum, c) => sum + Number(c.value), 0);
            resultDiv.textContent = score >= 80 ? `Допуск подтверждён (${score}/100).` : `Недостаточно (${score}/100).`;
            if (score >= 80) initAdmitCounter.increment?.(); // Increment if score is sufficient
        };
        const sellSoul = () => {
            resultDiv.textContent = 'Сделка заключена.';
            initAdmitCounter.increment?.(); // Always increment on selling soul
        }
        submitBtn.addEventListener('click', calculateScore);
        overrideBtn.addEventListener('click', sellSoul);
        resetBtn.addEventListener('click', () => resultDiv.textContent = '');
    }

    // Initializes GSAP scroll animations
    function initGsapAnimations() {
        if(typeof gsap === 'undefined') { M404_Errors.log("GSAP is not loaded!", "initGsapAnimations"); return; }
        gsap.registerPlugin(ScrollTrigger);
        // Animate titles
        document.querySelectorAll(".anim-title").forEach(title => gsap.from(title, { scrollTrigger: { trigger: title, start: "top 85%" }, duration: 1.2, opacity: 0, y: 20, ease: "power3.out" }));
        // Animate text and general fades
        gsap.utils.toArray('.anim-text, .anim-fade').forEach(el => gsap.from(el, { scrollTrigger: { trigger: el, start: "top 90%" }, opacity: 0, y: 20, duration: 1 }));
        // Animate staggered lists
        gsap.utils.toArray('.rules').forEach(list => gsap.from(list.querySelectorAll('.anim-stagger'), { scrollTrigger: { trigger: list, start: "top 85%" }, opacity: 0, y: 15, duration: 0.5, stagger: 0.1 }));
    }

    // Handles the "Souls Admitted" counter
    function initAdmitCounter() {
        const admitCountSpan = document.getElementById('admitCount');
        if(!admitCountSpan) return;
        let localInc = parseInt(localStorage.getItem('m404_admit_local_inc') || '0', 10);
        admitCountSpan.textContent = M404_CONFIG.BASE_ADMIT_COUNT + localInc;

        // Function to increment counter, exposed for other modules
        initAdmitCounter.increment = () => {
            const lastAdmitTs = parseInt(localStorage.getItem('m404_last_admit_ts') || '0', 10);
            // Cooldown to prevent rapid increments
            if (Date.now() - lastAdmitTs < M404_CONFIG.ADMIT_COOLDOWN_MS) return;
            localInc++;
            localStorage.setItem('m404_admit_local_inc', String(localInc));
            localStorage.setItem('m404_last_admit_ts', String(Date.now()));
            admitCountSpan.textContent = M404_CONFIG.BASE_ADMIT_COUNT + localInc;
        };
    }
    
    // Handles the watch camera video feed
    function initWatchCam() {
        const videoEl = document.getElementById('watchVideo'); const nextBtn = document.getElementById('watchNext');
        if (!videoEl || !nextBtn || M404_CONFIG.WATCH_LOOPS.length === 0) return; // Exit if elements or loops are missing
        let currentIndex = Math.floor(Math.random() * M404_CONFIG.WATCH_LOOPS.length);
        const setVideoSource = (index) => {
            const videoSrc = M404_CONFIG.WATCH_LOOPS[index];
            if(!videoSrc) return;
            videoEl.src = videoSrc;
            videoEl.classList.add('video-loading');
            videoEl.load();
            videoEl.play().catch(e => { videoEl.classList.remove('video-loading'); M404_Errors.log(e, 'watchCamPlay'); });
        };
        videoEl.addEventListener('loadeddata', () => videoEl.classList.remove('video-loading'));
        videoEl.addEventListener('error', () => { videoEl.classList.remove('video-loading'); M404_Errors.log('Failed to load video', M404_CONFIG.WATCH_LOOPS[currentIndex]); });
        nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % M404_CONFIG.WATCH_LOOPS.length; setVideoSource(currentIndex); });
        setVideoSource(currentIndex); // Initial video load
    }
    
    // Fetches and displays diary entries
    function initDiary() {
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
    
    // Handles Easter Egg codes input
    function initEasterEggs() {
        const form = document.getElementById('easterForm'); const input = document.getElementById('easterInput'); const resultEl = document.getElementById('easterResult');
        if (!form || !input || !resultEl) return;
        const codeHistory = []; const maxHistory = 5; let historyIndex = -1;
        form.addEventListener('submit', (e) => {
            e.preventDefault(); const code = input.value.trim();
            if (code) { codeHistory.unshift(code); if (codeHistory.length > maxHistory) codeHistory.pop(); }
            const targetId = M404_CONFIG.EASTER_EGG_CODES[code];
            // Close any open secret rooms
            document.querySelectorAll('.room-secret.open').forEach(room => { room.classList.remove('open'); room.setAttribute('aria-hidden', 'true'); });
            if (targetId) {
                const room = document.querySelector(targetId);
                if (room) {
                    room.classList.add('open'); room.setAttribute('aria-hidden', 'false');
                    resultEl.textContent = 'Доступ разрешён...'; resultEl.className = 'easter-result success';
                    setTimeout(() => room.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    // Special effect for 'sellSoul'
                    if (targetId === '#room-sell') { const a = document.createElement('div'); a.className = 'soul-sell-effect'; document.body.appendChild(a); setTimeout(() => document.body.removeChild(a), 3000); }
                }
            } else {
                resultEl.textContent = 'Неверный код.'; resultEl.className = 'easter-result error';
                input.classList.add('error'); setTimeout(() => input.classList.remove('error'), 800);
            }
            input.value = ''; historyIndex = -1;
        });
        // History navigation for input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' && codeHistory.length > 0) { e.preventDefault(); historyIndex = Math.min(historyIndex + 1, codeHistory.length - 1); input.value = codeHistory[historyIndex]; }
            else if (e.key === 'ArrowDown' && codeHistory.length > 0) { e.preventDefault(); historyIndex = Math.max(historyIndex - 1, -1); input.value = historyIndex < 0 ? '' : codeHistory[historyIndex]; }
        });
    }

    // Initializes custom cursor
    function initCustomCursor() {
        const cursor = document.querySelector('.cursor'); if (!cursor) return;
        document.addEventListener('mousemove', e => { cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; });
        document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
        document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));
        document.addEventListener('mouseover', e => { if (e.target.closest('a, button, .gate-check, input')) cursor.classList.add('active'); });
        document.addEventListener('mouseout', e => { if (e.target.closest('a, button, .gate-check, input')) cursor.classList.remove('active'); });
    }

    // Handles magnetic effect on interactive elements
    function initMouseEffects() {
        document.querySelectorAll('.magnetic').forEach(el => {
            const strength = el.dataset.magneticStrength || 0.3;
            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                gsap.to(el, {
                    x: (x - centerX) * strength,
                    y: (y - centerY) * strength,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            el.addEventListener('mouseleave', () => { gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }); });
        });
    }

    // Handles text distortion effect on hover
    function initTextDistortion() {
        document.querySelectorAll('.distort-on-hover').forEach(el => {
            let originalText = el.textContent;
            el.addEventListener('mouseover', () => {
                let distortedText = '';
                for (let i = 0; i < originalText.length; i++) {
                    if (Math.random() < 0.3) { // 30% chance to distort
                        distortedText += String.fromCharCode(originalText.charCodeAt(i) + Math.floor(Math.random() * 10 - 5));
                    } else {
                        distortedText += originalText[i];
                    }
                }
                el.textContent = distortedText;
            });
            el.addEventListener('mouseout', () => { el.textContent = originalText; });
        });
    }

    // Plays random ambient sounds
    function initAmbientSounds() {
        if(!M404_CONFIG.AMBIENT_SOUNDS || (M404_CONFIG.AMBIENT_SOUNDS.whisper.length === 0 && M404_CONFIG.AMBIENT_SOUNDS.noise.length === 0)) {
            M404_Errors.log("No ambient sound files configured.", "initAmbientSounds");
            return;
        }
        let lastPlayed = 0; 
        const minDelay = 120000; // Minimum 2 minutes
        const maxDelay = 240000; // Maximum 4 minutes

        function playRandomSound() {
            // Only proceed if browser has interacted (audio policy)
            if (!document.getElementById('audio-ambient')?.play) {
                setTimeout(playRandomSound, 10000); // Retry after 10 seconds if audio not ready
                return;
            }

            if (Date.now() - lastPlayed < minDelay) {
                setTimeout(playRandomSound, minDelay - (Date.now() - lastPlayed) + Math.random() * (maxDelay - minDelay));
                return;
            }

            const soundType = Math.random() > 0.7 ? 'noise' : 'whisper';
            const soundFiles = M404_CONFIG.AMBIENT_SOUNDS[soundType];
            
            if (!soundFiles || soundFiles.length === 0) {
                setTimeout(playRandomSound, minDelay + Math.random() * (maxDelay - minDelay)); // Try again later
                return;
            }

            const soundFile = soundFiles[Math.floor(Math.random() * soundFiles.length)];
            const audio = new Audio(soundFile);
            audio.volume = soundType === 'whisper' ? 0.2 : 0.1;
            audio.play().catch(e => { M404_Errors.log(`Failed to play ambient sound: ${soundFile}`, "initAmbientSounds"); });
            lastPlayed = Date.now();
            
            setTimeout(playRandomSound, minDelay + Math.random() * (maxDelay - minDelay));
        }
        // Start the ambient sound loop after a short delay (e.g., 30 seconds)
        // to give user time to interact and avoid autoplay blocking
        window.addEventListener('load', () => setTimeout(playRandomSound, 30000 + Math.random() * 60000));
    }

    // Call the boot sequence to start everything
    boot();
});

document.addEventListener('DOMContentLoaded', () => {

    // MIRROR404: CONFIGURATION OBJECT
    const M404_CONFIG = {
        BASE_ADMIT_COUNT: 14582,
        ADMIT_COOLDOWN_MS: 30_000,
        WATCH_LOOPS:, // ИСПРАВЛЕНО: Добавлены пустые массивы
        AMBIENT_SOUNDS: { whisper:, noise: }, // ИСПРАВЛЕНО: Добавлены пустые массивы
        DIARY_JSON_URL: './data/diary.json',
        FALLBACK_DIARY: [{ date: "XXXX-XX-XX", title: "ОШИБКА ЗАГРУЗКИ АРХИВА", body: "Файл data/diary.json не найден или повреждён." }],
        EASTER_EGG_CODES: { '13:13': '#room-1313', 'sellSoul': '#room-sell', 'zero': '#room-zero' },
    };

    // MIRROR404: Error handling utils
    const M404_Errors = {
        log: (error, context = '') => console.error(`MIRROR404 Error [${context}]:`, error),
        wrap: (fn, context) => (...args) => { try { return fn(...args); } catch (e) { M404_Errors.log(e, context); } }
    };
    
    // MIRROR404: Module loader
    const M404_Modules = {
        core: [initAudio, initAgeGate, initIntroVideo],
        ui:,
        content:,
        effects:,
        easter: [initEasterEggs, initAdmitCounter]
    };

    // MIRROR404: BOOT SEQUENCE
    function boot() {
        // Age Gate is critical and must run first
        M404_Errors.wrap(initAgeGate, 'ageGate')(null, () => {
             // All other modules run after access is granted
            M404_Modules.ui.forEach(fn => M404_Errors.wrap(fn, fn.name)());
            M404_Modules.content.forEach(fn => M404_Errors.wrap(fn, fn.name)());
            M404_Modules.easter.forEach(fn => M404_Errors.wrap(fn, fn.name)());

            if (!window.matchMedia("(pointer: coarse)").matches) {
                M404_Modules.effects.forEach(fn => M404_Errors.wrap(fn, fn.name)());
            }
        });
    }
    
    // --- MODULE IMPLEMENTATIONS ---

    function initAudio() {
        // This function can be expanded later to manage all audio
        return {
            ambient: document.getElementById('audio-ambient'),
            hover: document.getElementById('audio-hover'),
            click: document.getElementById('audio-click'),
        };
    }

    function initAgeGate(audio, onAccessGranted) {
        const dialog = document.getElementById('age-gate'); if (!dialog) return;
        if (sessionStorage.getItem('mirror404_age_ok') === '1') {
            onAccessGranted?.();
            return;
        }
        dialog.showModal();

        const grantAccess = () => {
            sessionStorage.setItem('mirror404_age_ok', '1');
            const audio = initAudio();
            audio.ambient?.play().catch(()=>{});
            dialog.classList.add('fade-out');
            dialog.addEventListener('animationend', () => {
                dialog.close();
                onAccessGranted?.();
            }, { once: true });
        };

        const enterBtn = document.getElementById('enterGate');
        const chk18 = document.getElementById('chk18');
        const sellSoulBtn = document.getElementById('sellSoul');
        const declineBtn = document.getElementById('declineGate');

        if(chk18 && enterBtn) chk18.addEventListener('change', (e) => enterBtn.disabled =!e.target.checked);
        if(enterBtn) enterBtn.addEventListener('click', grantAccess);
        if(sellSoulBtn) sellSoulBtn.addEventListener('click', grantAccess);
        if(declineBtn) declineBtn.addEventListener('click', () => window.location.href = 'https://google.com');
    }

    function initIntroVideo() { /* Can be implemented later */ }

    function initWatchCam() {
        const watchCamElement = document.getElementById('watchCam');
        if (watchCamElement && M404_CONFIG.WATCH_LOOPS.length === 0) {
            watchCamElement.style.display = 'none';
        }
    }

    function initAmbientSounds() { /* Can be implemented later */ }

    function initBurgerMenu() {
        const burger = document.getElementById('burger');
        const navLinks = document.getElementById('navLinks');
        if(!burger ||!navLinks) return;
        burger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initSmoothNav() {
        const veil = document.getElementById('veil');
        document.querySelectorAll('[data-nav]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const targetId = anchor.getAttribute('href');
                if (!targetId?.startsWith('#')) return;
                const targetEl = document.querySelector(targetId);
                if (!targetEl) return;
                e.preventDefault();
                if (veil) veil.classList.add('on');
                setTimeout(() => {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setTimeout(() => veil?.classList.remove('on'), 450);
                }, 200);
                document.getElementById('navLinks')?.classList.remove('open');
                document.getElementById('burger')?.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function initLogoSwap() {
        const logo = document.getElementById('logo');
        if (logo) setInterval(() => {
            logo.classList.add('is-alt');
            setTimeout(() => logo.classList.remove('is-alt'), 500);
        }, 12000);
    }
    
    function initTestForm() {
        const form = document.getElementById('testForm'); if (!form) return;
        const resultDiv = document.getElementById('testResult');
        const submitBtn = document.getElementById('testSubmit');
        const overrideBtn = document.getElementById('testOverride');
        const resetBtn = document.getElementById('testReset');

        if(!resultDiv ||!submitBtn ||!overrideBtn ||!resetBtn) return;

        const calculateScore = () => {
            const score =.reduce((sum, c) => sum + Number(c.value), 0);
            resultDiv.textContent = score >= 80? `Допуск подтверждён (${score}/100).` : `Недостаточно (${score}/100).`;
            if (score >= 80) initAdmitCounter.increment?.();
        };
        const sellSoul = () => {
            resultDiv.textContent = 'Сделка заключена.';
            initAdmitCounter.increment?.();
        }
        submitBtn.addEventListener('click', calculateScore);
        overrideBtn.addEventListener('click', sellSoul);
        resetBtn.addEventListener('click', () => resultDiv.textContent = '');
    }

    function initGsapAnimations() {
        if(typeof gsap === 'undefined') { console.error("GSAP not loaded"); return; }
        gsap.registerPlugin(ScrollTrigger);
        document.querySelectorAll(".anim-title").forEach(title => gsap.from(title, { scrollTrigger: { trigger: title, start: "top 85%" }, duration: 1.2, opacity: 0, y: 20, ease: "power3.out" }));
        gsap.utils.toArray('.anim-text,.anim-fade').forEach(el => gsap.from(el, { scrollTrigger: { trigger: el, start: "top 90%" }, opacity: 0, y: 20, duration: 1 }));
        gsap.utils.toArray('.rules').forEach(list => gsap.from(list.querySelectorAll('.anim-stagger'), { scrollTrigger: { trigger: list, start: "top 85%" }, opacity: 0, y: 15, duration: 0.5, stagger: 0.1 }));
    }

    function initAdmitCounter() {
        const admitCountSpan = document.getElementById('admitCount'); if (!admitCountSpan) return;
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
    
    function initDiary() {
        const listEl = document.getElementById('diaryList'); if (!listEl) return;
        listEl.innerHTML = `<div class="diary-loading" aria-live="polite">Загрузка...</div>`;
        listEl.setAttribute('aria-busy', 'true');
        const renderEntries = (entries) => {
            listEl.setAttribute('aria-busy', 'false');
            listEl.innerHTML = entries.map(entry => `<article class="diary-item anim-stagger" aria-labelledby="diary-title-${entry.date.replace(/-/g, '')}"><time class="diary-date" datetime="${entry.date}">${entry.date}</time><h3 class="diary-title" id="diary-title-${entry.date.replace(/-/g, '')}">${entry.title}</h3><p class="diary-body">${entry.body}</p></article>`).join('');
        };
        fetch(M404_CONFIG.DIARY_JSON_URL)
          .then(res => res.ok? res.json() : Promise.reject(`HTTP ${res.status}`))
          .then(data => renderEntries(data.entries ||))
          .catch(error => {
                renderEntries(M404_CONFIG.FALLBACK_DIARY);
                M404_Errors.log(error, 'diaryFetch');
            });
    }
    
    function initEasterEggs() {
        const form = document.getElementById('easterForm');
        const input = document.getElementById('easterInput');
        const resultEl = document.getElementById('easterResult');
        if (!form ||!input ||!resultEl) return;
        const codeHistory =;
        const maxHistory = 5;
        let historyIndex = -1;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = input.value.trim();
            if (code) {
                codeHistory.unshift(code);
                if (codeHistory.length > maxHistory) codeHistory.pop();
            }
            const targetId = M404_CONFIG.EASTER_EGG_CODES[code];
            document.querySelectorAll('.room-secret.open').forEach(room => {
                room.classList.remove('open');
                room.setAttribute('aria-hidden', 'true');
            });
            if (targetId) {
                const room = document.querySelector(targetId);
                if (room) {
                    room.classList.add('open');
                    room.setAttribute('aria-hidden', 'false');
                    resultEl.textContent = 'Доступ разрешён...';
                    resultEl.className = 'easter-result success';
                    setTimeout(() => room.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    if (targetId === '#room-sell') {
                        const a = document.createElement('div');
                        a.className = 'soul-sell-effect';
                        document.body.appendChild(a);
                        setTimeout(() => document.body.removeChild(a), 3000);
                    }
                }
            } else {
                resultEl.textContent = 'Неверный код.';
                resultEl.className = 'easter-result error';
                input.classList.add('error');
                setTimeout(() => input.classList.remove('error'), 800);
            }
            input.value = '';
            historyIndex = -1;
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' && codeHistory.length > 0) {
                e.preventDefault();
                historyIndex = Math.min(historyIndex + 1, codeHistory.length - 1);
                input.value = codeHistory[historyIndex];
            } else if (e.key === 'ArrowDown' && codeHistory.length > 0) {
                e.preventDefault();
                historyIndex = Math.max(historyIndex - 1, -1);
                input.value = historyIndex < 0? '' : codeHistory[historyIndex];
            }
        });
    }

    function initCustomCursor() {
        const cursor = document.querySelector('.cursor'); if (!cursor) return;
        window.addEventListener('mousemove', e => gsap.to(cursor, { duration: 0.3, x: e.clientX, y: e.clientY }));
        document.addEventListener('mouseover', e => {
            const isHoverTarget = e.target.closest('a, button,.gate-check, input');
            cursor.classList.toggle('hover', isHoverTarget);
        });
    }

    function initMouseEffects() {
        const parallaxContainer = document.querySelector('[data-parallax-container]');
        if (parallaxContainer) {
            parallaxContainer.addEventListener('mousemove', e => {
                const { clientX, clientY, currentTarget } = e;
                const { offsetWidth, offsetHeight } = currentTarget;
                const x = (clientX / offsetWidth - 0.5) * 30;
                const y = (clientY / offsetHeight - 0.5) * 30;
                gsap.utils.toArray('[data-parallax-item]').forEach(item => {
                    const speed = item.dataset.parallaxSpeed || 1;
                    gsap.to(item, { duration: 1, x: -x * speed, y: -y * speed, ease: "power2.out" });
                });
            });
        }
        gsap.utils.toArray('.magnetic').forEach(el => {
            el.addEventListener('mousemove', e => {
                const { clientX, clientY } = e;
                const { left, top, width, height } = el.getBoundingClientRect();
                gsap.to(el, { duration: 0.5, x: (clientX - (left + width / 2)) * 0.4, y: (clientY - (top + height / 2)) * 0.4, ease: "power2.out" });
            });
            el.addEventListener('mouseleave', () => gsap.to(el, { duration: 0.7, x: 0, y: 0, ease: "elastic.out(1, 0.4)" }));
        });
    }

    function initTextDistortion() {
        document.querySelectorAll(".distort-on-hover").forEach(element => {
            const originalText = element.innerText;
            const letters = "▓▒░█".split('');
            let interval = null;
            element.addEventListener("mouseenter", () => {
                let iteration = 0;
                clearInterval(interval);
                interval = setInterval(() => {
                    element.innerText = originalText.split("").map((_, index) => index < iteration? originalText[index] : letters[Math.floor(Math.random() * letters.length)]).join("");
                    if (iteration >= originalText.length) clearInterval(interval);
                    iteration += 1 / 3;
                }, 30);
            });
            element.addEventListener("mouseleave", () => {
                clearInterval(interval);
                element.innerText = originalText;
            });
        });
    }

    boot();
});

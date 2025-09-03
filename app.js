document.addEventListener('DOMContentLoaded', () => {

  // ===== init =====
  function init() {
    initPreloader();
    const audio = initAudio();
    initAgeGate(audio);
    initBurgerMenu();
    initSmoothNav();
    initLogoSwap();
    initTestGate();

    // «фишки»
    initCustomCursor();
    initGsapAnimations();
    initMouseInteractions();
  }

  // ===== прелоадер =====
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => preloader?.classList.add('hidden'));
  }

  // ===== аудио =====
  function initAudio() {
    const audio = {
      ambient: document.getElementById('audio-ambient'),
      hover:   document.getElementById('audio-hover'),
      click:   document.getElementById('audio-click')
    };
    if (audio.ambient) audio.ambient.volume = 0.18;
    const play = (sound) => sound?.play().catch(() => {});

    // троттлинг ховер-звука
    let hoverCooldown = false;
    document.addEventListener('mouseover', (e) => {
      if (hoverCooldown) return;
      if (e.target.matches('a, button, .gate-check')) {
        play(audio.hover);
        hoverCooldown = true;
        setTimeout(() => hoverCooldown = false, 120);
      }
    });
    document.addEventListener('click', (e) => {
      if (e.target.matches('a, button, .gate-check')) play(audio.click);
    });
    return audio;
  }

  // ===== возрастной допуск =====
  function initAgeGate(audio) {
    const dialog = document.getElementById('age-gate');
    if (!dialog) return;
    if (localStorage.getItem('mirror404_age_ok') === '1') {
      audio.ambient?.play();
      return;
    }
    dialog.showModal();

    const enterBtn = document.getElementById('enterGate');
    const chk18    = document.getElementById('chk18');

    const grantAccess = () => {
      localStorage.setItem('mirror404_age_ok', '1');
      audio.ambient?.play();
      dialog.classList.add('fade-out');
      dialog.addEventListener('animationend', () => dialog.close(), { once: true });
    };

    chk18.addEventListener('change', () => enterBtn.disabled = !chk18.checked);
    enterBtn.addEventListener('click', grantAccess);
    document.getElementById('declineGate').addEventListener('click', () => window.location.href = 'https://google.com');
    document.getElementById('sellSoul').addEventListener('click', grantAccess);
  }

  // ===== burger =====
  function initBurgerMenu() {
    const burger   = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    burger?.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ===== smooth scroll + veil =====
  function initSmoothNav() {
    const veil = document.getElementById('veil');
    document.querySelectorAll('[data-nav]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const targetId = anchor.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (!targetId?.startsWith('#') || !targetEl) return;

        e.preventDefault();
        veil?.classList.add('on');
        setTimeout(() => {
          targetEl.scrollIntoView({ block: 'start' });
          setTimeout(() => veil?.classList.remove('on'), 420);
        }, 150);

        document.getElementById('navLinks')?.classList.remove('open');
        document.getElementById('burger')?.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== логотип: MIRROR404 <-> MIRROЯ404 =====
  function initLogoSwap() {
    const logo = document.getElementById('logo');
    if (!logo) return;
    const flash = () => {
      logo.classList.add('is-alt');
      setTimeout(() => logo.classList.remove('is-alt'), 2000);
    };
    setInterval(flash, 12000); // каждые 12 сек на 2 сек — alt
  }

  // ===== тест =====
  function initTestGate() {
    const form = document.getElementById('testForm');
    if (!form) return;
    const resultDiv = document.getElementById('testResult');

    const calcScore = () => {
      const score = [...form.querySelectorAll('input:checked')]
        .reduce((sum, el) => sum + Number(el.value), 0);
      resultDiv.textContent = (score >= 80)
        ? `Твой допуск подтверждён (${score}/100). Добро пожаловать.`
        : `Недостаточно (${score}/100). Тебя не пускают… Но…`;
    };

    document.getElementById('testSubmit').addEventListener('click', calcScore);
    document.getElementById('testOverride').addEventListener('click', () => {
      resultDiv.textContent = 'Сделка принята. Добро пожаловать в Архив.';
    });
  }

  // ===== кастомный курсор =====
  function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const interactive = document.querySelectorAll('a, button, .gate-check, input[type="checkbox"]');
    if (!cursor) return;

    window.addEventListener('mousemove', e => {
      gsap.to(cursor, { duration: 0.3, x: e.clientX, y: e.clientY });
    });
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ===== GSAP анимации =====
  function initGsapAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // «расшифровка» заголовков
    document.querySelectorAll(".anim-title").forEach(title => {
      gsap.from(title, {
        scrollTrigger: { trigger: title, start: "top 85%", toggleActions: "play none none none" },
        duration: 1,
        text: { value: "█▓▒░ ░▒▓█", delimiter: " " },
        ease: "none"
      });
    });

    // плавное появление
    gsap.utils.toArray('.anim-text, .anim-fade').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 90%" },
        opacity: 0, y: 20, duration: 1
      });
    });

    // поочерёдный список
    gsap.utils.toArray('.anim-stagger').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 90%" },
        opacity: 0, y: 20, duration: .8, delay: i * .1
      });
    });
  }

  // ===== параллакс + «магниты» =====
  function initMouseInteractions() {
    const container = document.querySelector('[data-parallax-container]');
    if (container) {
      container.addEventListener('mousemove', e => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = container.getBoundingClientRect();
        const x = ((clientX - left) / width  - .5) * 30;
        const y = ((clientY - top)  / height - .5) * 30;

        gsap.utils.toArray('[data-parallax-item]').forEach(item => {
          const speed = item.dataset.parallaxSpeed || 1;
          gsap.to(item, { duration: 1, x: -x * speed, y: -y * speed, ease: "power2.out" });
        });
      });
    }

    gsap.utils.toArray('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top  + r.height/ 2);
        gsap.to(el, { duration: .5, x: x * .4, y: y * .4, ease: "power2.out" });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { duration: .7, x: 0, y: 0, ease: "elastic.out(1, .3)" });
      });
    });
  }

  init();
});

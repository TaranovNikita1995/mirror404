document.addEventListener('DOMContentLoaded', () => {

  initPreloader();
  initBurgerMenu();
  initSmoothNav();
  initLogoSwap();          // 0.5s своп раз в 12s
  initCustomCursor();
  initGsapAnimations();
  initMouseInteractions();
  initAgeGate();           // покажет интро после допуска ИЛИ сразу, если уже подтверждал
  initTest();              // игровой индекс; ничего не сохраняет

  /* === Прелоадер === */
  function initPreloader(){
    const pre = document.getElementById('preloader');
    window.addEventListener('load', () => pre?.classList.add('hidden'));
  }

  /* === Бургер === */
  function initBurgerMenu(){
    const burger = document.getElementById('burger');
    const nav    = document.getElementById('navLinks');
    burger?.addEventListener('click', ()=>{
      const opened = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(opened));
    });
  }

  /* === Плавная навигация + вуаль === */
  function initSmoothNav(){
    const veil = document.getElementById('veil');
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const id = a.getAttribute('href');
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        veil.classList.add('on');
        setTimeout(()=>{ el.scrollIntoView({block:'start'}); setTimeout(()=>veil.classList.remove('on'),420); },150);
        document.getElementById('navLinks')?.classList.remove('open');
        document.getElementById('burger')?.setAttribute('aria-expanded','false');
      });
    });
  }

  /* === Лого своп: 0.5s каждые 12s === */
  function initLogoSwap(){
    const logo = document.getElementById('logo');
    if (!logo) return;
    const flashMs = 500;      // показывать alt 0.5s
    const period  = 12000;    // каждые 12s
    const flash = ()=>{ logo.classList.add('is-alt'); setTimeout(()=>logo.classList.remove('is-alt'), flashMs); };
    setInterval(flash, period);
  }

  /* === Кастомный курсор === */
  function initCustomCursor(){
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    window.addEventListener('mousemove', e => {
      gsap.to(cursor, { duration:0.3, x:e.clientX, y:e.clientY });
    });
    document.addEventListener('mouseover', e=>{
      const hov = e.target.closest('a,button,.gate-check,input[type="radio"],input[type="checkbox"]');
      cursor.classList.toggle('hover', Boolean(hov));
    });
  }

  /* === GSAP анимации (появление) === */
  function initGsapAnimations(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    // плавное проявление
    gsap.utils.toArray('.anim-title, .anim-text, .anim-fade').forEach(el=>{
      gsap.from(el, { scrollTrigger:{ trigger:el, start:"top 90%" }, opacity:0, y:20, duration:1 });
    });
    // поочерёдные элементы
    gsap.utils.toArray('.anim-stagger').forEach((el,i)=>{
      gsap.from(el, { scrollTrigger:{ trigger:el, start:"top 90%" }, opacity:0, y:20, duration:.8, delay:i*.08 });
    });
  }

  /* === Параллакс + магнитные === */
  function initMouseInteractions(){
    const container = document.querySelector('[data-parallax-container]');
    if (container){
      container.addEventListener('mousemove', e=>{
        const r = container.getBoundingClientRect();
        const x = ((e.clientX - r.left)/r.width - .5) * 30;
        const y = ((e.clientY - r.top)/r.height - .5) * 30;
        gsap.utils.toArray('[data-parallax-item]').forEach(item=>{
          const s = item.dataset.parallaxSpeed || 1;
          gsap.to(item, { duration:1, x:-x*s, y:-y*s, ease:"power2.out" });
        });
      });
    }
    // магнитный эффект на кнопках/ссылках
    gsap.utils.toArray('.navlink, .enter-btn, .btn').forEach(el=>{
      el.addEventListener('mousemove', e=>{
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width/2);
        const y = e.clientY - (r.top  + r.height/2);
        gsap.to(el, { duration:.5, x:x*.35, y:y*.35, ease:"power2.out" });
      });
      el.addEventListener('mouseleave', ()=> gsap.to(el, { duration:.6, x:0, y:0, ease:"elastic.out(1,.3)" }) );
    });
  }

  /* === Age Gate + Intro Video === */
  function initAgeGate(){
    const dialog = document.getElementById('age-gate');
    const intro  = () => showIntro();

    // Уже есть допуск? Показываем интро сразу
    if (localStorage.getItem('mirror404_age_ok') === '1'){
      intro();
      return;
    }
    // Иначе — открываем диалог
    dialog.showModal();
    const enter   = document.getElementById('enterGate');
    const chk18   = document.getElementById('chk18');
    const decline = document.getElementById('declineGate');
    const sell    = document.getElementById('sellSoul');

    const grant = ()=>{
      localStorage.setItem('mirror404_age_ok','1');
      dialog.classList.add('fade-out');
      dialog.addEventListener('animationend', ()=> dialog.close(), { once:true });
      intro();
    };

    chk18.addEventListener('change', ()=> enter.disabled = !chk18.checked);
    enter.addEventListener('click', grant);
    decline.addEventListener('click', ()=> location.href='https://google.com');
    sell.addEventListener('click', grant);
  }

  function showIntro(){
    const wrap  = document.getElementById('introWrap');
    const video = document.getElementById('introVideo');
    const skip  = document.getElementById('introSkip');
    if (!wrap || !video) return;
    wrap.hidden = false;

    const end = ()=>{
      wrap.classList.add('fade-out-intro');
      setTimeout(()=>{ wrap.hidden = true; }, 350);
    };
    video.addEventListener('ended', end, { once:true });
    skip?.addEventListener('click', end, { once:true });

    const p = video.play();
    if (p && typeof p.catch === 'function'){ p.catch(()=> setTimeout(end, 8000)); }
    else { setTimeout(end, 8000); }
  }

  /* === Тест (игровой, не клинический) === */
  function initTest(){
    const mount  = document.getElementById('testMount');
    const result = document.getElementById('testResult');
    const btnGo  = document.getElementById('testSubmit');
    const btnClr = document.getElementById('testReset');
    const btnOvr = document.getElementById('testOverride');
    if (!mount) return;

    // 10 утверждений; шкала 0/2/5/8/10
    const questions = [
      "Иногда я вижу узоры/символы там, где их вроде бы нет.",
      "Ночные отражения вызывают у меня странное чувство присутствия.",
      "Я чувствителен(а) к мерцанию, глитчам, шуму на экране.",
      "Мне часто снятся повторяющиеся сны/комнаты.",
      "Я иногда ощущаю, что кто-то наблюдает за мной из-за экрана.",
      "Я люблю смотреть на тьму и ждать, пока глаза привыкнут.",
      "Иногда мне кажется, что моё отражение смотрит иначе, чем я.",
      "Мне нравятся истории о потустороннем/аномальном.",
      "Я склонен(на) искать связи между несвязными событиями.",
      "Я готов(а) пройти испытание, даже если не знаю его цену."
    ];

    const scale = [
      { label: "Никогда",        val: 0 },
      { label: "Редко",          val: 2 },
      { label: "Иногда",         val: 5 },
      { label: "Часто",          val: 8 },
      { label: "Почти всегда",   val:10 }
    ];

    // Рендер формы
    mount.innerHTML = "";
    questions.forEach((q, i)=>{
      const fs = document.createElement('fieldset');
      const lg = document.createElement('legend'); lg.textContent = q;
      fs.appendChild(lg);
      scale.forEach((opt, j)=>{
        const id = `q${i}_${j}`;
        const lab = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = `q${i}`; radio.value = String(opt.val); radio.id = id;
        lab.setAttribute('for', id);
        lab.textContent = opt.label;
        lab.prepend(radio);
        fs.appendChild(lab);
      });
      mount.appendChild(fs);
    });

    const calc = ()=>{
      const values = questions.map((_, i)=>{
        const checked = document.querySelector(`input[name="q${i}"]:checked`);
        return checked ? Number(checked.value) : 0;
      });
      const raw = values.reduce((a,b)=>a+b,0);    // макс 100
      const pct = Math.round((raw/100)*100);
      // Порог допуска 80
      if (pct >= 80){
        result.textContent = `Индекс: ${pct}/100 — проход. Зеркало принимает тебя.`;
      } else {
        result.textContent = `Индекс: ${pct}/100 — недостаточно. Тебя не пускают… Но…`;
      }
    };

    btnGo?.addEventListener('click', calc);
    btnClr?.addEventListener('click', ()=>{
      // Сбросим выборы и очистим результат
      document.querySelectorAll('#testMount input[type="radio"]:checked').forEach(n => n.checked = false);
      result.textContent = "";
      // Ничего не сохраняем: перезагрузка страницы обнулит всё
    });
    btnOvr?.addEventListener('click', ()=>{
      result.textContent = "Сделка принята. Добро пожаловать в Архив.";
    });
  }

});

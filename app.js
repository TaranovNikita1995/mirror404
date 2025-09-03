document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const gateDialog = document.getElementById('age-gate');
  const chk18 = document.getElementById('chk18');
  const btnEnter = document.getElementById('enterGate');
  const btnDecline = document.getElementById('declineGate');
  const veil = document.getElementById('veil');

  window.addEventListener('load', () => preloader.classList.add('hidden'));

  if (!localStorage.getItem('age_ok')) {
    gateDialog.showModal();
    chk18.addEventListener('change', () => btnEnter.disabled = !chk18.checked);
    btnEnter.addEventListener('click', () => {
      localStorage.setItem('age_ok', '1');
      gateDialog.close();
    });
    btnDecline.addEventListener('click', () => window.location.href = 'https://google.com');
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  document.querySelectorAll('a[data-nav]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetId.startsWith('#') && targetElement) {
        e.preventDefault();
        veil.classList.add('on');
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => veil.classList.remove('on'), 500);
        }, 200);
      }
    });
  });
});

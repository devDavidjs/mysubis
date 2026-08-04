// MySubis — bascule thème (clair/sombre) et langue (FR/EN), persistées.
(function () {
  var root = document.documentElement;

  // --- Thème ---
  var storedTheme = null;
  try { storedTheme = localStorage.getItem('mysubis-theme'); } catch (e) {}
  if (storedTheme === 'light' || storedTheme === 'dark') {
    root.setAttribute('data-theme', storedTheme);
  }

  function toggleTheme() {
    var current = root.getAttribute('data-theme');
    if (!current) {
      // Pas encore de choix explicite → on part de la préférence système.
      current = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    var next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mysubis-theme', next); } catch (e) {}
  }

  // --- Langue ---
  var storedLang = null;
  try { storedLang = localStorage.getItem('mysubis-lang'); } catch (e) {}
  var lang = storedLang || (navigator.language && navigator.language.slice(0, 2) === 'en' ? 'en' : 'fr');
  setLang(lang);

  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    try { localStorage.setItem('mysubis-lang', l); } catch (e) {}
    var btn = document.querySelector('[data-lang-toggle]');
    if (btn) btn.textContent = l === 'fr' ? 'EN' : 'FR';
  }

  function toggleLang() {
    setLang(root.getAttribute('data-lang') === 'fr' ? 'en' : 'fr');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-theme-toggle],[data-lang-toggle]') : null;
    if (!t) return;
    if (t.hasAttribute('data-theme-toggle')) toggleTheme();
    else toggleLang();
  });

  // --- Apparition au scroll ---
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // --- Ombre de la nav au scroll ---
  function initNavShadow() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (document.readyState !== 'loading') { initReveal(); initNavShadow(); }
  else document.addEventListener('DOMContentLoaded', function () { initReveal(); initNavShadow(); });
})();

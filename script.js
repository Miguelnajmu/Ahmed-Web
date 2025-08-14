/* FILE: script.js
   Semua interaksi JS dipisah di sini (defer di index.html).
   Fungsi utama:
   - Typewriter effect di subtitle
   - Entrance reveal untuk hero title/subtitle/about button
   - Play click sound untuk About Me button
   - Logo hover/focus handling -> menampilkan info box
   - Keyboard accessibility (arrow navigation, Enter key)
   - Smooth scroll compensation for navbar height
   - IntersectionObserver untuk reveal elemen .reveal
*/

/* ========================
   Helper utilities
   ======================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

document.addEventListener('DOMContentLoaded', () => {
  /* ========================
     Cached elements
     ======================== */
  const heroTitle = $('#hero-title');
  const heroSub = $('#hero-sub');
  const aboutBtn = $('#aboutBtn');
  const logos = $$('.logo-card');
  const infoBox = $('#infoBox');
  const infoTitle = $('#infoTitle');
  const infoDesc = $('#infoDesc');
  const infoOrder = $('#infoOrder');
  const infoClose = $('#infoClose');
  const revealEls = $$('.reveal');

  /* ========================
     1) Typewriter effect for subtitle (hero-sub)
     ======================== */
  (function typewriter(){
    // Text is already in DOM; we rewrite it char by char.
    const el = heroSub;
    const fullText = el.textContent.trim();
    el.textContent = '';
    let i = 0;
    const speed = 28; // ms per char
    function tick(){
      if(i < fullText.length){
        el.textContent += fullText[i++];
        setTimeout(tick, speed);
      } else {
        // Add blinking caret for polish
        const caret = document.createElement('span');
        caret.id = 'hero-caret';
        caret.textContent = '|';
        caret.style.marginLeft = '6px';
        caret.style.opacity = '1';
        caret.style.transition = 'opacity .4s ease';
        el.appendChild(caret);
        setInterval(()=> caret.style.opacity = (caret.style.opacity === '1' ? '0' : '1'), 600);
      }
    }
    // start after brief delay
    setTimeout(tick, 400);
  })();

  /* ========================
     2) Entrance reveal for hero elements
     - Add class after small delay so CSS animation triggers.
     ======================== */
  setTimeout(()=> {
    heroTitle.classList.add('revealed');
    heroSub.classList.add('revealed');
    aboutBtn.classList.add('revealed');
  }, 240);

  /* ========================
     3) About button: sound + navigate
     - click plays sound and navigates
     - ensure audio exists and is permitted
     ======================== */
  (function aboutSoundAndNavigate(){
    // Preload audio
    const audio = new Audio('click-6.mp3'); // ensure file exists
    audio.preload = 'auto';

    // Play mild sound on hover (some browsers block autoplay on hover; click always works)
    aboutBtn.addEventListener('mouseenter', () => {
      try { audio.currentTime = 0; audio.volume = 0.18; audio.play().catch(()=>{}); } catch(e){}
    }, { passive: true });

    // On click: play stronger sound then navigate (small delay so sound starts)
    aboutBtn.addEventListener('click', (e) => {
      // allow link navigation but play sound before changing page
      e.preventDefault();
      try { audio.currentTime = 0; audio.volume = 0.9; audio.play().catch(()=>{}); } catch(e){}
      // visual feedback
      aboutBtn.classList.add('active');
      setTimeout(()=> {
        // navigate to profile.html
        const href = aboutBtn.getAttribute('href');
        if(href) window.location.href = href;
      }, 160); // short delay to let sound/ripple register
    });
  })();

  /* ========================
     4) IntersectionObserver: reveal .reveal elements on scroll
     ======================== */
  (function setupRevealObserver(){
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    // observe hero and gallery reveal classes
    $$('.reveal, .hero-title, .hero-sub, .about-btn').forEach(el => {
      // Not all elements exist as .reveal initially, but safe to observe
      observer.observe(el);
    });

    // ensure logo cards fade in as they appear
    $$('.logo-card').forEach(card => observer.observe(card));
  })();

  /* ========================
     5) Info box control (hover/focus on logos)
     - Show info box at bottom center with content from data-*
     - Clicking 'Order' will navigate to the link in data-link
     - Keyboard accessible: Enter opens, Escape closes
     ======================== */
  (function logoInteractions(){
    let activeCard = null;

    // helper to open info box
    function openInfo(card){
      if(!card) return;
      const title = card.getAttribute('data-title') || 'Untitled';
      const desc = card.getAttribute('data-desc') || '';
      const link = card.getAttribute('data-link') || 'order.html';

      infoTitle.textContent = title;
      infoDesc.textContent = desc;
      infoOrder.setAttribute('href', link);

      // mark active
      $$('.logo-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeCard = card;

      // show box (aria)
      infoBox.classList.add('info-show');
      infoBox.setAttribute('aria-hidden', 'false');
      // move focus to info box order button for keyboard users
      infoOrder.focus({ preventScroll:true });
    }

    // helper to close info box
    function closeInfo(){
      if(activeCard) activeCard.classList.remove('active');
      activeCard = null;
      infoBox.classList.remove('info-show');
      infoBox.setAttribute('aria-hidden', 'true');
    }

    // handle hover & focus events
    logos.forEach(card => {
      // mouse enter -> open
      card.addEventListener('mouseenter', () => openInfo(card));
      // mouse leave -> close (after short delay to avoid flicker)
      card.addEventListener('mouseleave', () => {
        // if focus moved into infoBox, keep open
        setTimeout(()=> {
          if(!infoBox.contains(document.activeElement)) closeInfo();
        }, 120);
      });

      // keyboard: focus -> open
      card.addEventListener('focus', () => openInfo(card));
      // keyboard: blur -> close if focus not in infoBox
      card.addEventListener('blur', () => {
        setTimeout(()=> { if(!infoBox.contains(document.activeElement)) closeInfo(); }, 120);
      });

      // click -> immediately navigate to order with the provided data-link
      card.addEventListener('click', (e) => {
        const link = card.getAttribute('data-link') || 'order.html';
        // small animation or feedback
        card.classList.add('clicked');
        setTimeout(()=> {
          window.location.href = link;
        }, 120);
      });
    });

    // close button inside info box
    infoClose.addEventListener('click', () => closeInfo());

    // keyboard shortcuts: Escape to close info
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') closeInfo();
    });

    // clicking outside the info box closes it
    document.addEventListener('click', (e) => {
      if(infoBox.contains(e.target)) return;
      // check if clicked on any logo; if so don't close (logo handler already opened)
      if(e.target.closest('.logo-card')) return;
      closeInfo();
    }, true);
  })();

  /* ========================
     6) Smooth scroll for internal links with navbar offset
     ======================== */
  (function smoothInternalLinks(){
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const internal = Array.from(document.querySelectorAll('a[href^="#"]'));
    internal.forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if(!href || href === '#') return;
        e.preventDefault();
        const el = document.querySelector(href);
        if(!el) return;
        const y = el.getBoundingClientRect().top + window.pageYOffset - (offset - 6);
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  })();

  /* ========================
     7) Small accessibility & progressive enhancement tweaks
     - ensure contact form validates before submit (basic)
     ======================== */
  (function contactFormValidate(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    form.addEventListener('submit', (e) => {
      // basic validation (browser already enforces required)
      const nama = $('#nama').value.trim();
      const email = $('#email').value.trim();
      const pesan = $('#pesan').value.trim();
      if(!nama || !email || !pesan){
        e.preventDefault();
        alert('Isi lengkap formnya dulu ya (nama, email, pesan).');
        return false;
      }
      // optionally show loading state
      const btn = form.querySelector('.btn-primary');
      if(btn){ btn.disabled = true; btn.textContent = 'Mengirim...'; }
      // allow form to submit normally (server-side needs to exist)
    });
  })();

  /* ========================
     8) Micro parallax on mouse move (subtle)
     ======================== */
  (function microParallax(){
    const floaters = $$('.logo-card');
    if(!floaters.length) return;
    window.addEventListener('mousemove', (e) => {
      const w = window.innerWidth; const h = window.innerHeight;
      const nx = (e.clientX / w - 0.5); const ny = (e.clientY / h - 0.5);
      floaters.forEach((el, i) => {
        // small translation, varies per index
        const tx = nx * (6 + (i % 3));
        const ty = ny * (6 + (i % 2));
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
      // reset transforms back softly when mouse leaves
    }, { passive:true });

    window.addEventListener('mouseout', () => {
      floaters.forEach(el => el.style.transform = '');
    });
  })();

  /* ========================
     9) Clean up on unload (if necessary)
     ======================== */
  window.addEventListener('beforeunload', () => {
    // optional cleanup if you attach intervals/timeouts earlier
  });

});
/* End of script.js */

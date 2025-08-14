<!-- =========================================
       SCRIPTS (Animasi + Interaksi)
       - typewriter subtitle
       - reveal on scroll (IntersectionObserver)
       - smooth scroll kompensasi navbar
       - floating gimmicks (bergerak halus)
       - parallax mikro pada mousemove
       ========================================= -->
  <script>
    /* ============================================================
       TYPEWRITER EFFECT untuk subtitle hero
       - menuliskan teks satu per satu, lalu idle
       ============================================================ */
    (function(){
      const el = document.getElementById('typeTarget');
      const full = 'Teknisi Laptop • Web Developer • Electronics & Arduino Enthusiast';
      const speed = 24; // ms per karakter
      el.textContent = ''; // kosongkan dulu

      let i = 0;
      const tick = () => {
        if (i < full.length){
          el.textContent += full[i++];
          setTimeout(tick, speed);
        } else {
          // // blink caret halus biar ada “nyawa”
          el.insertAdjacentHTML('beforeend','<span id="caret">|</span>');
          const c = document.getElementById('caret');
          let vis = true;
          setInterval(()=>{ c.style.opacity = (vis=!vis) ? '1' : '0'; }, 500);
        }
      };
      setTimeout(tick, 400); // jeda kecil agar terasa organik
    })();

    /* ============================================================
       REVEAL ON SCROLL
       - semua elemen .reveal & .gal akan fade-in
       ============================================================ */
    (function(){
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: .14 });

      document.querySelectorAll('.reveal, .gal').forEach(el => io.observe(el));
      // profile-card kadang belum ter-observe karena di hero; observe manual juga
      const pc = document.getElementById('profileCard');
      if (pc) io.observe(pc);
    })();

    /* ============================================================
       SMOOTH SCROLL dgn kompensasi tinggi navbar
       ============================================================ */
    (function(){
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const links = document.querySelectorAll('a.chip[href^="#"]');
      const goto = (hash)=>{
        const el = document.querySelector(hash);
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.pageYOffset - (navH - 6);
        window.scrollTo({ top: y, behavior: 'smooth' });
      };
      links.forEach(a=>{
        a.addEventListener('click', (e)=>{
          const href = a.getAttribute('href');
          if (href && href.startsWith('#')){ e.preventDefault(); goto(href); }
        });
      });
    })();

    /* ============================================================
       FLOATING GIMMICKS (ikon melayang)
       - setiap floater bergerak naik-turun sedikit
       - tambah parallax kecil saat mouse bergerak
       ============================================================ */
    (function(){
      const floaters = [...document.querySelectorAll('.floater')];
      const base = floaters.map((el)=>({
        el,
        top: el.offsetTop,
        left: el.offsetLeft,
        amp: 12 + Math.random()*10,   // amplitudo vertikal
        spd: 3000 + Math.random()*2000 // kecepatan (ms)
      }));

      // animasi naik-turun halus
      base.forEach(({el, amp, spd})=>{
        let t0 = performance.now();
        const loop = (t)=>{
          const dt = t - t0;
          const y = Math.sin(dt / spd * Math.PI * 2) * amp;
          el.style.transform = `translateY(${y}px)`;
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      });

      // parallax mikro mengikuti mouse (tanpa bikin pusing)
      window.addEventListener('mousemove', (e)=>{
        const { innerWidth: w, innerHeight: h } = window;
        const dx = (e.clientX / w - .5) * 8;
        const dy = (e.clientY / h - .5) * 8;
        floaters.forEach((el, i)=>{
          el.style.transform += ` translate(${dx*(i%2?1:-1)}px, ${dy*(i%2?-1:1)}px)`;
        });
      }, { passive: true });
    })();

    /* ============================================================
       PARALLAX MICRO untuk intro card saat scroll
       - halus dan tidak shaky
       ============================================================ */
    (function(){
      const intro = document.getElementById('profileCard');
      if (!intro) return;
      window.addEventListener('scroll', ()=>{
        const sc = Math.min(1, window.scrollY / 300);
        intro.style.transform = `translateY(${(-8 * sc)}px)`;
        intro.style.opacity = String(1 - sc * 0.04);
      }, { passive: true });
    })();
  </script>
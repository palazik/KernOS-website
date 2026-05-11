/* ==========================================
   KernOS — main.js
   ========================================== */

// ---- Noise canvas ----
(function() {
  const canvas = document.getElementById('noise-canvas');
  const ctx = canvas.getContext('2d');
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawNoise() {
    const w = canvas.width, h = canvas.height;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 20;
    }
    ctx.putImageData(img, 0, 0);
    animId = requestAnimationFrame(drawNoise);
  }
  drawNoise();
})();

// ---- Navbar scroll ----
(function() {
  const nav = document.getElementById('navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ---- Hamburger ----
(function() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
    });
  });
})();

// ---- Typewriter terminal ----
(function() {
  const tw = document.getElementById('typewriter');
  const output = document.getElementById('t-output');

  const sequences = [
    {
      cmd: 'uname -r',
      out: '<span class="t-success">6.12.0-kernos</span>'
    },
    {
      cmd: 'cat /etc/os-release | grep PRETTY',
      out: '<span class="t-info">PRETTY_NAME="KernOS"</span>'
    },
    {
      cmd: 'grep SCHED_BORE /boot/config-$(uname -r)',
      out: '<span class="t-success">CONFIG_SCHED_BORE=y</span>'
    },
    {
      cmd: 'sysctl kernel.sched_bore',
      out: '<span class="t-success">kernel.sched_bore = 1</span>'
    },
    {
      cmd: 'cat /proc/sys/net/ipv4/tcp_congestion_control',
      out: '<span class="t-success">bbr</span>'
    },
    {
      cmd: 'grep "^HZ=" /boot/config-$(uname -r)',
      out: '<span class="t-success">HZ=1000</span>'
    },
  ];

  let seqIdx = 0;
  let charIdx = 0;
  let typing = true;
  let pauseAfter = false;
  let pauseTimer = null;

  function typeChar() {
    const seq = sequences[seqIdx];
    if (typing) {
      if (charIdx < seq.cmd.length) {
        tw.textContent += seq.cmd[charIdx++];
        setTimeout(typeChar, 55 + Math.random() * 40);
      } else {
        typing = false;
        setTimeout(showOutput, 300);
      }
    }
  }

  function showOutput() {
    output.innerHTML = sequences[seqIdx].out;
    pauseTimer = setTimeout(nextSeq, 2200);
  }

  function nextSeq() {
    tw.textContent = '';
    output.innerHTML = '';
    charIdx = 0;
    typing = true;
    seqIdx = (seqIdx + 1) % sequences.length;
    setTimeout(typeChar, 400);
  }

  // Start after delay
  setTimeout(typeChar, 1800);
})();

// ---- Animated counters ----
(function() {
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el, target, duration = 1500) {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('[data-target]');
        nums.forEach(el => {
          animateCounter(el, parseInt(el.dataset.target));
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
})();

// ---- Intersection observer reveals ----
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Stagger delay based on sibling index
        const siblings = Array.from(el.parentElement.children);
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = (idx * 80) + 'ms';
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.kf-reveal, .feat-reveal, .reveal-card').forEach(el => {
    observer.observe(el);
  });
})();

// ---- Copy buttons ----
(function() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      navigator.clipboard.writeText(code).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
})();

// ---- Tabs ----
(function() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
})();

// ---- ASCII art color animation ----
(function() {
  const art = document.getElementById('ascii-art');
  if (!art) return;

  let hue = 120; // start at green
  let dir = 1;

  setInterval(() => {
    hue += dir * 0.5;
    if (hue > 140) dir = -1;
    if (hue < 110) dir = 1;
    art.style.color = `hsl(${hue}, 60%, 38%)`;
    art.style.textShadow = `0 0 10px hsla(${hue}, 60%, 38%, 0.6)`;
  }, 50);
})();

// ---- Smooth mobile menu scroll close ----
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

// ---- Parallax subtle hero tilt ----
(function() {
  const hero = document.querySelector('#hero');
  if (!hero) return;
  let rafId;

  window.addEventListener('mousemove', (e) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      const ascii = document.querySelector('.ascii-art');
      if (ascii) {
        ascii.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      }
    });
  });
})();

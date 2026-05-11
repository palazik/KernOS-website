/* main.js — KernOS website interactions */

// ── Nav scroll state ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Animated grid canvas ──
(function initGrid() {
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, cols, rows;
  let pulses = [];

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    cols = Math.ceil(w / 60) + 1;
    rows = Math.ceil(h / 60) + 1;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  function addPulse() {
    pulses.push({
      col: Math.floor(Math.random() * cols),
      row: Math.floor(Math.random() * rows),
      r: 0,
      maxR: 120 + Math.random() * 80,
      alpha: 0.7
    });
  }

  setInterval(addPulse, 800);

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const gridSize = 60;
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 0.5;

    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * gridSize, 0);
      ctx.lineTo(c * gridSize, h);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * gridSize);
      ctx.lineTo(w, r * gridSize);
      ctx.stroke();
    }

    // Intersection dots
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.arc(c * gridSize, r * gridSize, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Pulse waves
    pulses = pulses.filter(p => p.alpha > 0.01);
    for (const p of pulses) {
      const cx = p.col * gridSize;
      const cy = p.row * gridSize;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.r);
      grad.addColorStop(0, `rgba(0, 229, 255, 0)`);
      grad.addColorStop(0.7, `rgba(0, 229, 255, ${p.alpha * 0.15})`);
      grad.addColorStop(1, `rgba(0, 229, 255, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.r += 1.2;
      p.alpha *= 0.97;
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

// ── Scroll reveal ──
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger siblings
  const groups = {};
  els.forEach(el => {
    const parent = el.parentElement;
    const key = parent ? parent.className : 'root';
    if (!groups[key]) groups[key] = [];
    groups[key].push(el);
  });

  Object.values(groups).forEach(group => {
    group.forEach((el, i) => {
      el.dataset.delay = i * 80;
      observer.observe(el);
    });
  });
})();

// ── Copy code ──
function copyCode(id) {
  const pre = document.getElementById(id);
  if (!pre) return;

  const text = pre.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = pre.previousElementSibling?.querySelector('.cb-copy');
    if (btn) {
      btn.textContent = 'copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'copy';
        btn.classList.remove('copied');
      }, 2000);
    }
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ── Stat counter animation ──
(function animateStats() {
  const statEls = document.querySelectorAll('.stat-val');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.textContent);
        if (isNaN(target)) return;
        let start = 0;
        const duration = 1200;
        const step = (ts) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * ease);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
})();

// ── Active nav link highlighting ──
(function activeNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--cyan)' : '';
    });
  }, { passive: true });
})();

// ── Glitch effect on hero title hover ──
(function glitchTitle() {
  const lines = document.querySelectorAll('.title-line');
  lines.forEach(line => {
    line.addEventListener('mouseenter', () => {
      line.style.animation = 'none';
      line.offsetHeight; // reflow
      line.style.animation = 'glitch 0.3s ease forwards';
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes glitch {
      0%   { transform: none; opacity: 1; }
      10%  { transform: translate(-2px, 0) skewX(-3deg); opacity: 0.8; }
      20%  { transform: translate(2px, 0) skewX(3deg); opacity: 0.9; }
      30%  { transform: translate(-1px, 0); opacity: 1; }
      40%  { transform: translate(1px, 0) skewX(-1deg); }
      50%  { transform: none; }
      100% { transform: none; opacity: 1; }
    }
  `;
  document.head.appendChild(style);
})();

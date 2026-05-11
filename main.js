/* ==========================================
   KernOS — main.js
   ========================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  }, { passive: true });
})();

// ---- Hamburger ----
(function() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    menu.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
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
      out: '7.0.6-kernos',
      type: 'success'
    },
    {
      cmd: 'cat /etc/os-release | grep PRETTY',
      out: 'PRETTY_NAME="KernOS"',
      type: 'info'
    },
    {
      cmd: 'grep SCHED_BORE /boot/config-$(uname -r)',
      out: 'CONFIG_SCHED_BORE=y',
      type: 'success'
    },
    {
      cmd: 'sysctl kernel.sched_bore',
      out: 'kernel.sched_bore = 1',
      type: 'success'
    },
    {
      cmd: 'cat /proc/sys/net/ipv4/tcp_congestion_control',
      out: 'bbr',
      type: 'success'
    },
    {
      cmd: 'grep "^HZ=" /boot/config-$(uname -r)',
      out: 'HZ=1000',
      type: 'success'
    },
  ];

  let seqIdx = 0;
  let charIdx = 0;
  let typing = true;
  let timerId = null;

  if (prefersReducedMotion) {
    tw.textContent = sequences[0].cmd;
    output.textContent = sequences[0].out;
    output.className = `t-output t-${sequences[0].type}`;
    return;
  }

  function schedule(fn, delay) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn();
    }, delay);
  }

  function typeChar() {
    if (document.hidden) {
      return;
    }

    const seq = sequences[seqIdx];
    if (typing) {
      if (charIdx < seq.cmd.length) {
        tw.textContent += seq.cmd[charIdx++];
        schedule(typeChar, 55 + Math.random() * 40);
      } else {
        typing = false;
        schedule(showOutput, 300);
      }
    }
  }

  function showOutput() {
    const seq = sequences[seqIdx];
    output.textContent = seq.out;
    output.className = `t-output t-${seq.type}`;
    schedule(nextSeq, 2200);
  }

  function nextSeq() {
    tw.textContent = '';
    output.textContent = '';
    output.className = 't-output';
    charIdx = 0;
    typing = true;
    seqIdx = (seqIdx + 1) % sequences.length;
    schedule(typeChar, 400);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timerId) {
      clearTimeout(timerId);
      timerId = null;
      return;
    }

    if (!document.hidden && !timerId) schedule(typeChar, 250);
  });

  // Start after delay
  schedule(typeChar, 1800);
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
      const write = navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(code)
        : Promise.reject(new Error('Clipboard API unavailable'));

      write.then(() => {
        const orig = btn.textContent;
        btn.textContent = 'copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback
        const orig = btn.textContent;
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = orig;
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
  if (!art || prefersReducedMotion) return;

  let hue = 120; // start at green
  let dir = 1;
  let intervalId = null;

  function tick() {
    if (document.hidden) return;

    hue += dir * 0.5;
    if (hue > 140) dir = -1;
    if (hue < 110) dir = 1;
    art.style.color = `hsl(${hue}, 60%, 38%)`;
    art.style.textShadow = `0 0 10px hsla(${hue}, 60%, 38%, 0.6)`;
  }

  intervalId = setInterval(tick, 80);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(intervalId);
      intervalId = null;
    } else if (!intervalId) {
      intervalId = setInterval(tick, 80);
    }
  });
})();

// ---- Smooth mobile menu scroll close ----
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
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
  const ascii = document.querySelector('.ascii-art');
  if (!hero || !ascii || prefersReducedMotion) return;
  let rafId;

  window.addEventListener('mousemove', (e) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      ascii.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      rafId = null;
    });
  }, { passive: true });
})();

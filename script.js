/* ============================================
   WEDDING INVITATION — Subxon & Malika
   script.js — Interactions, Animations, Timer
   ============================================ */

/* ---- ENVELOPE OPEN ---- */
function openInvitation() {
  const overlay = document.getElementById('envelope-overlay');
  const main    = document.getElementById('main-content');
  const musicBtn = document.getElementById('music-btn');

  overlay.classList.add('closing');

  setTimeout(() => {
    overlay.style.display = 'none';
    main.classList.remove('hidden');

    // Trigger reflow then fade in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        main.classList.add('visible');
      });
    });

    musicBtn.classList.remove('hidden');
    startPetals();
    startCountdown();
    initScrollAnimations();
  }, 800);
}

/* ---- COUNTDOWN TIMER ---- */
function startCountdown() {
  const weddingDate = new Date('2026-09-20T15:00:00');

  function update() {
    const now  = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('days').textContent    = '00';
      document.getElementById('hours').textContent   = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent    = String(days).padStart(2, '0');
    document.getElementById('hours').textContent   = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ---- SCROLL FADE-IN (IntersectionObserver) ---- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
}

/* ---- MUSIC PLAYER ---- */
let isPlaying = false;

function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('music-btn');
  const icon  = document.getElementById('music-icon');

  if (isPlaying) {
    audio.pause();
    icon.textContent = '♪';
    btn.classList.remove('playing');
    isPlaying = false;
  } else {
    audio.play().catch(() => {
      // Autoplay blocked — user interaction required (already handled by click)
      console.log('Audio play failed. Check the audio source URL.');
    });
    icon.textContent = '♫';
    btn.classList.add('playing');
    isPlaying = true;
  }
}

/* ---- FALLING ROSE PETALS (Canvas) ---- */
function startPetals() {
  const canvas = document.getElementById('petals-canvas');
  const ctx    = canvas.getContext('2d');

  // Resize canvas to window
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Petal shapes — drawn as simple bezier curves
  const PETAL_COLORS = [
    'rgba(244,194,194,0.7)',
    'rgba(255,182,193,0.6)',
    'rgba(212,175,55,0.4)',
    'rgba(255,200,200,0.5)',
    'rgba(240,160,160,0.5)',
  ];

  const PETAL_COUNT = 28;
  const petals = [];

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createPetal() {
    return {
      x:        randomBetween(0, canvas.width),
      y:        randomBetween(-100, -10),
      size:     randomBetween(8, 18),
      speedY:   randomBetween(0.8, 2.2),
      speedX:   randomBetween(-0.6, 0.6),
      rotation: randomBetween(0, Math.PI * 2),
      rotSpeed: randomBetween(-0.02, 0.02),
      opacity:  randomBetween(0.5, 0.9),
      color:    PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      sway:     randomBetween(0.3, 0.8),
      swayOffset: randomBetween(0, Math.PI * 2),
    };
  }

  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = createPetal();
    p.y = randomBetween(-canvas.height, canvas.height); // spread initial positions
    petals.push(p);
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    // Draw a simple rose petal shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      p.size * 0.5, -p.size * 0.8,
      p.size,       -p.size * 0.5,
      p.size * 0.8,  0
    );
    ctx.bezierCurveTo(
      p.size,        p.size * 0.5,
      p.size * 0.5,  p.size * 0.8,
      0,             0
    );
    ctx.fill();
    ctx.restore();
  }

  let frame = 0;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    petals.forEach(p => {
      // Sway side to side
      p.x += p.speedX + Math.sin(frame * 0.01 + p.swayOffset) * p.sway;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      drawPetal(p);

      // Reset petal when it falls off screen
      if (p.y > canvas.height + 20) {
        Object.assign(p, createPetal());
        p.y = -20;
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ---- SPARKLE EFFECT on couple names ---- */
// Creates small gold sparkle dots that appear/disappear around the names
(function initSparkles() {
  // We'll run this after the main content is shown
  const originalOpen = window.openInvitation;
  window.openInvitation = function() {
    originalOpen && originalOpen();
    setTimeout(spawnSparkles, 1200);
  };

  function spawnSparkles() {
    const targets = document.querySelectorAll('.shimmer-text');
    targets.forEach(target => {
      setInterval(() => {
        const sparkle = document.createElement('span');
        sparkle.className = 'sparkle-dot';
        sparkle.style.cssText = `
          position: absolute;
          width: ${4 + Math.random() * 6}px;
          height: ${4 + Math.random() * 6}px;
          background: radial-gradient(circle, #f5e6a3, #d4af37);
          border-radius: 50%;
          pointer-events: none;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: sparkleFade 1.2s ease forwards;
          z-index: 2;
        `;

        // Ensure parent is positioned
        if (getComputedStyle(target).position === 'static') {
          target.style.position = 'relative';
        }

        target.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1200);
      }, 400);
    });

    // Inject sparkle keyframe if not already present
    if (!document.getElementById('sparkle-style')) {
      const style = document.createElement('style');
      style.id = 'sparkle-style';
      style.textContent = `
        @keyframes sparkleFade {
          0%   { opacity: 0; transform: scale(0) translateY(0); }
          40%  { opacity: 1; transform: scale(1) translateY(-4px); }
          100% { opacity: 0; transform: scale(0.5) translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }
  }
})();

// ── Video Autoplay ──────────────────────────────
const video = document.getElementById('bg-video');

if (video) {
    video.play().catch(() => {
        video.muted = true;
        video.play();
    });
}

// ── Sound Toggle ────────────────────────────────
const toggle = document.getElementById('sound-toggle');
const iconMuted = document.getElementById('icon-muted');
const iconUnmuted = document.getElementById('icon-unmuted');

toggle.addEventListener('click', () => {
    video.muted = !video.muted;
    iconMuted.style.display = video.muted ? 'block' : 'none';
    iconUnmuted.style.display = video.muted ? 'none' : 'block';
});

// ── 3D Parallax Tilt on Text ────────────────────
const content = document.getElementById('content');
const headline = document.getElementById('headline');
const subhead = document.getElementById('subhead');

const MAX_ROTATION = 8;

content.addEventListener('mousemove', (e) => {
    const rect = content.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const rotateY = x * MAX_ROTATION;
    const rotateX = -y * MAX_ROTATION;

    const perspective = 'perspective(600px)';
    headline.style.transform = `${perspective} rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    subhead.style.transform = `${perspective} rotateX(${rotateX * 0.6}deg) rotateY(${rotateY * 0.6}deg)`;
});

content.addEventListener('mouseleave', () => {
    const reset = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
    headline.style.transform = reset;
    subhead.style.transform = reset;
});

// ── View Toggle & Scroll/Drag Interaction ─
const hero = document.getElementById('hero');
const projects = document.getElementById('projects');
const homeBtn = document.getElementById('home-btn');
const ctaPrimary = document.getElementById('cta-primary');

let lastSection = 'projects'; // Defaults to projects
let isDragging = false;
let startY = 0;
let currentY = 0;
const DRAG_THRESHOLD = 150; // pixels to drag before it snaps closed

// Go to Projects
const openProjects = () => {
    projects.classList.add('active');
    hero.classList.add('scaled-back');
    projects.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    projects.style.transform = '';
    lastSection = 'projects';

    const radioIframe = document.getElementById('radio-iframe');
    if (!radioIframe.src) {
        radioIframe.src = radioIframe.getAttribute('data-src');
    }
};

ctaPrimary.addEventListener('click', (e) => {
    e.preventDefault();
    openProjects();
});

// Go Back Function
const closeProjects = () => {
    projects.classList.remove('active');
    hero.classList.remove('scaled-back');
    projects.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    projects.style.transform = '';
};

// Home Button Click
homeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeProjects();
});

// Drag to Close Logic
const onDragStart = (y) => {
    if (projects.scrollTop > 0) return;
    isDragging = true;
    startY = y;
    projects.style.transition = 'none';
};

const onDragMove = (y) => {
    if (!isDragging) return;
    currentY = y - startY;

    if (currentY > 0) {
        projects.style.transform = `translateY(calc(-100vh + ${currentY}px))`;
    }
};

const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    if (currentY > DRAG_THRESHOLD) {
        closeProjects();
    } else {
        projects.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        projects.classList.add('active');
        hero.classList.add('scaled-back');
        projects.style.transform = '';
        hero.style.transform = '';
        hero.style.opacity = '';
    }
    currentY = 0;
};

// ── Event Listeners ──────────
projects.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientY), { passive: true });
projects.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientY), { passive: true });
projects.addEventListener('touchend', onDragEnd);

projects.addEventListener('mousedown', (e) => onDragStart(e.clientY));
window.addEventListener('mousemove', (e) => onDragMove(e.clientY));
window.addEventListener('mouseup', onDragEnd);

// Wheel Interaction (Bi-directional)
let scrollIntentAccumulator = 0;
let heroScrollIntentAccumulator = 0;

window.addEventListener('wheel', (e) => {
    // 1. SCROLL DOWN FROM HERO VIEW
    if (!projects.classList.contains('active')) {
        if (e.deltaY > 0) {
            e.preventDefault();
            heroScrollIntentAccumulator += Math.abs(e.deltaY);

            const progress = Math.min(heroScrollIntentAccumulator / 300, 1);
            if (progress < 1) {
                // Scale hero slightly DOWN
                const currentScale = 1 - (0.08 * progress);
                const currentOpacity = 1 - (0.7 * progress);
                hero.style.transition = 'none';
                hero.style.transform = `scale(${currentScale}) translateY(-${progress * 2}%)`;
                hero.style.opacity = currentOpacity;

                // Peek projects section UP
                projects.style.transition = 'none';
                projects.style.transform = `translateY(calc(100vh - ${progress * 250}px))`;
            }

            if (heroScrollIntentAccumulator > 300) {
                hero.style.transform = '';
                hero.style.opacity = '';
                hero.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
                if (lastSection === 'projects') openProjects();
                heroScrollIntentAccumulator = 0;
            }
        } else {
            // Reset if scroll UP
            heroScrollIntentAccumulator = 0;
            hero.style.transform = '';
            hero.style.opacity = '';
            projects.style.transform = '';
        }
        return;
    }

    // 2. SCROLL UP FROM SECTION VIEW (RETURN TO HERO)
    if (projects.scrollTop > 0) return;

    if (e.deltaY < 0) {
        e.preventDefault();
        scrollIntentAccumulator += Math.abs(e.deltaY);

        const progress = Math.min(scrollIntentAccumulator / 300, 1);
        if (progress < 1) {
            const currentScale = 0.92 + (0.08 * progress);
            const currentOpacity = 0.3 + (0.7 * progress);
            hero.style.transition = 'none';
            hero.style.transform = `scale(${currentScale}) translateY(-${2 - (2 * progress)}%)`;
            hero.style.opacity = currentOpacity;

            projects.style.transition = 'none';
            projects.style.transform = `translateY(calc(-100vh + ${progress * 150}px))`;
        }

        if (scrollIntentAccumulator > 300 && !isDragging) {
            hero.style.transform = '';
            hero.style.opacity = '';
            hero.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
            closeProjects();
            scrollIntentAccumulator = 0;
        }
    } else {
        scrollIntentAccumulator = 0;
        hero.style.transform = '';
        hero.style.opacity = '';
        projects.style.transform = '';
    }
}, { passive: false });
// ── Intersection Observer for Reveals ──────────
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    revealObserver.observe(el);
});

// ── Copy to Clipboard & Toast ──────────────────
const toast = document.getElementById('toast');
const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Command copied to clipboard');
    });
};

document.getElementById('heroCopy')?.addEventListener('click', () => copyToClipboard('npx shp-serve'));

// ── ship.it Terminal Simulation ────────────────
const typed = document.getElementById('heroTyped');
const caret = document.getElementById('heroCaret');
const out = document.getElementById('heroOut');
const cmd = 'npx shp-serve';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function runTerminalSimulation() {
    if (!typed || !out) return;

    // Reset
    typed.textContent = '';
    out.innerHTML = '';
    caret.style.display = 'inline-block';

    await wait(1000);
    for (const ch of cmd) {
        typed.textContent += ch;
        await wait(50 + Math.random() * 50);
    }
    await wait(500);
    caret.style.display = 'none';

    const lines = [
        ['', ''],
        ['  ▸ Detecting framework…  Next.js 14', ''],
        ['  ▸ Opening tunnel…       port 3000', ''],
        ['  ▸ Generating link…      done', ''],
        ['', ''],
        ['  ✓ Live at  ', 'out-ok', 'https://shp.it/a7x3k9', 'out-url'],
        ['  ↳ copied to clipboard', ''],
        ['  ↳ expires in 24 h', ''],
    ];

    for (const l of lines) {
        const div = document.createElement('div');
        div.style.fontFamily = "'JetBrains Mono', monospace";
        div.style.fontSize = '0.78rem';
        div.style.lineHeight = '1.8';

        if (l.length === 4) {
            div.innerHTML = `<span class="${l[1]}">${l[0]}</span><span class="${l[3]}">${l[2]}</span>`;
        } else {
            div.textContent = l[0];
            if (l[1]) div.className = l[1];
        }
        out.appendChild(div);
        await wait(l[0] === '' ? 50 : 150);
    }
}

// Start simulation when ship.it section is in view
const shpitSection = document.getElementById('shpit-wrap');
const shpitObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        runTerminalSimulation();
        shpitObserver.unobserve(shpitSection);
    }
}, { threshold: 0.3 });

if (shpitSection) shpitObserver.observe(shpitSection);

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

let isDragging = false;
let startY = 0;
let currentY = 0;
const DRAG_THRESHOLD = 150; // pixels to drag before it snaps closed

// Go to Projects
ctaPrimary.addEventListener('click', (e) => {
    e.preventDefault();
    projects.classList.add('active');
    hero.classList.add('scaled-back'); // Trigger dramatic push back
    projects.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    projects.style.transform = ''; // clears inline style, uses class

    // Lazy load the iframe on first open
    const radioIframe = document.getElementById('radio-iframe');
    if (!radioIframe.src) {
        radioIframe.src = radioIframe.getAttribute('data-src');
    }
});

// Go Back Function
const closeProjects = () => {
    projects.classList.remove('active');
    hero.classList.remove('scaled-back'); // Trigger dramatic pull forward
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
    // Only allow drag if we are scrolled to the top of the projects section
    if (projects.scrollTop > 0) return;
    isDragging = true;
    startY = y;
    projects.style.transition = 'none'; // Disable transition for 1:1 follow
};

const onDragMove = (y) => {
    if (!isDragging) return;
    currentY = y - startY;

    // Only allow dragging downwards
    if (currentY > 0) {
        projects.style.transform = `translateY(calc(-100vh + ${currentY}px))`;
    }
};

const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    if (currentY > DRAG_THRESHOLD) {
        closeProjects(); // Snap closed
    } else {
        // Snap back open
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
// Touch Events
projects.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientY), { passive: true });
projects.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientY), { passive: true });
projects.addEventListener('touchend', onDragEnd);

// Mouse Events (for desktop testing)
projects.addEventListener('mousedown', (e) => onDragStart(e.clientY));
window.addEventListener('mousemove', (e) => onDragMove(e.clientY));
window.addEventListener('mouseup', onDragEnd);

// Wheel (Trackpad / Mouse wheel) Scroll Up Return
let scrollIntentAccumulator = 0;
window.addEventListener('wheel', (e) => {
    // Only care if we are in Projects view AND scrolled to the absolute top
    if (!projects.classList.contains('active')) return;
    if (projects.scrollTop > 0) return;

    // e.deltaY is negative when scrolling UP
    if (e.deltaY < 0) {
        // Stop default browser behavior (e.g., rubber-banding on Mac)
        e.preventDefault();
        scrollIntentAccumulator += Math.abs(e.deltaY);

        // Scale the hero subtly as you scroll up to hint at the gesture
        const progress = Math.min(scrollIntentAccumulator / 300, 1);
        if (progress < 1) {
            // Unscale from 0.92 back toward 1
            const currentScale = 0.92 + (0.08 * progress);
            const currentOpacity = 0.3 + (0.7 * progress);
            hero.style.transition = 'none';
            hero.style.transform = `scale(${currentScale}) translateY(-${2 - (2 * progress)}%)`;
            hero.style.opacity = currentOpacity;

            projects.style.transition = 'none';
            projects.style.transform = `translateY(calc(-100vh + ${progress * 150}px))`;
        }

        if (scrollIntentAccumulator > 300 && !isDragging) {
            // Trigger the full dramatic close
            hero.style.transform = '';
            hero.style.opacity = '';
            hero.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
            closeProjects();
            scrollIntentAccumulator = 0; // Reset
        }
    } else {
        // Scrolling down resets the intent
        scrollIntentAccumulator = 0;
        hero.style.transform = '';
        hero.style.opacity = '';
        projects.style.transform = '';
    }
}, { passive: false });

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
const homeBtn = document.getElementById('home-btn');
const ctaPrimary = document.getElementById('cta-primary');

// Define sliding stack order (Now a 2-panel gateway system)
const panels = [
    document.getElementById('hero'),
    document.getElementById('main-content')
];

let activeIndex = 0;
let previousIndex = 0;
let scrollIntent = 0;
let isDragging = false;
let isTransitioning = false; // Lock to prevent multi-skipping
let startY = 0;
let currentY = 0;
const DRAG_THRESHOLD = 150;

// Dynamic Iframe Loading Strategy
// ── Iframe Lazy Loader (Intersection Observer) ──
const projectIframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const iframe = entry.target;
            if (!iframe.src) {
                iframe.src = iframe.getAttribute('data-src');
            }
            // Optional: unobserve after loading to save resources
            // projectIframeObserver.unobserve(iframe);
        }
    });
}, { threshold: 0.1, rootMargin: '200px' });

document.querySelectorAll('.project-iframe').forEach(iframe => {
    projectIframeObserver.observe(iframe);
});

function setActivePanel(index) {
    if (isTransitioning || index < 0 || index >= panels.length) return;

    isTransitioning = true;
    const oldIndex = activeIndex;

    panels.forEach((panel, i) => {
        if (!panel) return;

        panel.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s cubic-bezier(0.16, 1, 0.3, 1)';

        if (i < index) {
            // Panels above active (Hero)
            if (i === 0) {
                panel.classList.add('scaled-back');
                panel.style.transform = '';
                panel.style.filter = 'brightness(0.3)';
            }
            panel.classList.remove('active');
        }
        else if (i === index) {
            // Active panel
            if (i === 0) {
                panel.classList.remove('scaled-back');
                panel.style.transform = '';
                panel.style.filter = 'brightness(1)';
            } else {
                panel.classList.add('active');
                panel.style.transform = 'translateY(-100vh)';
                panel.style.filter = 'brightness(1)';
            }
        }
    });

    setTimeout(() => {
        isTransitioning = false;
        scrollIntent = 0;
    }, 700);

    previousIndex = oldIndex;
    activeIndex = index;
}

// Home Button Click
if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setActivePanel(0);
    });
}

// CTA Listeners
if (ctaPrimary) {
    ctaPrimary.addEventListener('click', (e) => {
        e.preventDefault();
        if (activeIndex === 0) {
            setActivePanel(1);
        } else {
            document.getElementById('xtc-section').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

const ctaSecondary = document.getElementById('cta-secondary');
if (ctaSecondary) {
    ctaSecondary.addEventListener('click', (e) => {
        e.preventDefault();
        const contactSection = document.getElementById('contact-section');
        if (activeIndex === 0) {
            setActivePanel(1);
            // Wait for transition, then scroll
            setTimeout(() => {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }, 800);
        } else {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Drag & Touch Swipe to Navigate Logic (Mobile support)
const onDragStart = (e) => {
    if (isTransitioning) return;
    isDragging = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    currentY = 0;
};

const onDragMove = (e) => {
    if (!isDragging || isTransitioning) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    currentY = y - startY;
    const currentPanel = panels[activeIndex];

    // Handle Hero -> Content transition (Swiping Up)
    if (activeIndex === 0) {
        if (currentY < 0) {
            e.preventDefault();
            const progress = Math.min(Math.abs(currentY) / 300, 1);
            const nextPanel = panels[1];

            if (progress < 1) {
                currentPanel.style.transition = 'none';
                currentPanel.style.transform = `scale(${1 - (0.08 * progress)}) translateY(-${progress * 2}%)`;
                currentPanel.style.filter = `brightness(${1 - (0.7 * progress)})`;

                nextPanel.style.transition = 'none';
                nextPanel.style.transform = `translateY(calc(100vh - ${progress * 250}px))`;
            }
        }
    }
    // Handle Content -> Hero transition (Swiping Down from TOP)
    else if (activeIndex === 1) {
        if (currentPanel.scrollTop <= 0 && currentY > 0) {
            e.preventDefault();
            const progress = Math.min(currentY / 300, 1);
            const prevPanel = panels[0];

            if (progress < 1) {
                prevPanel.style.transition = 'none';
                prevPanel.style.transform = `scale(${0.92 + (0.08 * progress)}) translateY(-${2 - (2 * progress)}%)`;
                prevPanel.style.filter = `brightness(${0.3 + (0.7 * progress)})`;

                currentPanel.style.transition = 'none';
                currentPanel.style.transform = `translateY(calc(-100vh + ${progress * 150}px))`;
            }
        }
        // If we are scrolling inside the panel, DO NOTHING. No resets, no preventDefault.
    }
};

const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    if (Math.abs(currentY) > DRAG_THRESHOLD) {
        if (currentY < 0 && activeIndex === 0) {
            setActivePanel(1);
        } else if (currentY > 0 && activeIndex === 1 && panels[1].scrollTop <= 0) {
            setActivePanel(0);
        }
    } else if (currentY !== 0) {
        setActivePanel(activeIndex);
    }
    currentY = 0;
};

// Bind Drag Event Listeners
panels.forEach((p) => {
    if (!p) return;
    p.addEventListener('touchstart', onDragStart, { passive: true });
    p.addEventListener('touchmove', onDragMove, { passive: false });
    p.addEventListener('touchend', onDragEnd);
    p.addEventListener('mousedown', onDragStart);
});
window.addEventListener('mousemove', onDragMove, { passive: false });
window.addEventListener('mouseup', onDragEnd);

// Wheel Interaction (Multi-Directional intent scale)
let wheelTimeout;

window.addEventListener('wheel', (e) => {
    const currentPanel = panels[activeIndex];
    if (!currentPanel) return;

    if (isTransitioning) {
        e.preventDefault();
        return;
    }

    // 1. SCROLL DOWN from Hero
    if (e.deltaY > 0 && activeIndex === 0) {
        e.preventDefault();
        scrollIntent += Math.abs(e.deltaY);

        const progress = Math.min(scrollIntent / 300, 1);
        const nextPanel = panels[1];

        if (progress < 1) {
            currentPanel.style.transition = 'none';
            currentPanel.style.transform = `scale(${1 - (0.08 * progress)}) translateY(-${progress * 2}%)`;
            currentPanel.style.filter = `brightness(${1 - (0.7 * progress)})`;

            nextPanel.style.transition = 'none';
            nextPanel.style.transform = `translateY(calc(100vh - ${progress * 250}px))`;
        }

        if (scrollIntent > 300) {
            setActivePanel(1);
        }
    }
    // 2. SCROLL UP from Content top
    else if (e.deltaY < 0 && activeIndex === 1 && currentPanel.scrollTop <= 0) {
        e.preventDefault();
        scrollIntent += Math.abs(e.deltaY);

        const progress = Math.min(scrollIntent / 300, 1);
        const prevPanel = panels[0];

        if (progress < 1) {
            prevPanel.style.transition = 'none';
            prevPanel.style.transform = `scale(${0.92 + (0.08 * progress)}) translateY(-${2 - (2 * progress)}%)`;
            prevPanel.style.filter = `brightness(${0.3 + (0.7 * progress)})`;

            currentPanel.style.transition = 'none';
            currentPanel.style.transform = `translateY(calc(-100vh + ${progress * 150}px))`;
        }

        if (scrollIntent > 300) {
            setActivePanel(0);
        }
    } else {
        scrollIntent = 0;
    }

    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
        if (scrollIntent > 0 && !isTransitioning) {
            scrollIntent = 0;
            setActivePanel(activeIndex);
        }
    }, 150);
}, { passive: false });

// ── Conversational Form Logic ───────────────────
const madlibsForm = document.getElementById('madlibs-form');
const toast = document.getElementById('toast');
const submitBtn = document.getElementById('submit-btn');

if (madlibsForm) {
    // Auto-resize inputs to fit content
    const inputs = madlibsForm.querySelectorAll('input');
    const sensor = document.createElement('span');
    sensor.className = 'input-resize-sensor';
    document.body.appendChild(sensor);

    const resizeInput = (input) => {
        // Measure text width using invisible sensor
        sensor.style.fontFamily = window.getComputedStyle(input).fontFamily;
        sensor.style.fontSize = window.getComputedStyle(input).fontSize;
        sensor.textContent = input.value || input.placeholder;

        // Add minimal padding to the calculated width
        const newWidth = Math.max(sensor.clientWidth + 10, input.placeholder.length * 12);
        input.style.width = `${newWidth}px`;
    };

    inputs.forEach(input => {
        // Initial sizing
        resizeInput(input);

        // Resize on type
        input.addEventListener('input', () => resizeInput(input));
    });

    // Form Submission Override
    madlibsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btnIcon = submitBtn.querySelector('.btn-icon');
        const originalSVG = btnIcon.innerHTML;

        // Loading State (SVG Spinner)
        btnIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
        btnIcon.classList.add('spinning');
        submitBtn.style.pointerEvents = 'none';
        submitBtn.style.opacity = '0.7';

        // Collect form data
        const formData = new FormData(madlibsForm);

        // Submit via AJAX to FormSubmit
        fetch("https://formsubmit.co/ajax/edohoeketio@gmail.com", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                // Success State
                toast.textContent = "Message sent successfully.";
                toast.classList.add('show');

                // Reset Form & Button
                madlibsForm.reset();
                inputs.forEach(input => resizeInput(input)); // reset widths

                btnIcon.innerHTML = originalSVG;
                btnIcon.classList.remove('spinning');
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.opacity = '1';

                // Hide Toast
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            })
            .catch(error => {
                // Error State
                toast.textContent = "Error sending message. Try again.";
                toast.style.background = "#ff3333";
                toast.style.color = "#fff";
                toast.classList.add('show');

                btnIcon.innerHTML = originalSVG;
                btnIcon.classList.remove('spinning');
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.opacity = '1';

                setTimeout(() => {
                    toast.classList.remove('show');
                    toast.style.background = ""; // Reset to default
                    toast.style.color = "";
                }, 3000);
            });
    });
}
// Magnetic effect on submit button
if (submitBtn) {
    submitBtn.addEventListener('mousemove', (e) => {
        const rect = submitBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        submitBtn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    submitBtn.addEventListener('mouseleave', () => {
        submitBtn.style.transform = 'translate(0px, 0px)';
    });
}

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

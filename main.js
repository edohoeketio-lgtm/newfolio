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

// Define sliding stack order
const panels = [
    document.getElementById('hero'),
    document.getElementById('xtc-panel'),
    document.getElementById('shpit-panel'),
    document.getElementById('contact-panel')
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
function hydratePanel(index) {
    if (index === 0 || index === panels.length - 1) return; // Hero and Contact have no iframes
    const panel = panels[index];
    if (!panel) return;

    const iframes = panel.querySelectorAll('iframe.project-iframe');
    iframes.forEach(iframe => {
        if (!iframe.src) iframe.src = iframe.getAttribute('data-src');
    });
}

function setActivePanel(index) {
    if (isTransitioning || index < 0 || index >= panels.length) return;

    isTransitioning = true;
    const oldIndex = activeIndex;

    panels.forEach((panel, i) => {
        if (!panel) return;

        // Skip animation for panels that are mathematically bypassed (prevents sliding through viewport)
        if (Math.abs(index - oldIndex) > 1 && i !== index && i !== oldIndex) {
            panel.style.transition = 'none';
        } else {
            panel.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        if (i < index) {
            // Panels above the active one sink backwards exactly like the old hero behavior
            // If jumped past (e.g. 0 -> 3), bypass sinking sequence and queue them to bottom automatically
            if (i > oldIndex && oldIndex < index) {
                panel.classList.remove('active');
                if (i !== 0) panel.style.transform = 'translateY(100vh)';
                panel.style.filter = 'brightness(1)';
            } else {
                if (i === 0) {
                    panel.classList.add('scaled-back');
                    panel.style.transform = '';
                } else {
                    panel.style.transform = 'translateY(-100vh) scale(0.92)';
                    panel.style.filter = 'brightness(0.3)';
                }
                panel.classList.remove('active');
            }
        }
        else if (i === index) {
            // Active panel slides up into view focus
            if (i === 0) {
                panel.classList.remove('scaled-back');
                panel.style.transform = '';
            } else {
                panel.classList.add('active');
                panel.style.transform = 'translateY(-100vh)';
            }
            panel.style.filter = 'brightness(1)';
        }
        else {
            // Panels below active wait in the queue at the bottom
            panel.classList.remove('active');
            if (i !== 0) {
                panel.style.transform = 'translateY(100vh)';
            }
            panel.style.filter = 'brightness(1)';
        }
    });

    // Exact lock duration to match CSS transform, preventing rapid accidental skipping
    setTimeout(() => {
        if (panels[index]) panels[index].scrollTop = 0;
        isTransitioning = false;
        scrollIntent = 0;
    }, 700);

    previousIndex = oldIndex;
    activeIndex = index;
    hydratePanel(activeIndex);
}

// CTA Button Click
const ctaSecondary = document.getElementById('cta-secondary');

if (ctaPrimary) {
    ctaPrimary.addEventListener('click', (e) => {
        e.preventDefault();
        setActivePanel(1); // Go to first project
    });
}

if (ctaSecondary) {
    ctaSecondary.addEventListener('click', (e) => {
        e.preventDefault();
        setActivePanel(panels.length - 1); // Go to Let's Work contact panel
    });
}

// Home Button Click
if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setActivePanel(0); // Send them all back down instantly
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
    currentY = y - startY; // Negative = swipe up (next), Positive = swipe down (prev)
    const currentPanel = panels[activeIndex];

    // 1. Swiping UP (Scroll Down) to go deeper to NEXT panel
    if (currentY < 0 && activeIndex < panels.length - 1) {
        const isAtBottom = currentPanel.scrollHeight - currentPanel.scrollTop <= currentPanel.clientHeight + 2;
        if (activeIndex === 0 || isAtBottom) {
            e.preventDefault(); // Stop native rubber-banding
            const progress = Math.min(Math.abs(currentY) / 300, 1);
            const nextPanel = panels[activeIndex + 1];

            if (progress < 1) {
                currentPanel.style.transition = 'none';
                if (activeIndex === 0) {
                    currentPanel.style.transform = `scale(${1 - (0.08 * progress)}) translateY(-${progress * 2}%)`;
                    currentPanel.style.filter = `brightness(${1 - (0.7 * progress)})`;
                } else {
                    currentPanel.style.transform = `translateY(-100vh) scale(${1 - (0.08 * progress)})`;
                    currentPanel.style.filter = `brightness(${1 - (0.7 * progress)})`;
                }

                nextPanel.style.transition = 'none';
                nextPanel.style.transform = `translateY(calc(100vh - ${progress * 250}px))`;
            }
        } else {
            // Let native scroll happen, reset start location so delta doesn't build up
            startY = y;
            currentY = 0;
        }
    }
    // 2. Swiping DOWN (Scroll Up) to return to PREV panel
    else if (currentY > 0 && activeIndex > 0) {
        if (currentPanel.scrollTop <= 0) {
            e.preventDefault(); // Stop pull-to-refresh / rubber-banding
            const progress = Math.min(currentY / 300, 1);
            const returnIndex = (activeIndex === panels.length - 1 && previousIndex < activeIndex - 1)
                ? previousIndex
                : activeIndex - 1;
            const prevPanel = panels[returnIndex];

            if (progress < 1) {
                prevPanel.style.transition = 'none';
                if (returnIndex === 0) {
                    prevPanel.style.transform = `scale(${0.92 + (0.08 * progress)}) translateY(-${2 - (2 * progress)}%)`;
                    prevPanel.style.filter = `brightness(${0.3 + (0.7 * progress)})`;
                } else {
                    prevPanel.style.transform = `translateY(-100vh) scale(${0.92 + (0.08 * progress)})`;
                    prevPanel.style.filter = `brightness(${0.3 + (0.7 * progress)})`;
                }

                currentPanel.style.transition = 'none';
                currentPanel.style.transform = `translateY(calc(-100vh + ${progress * 150}px))`;
            }
        } else {
            startY = y;
            currentY = 0;
        }
    }
};

const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    if (Math.abs(currentY) > DRAG_THRESHOLD) {
        isTransitioning = false;
        if (currentY < 0 && activeIndex < panels.length - 1) {
            setActivePanel(activeIndex + 1);
        } else if (currentY > 0 && activeIndex > 0) {
            const returnIndex = (activeIndex === panels.length - 1 && previousIndex < activeIndex - 1)
                ? previousIndex
                : activeIndex - 1;
            setActivePanel(returnIndex);
        }
    } else if (currentY !== 0) {
        // Revert swipe snap back
        isTransitioning = false;
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

    if (isDragging || isTransitioning) {
        if (isTransitioning) e.preventDefault(); // Prevents native scrolling while animating between panels
        return;
    }

    // 1. SCROLL DOWN (Go deeper to next layer panel)
    if (e.deltaY > 0 && activeIndex < panels.length - 1) {
        const isAtBottom = currentPanel.scrollHeight - currentPanel.scrollTop <= currentPanel.clientHeight + 2;

        if (activeIndex === 0 || isAtBottom) {
            e.preventDefault();
            scrollIntent += Math.abs(e.deltaY);

            const progress = Math.min(scrollIntent / 300, 1);
            const nextPanel = panels[activeIndex + 1];

            if (progress < 1) {
                currentPanel.style.transition = 'none';
                if (activeIndex === 0) {
                    currentPanel.style.transform = `scale(${1 - (0.08 * progress)}) translateY(-${progress * 2}%)`;
                    currentPanel.style.filter = `brightness(${1 - (0.7 * progress)})`;
                } else {
                    currentPanel.style.transform = `translateY(-100vh) scale(${1 - (0.08 * progress)})`;
                    currentPanel.style.filter = `brightness(${1 - (0.7 * progress)})`;
                }

                nextPanel.style.transition = 'none';
                nextPanel.style.transform = `translateY(calc(100vh - ${progress * 250}px))`;
            }

            if (scrollIntent > 300) {
                setActivePanel(activeIndex + 1);
            }
        }
    }
    // 2. SCROLL UP (Return above)
    else if (e.deltaY < 0 && activeIndex > 0) {
        if (currentPanel.scrollTop <= 0) {
            e.preventDefault();
            scrollIntent += Math.abs(e.deltaY);

            const progress = Math.min(scrollIntent / 300, 1);

            const returnIndex = (activeIndex === panels.length - 1 && previousIndex < activeIndex - 1)
                ? previousIndex
                : activeIndex - 1;

            const prevPanel = panels[returnIndex];

            if (progress < 1) {
                prevPanel.style.transition = 'none';
                if (returnIndex === 0) {
                    prevPanel.style.transform = `scale(${0.92 + (0.08 * progress)}) translateY(-${2 - (2 * progress)}%)`;
                    prevPanel.style.filter = `brightness(${0.3 + (0.7 * progress)})`;
                } else {
                    prevPanel.style.transform = `translateY(-100vh) scale(${0.92 + (0.08 * progress)})`;
                    prevPanel.style.filter = `brightness(${0.3 + (0.7 * progress)})`;
                }

                currentPanel.style.transition = 'none';
                currentPanel.style.transform = `translateY(calc(-100vh + ${progress * 150}px))`;
            }

            if (scrollIntent > 300) {
                setActivePanel(returnIndex);
            }
        }
    } else {
        scrollIntent = 0;
    }

    // Snap Back mechanism: if the user partially scrolls and stops, snap the panel back natively
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
        if (scrollIntent > 0 && !isTransitioning) {
            scrollIntent = 0;
            isTransitioning = false;
            setActivePanel(activeIndex); // Forces a snap back to perfect resting states
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

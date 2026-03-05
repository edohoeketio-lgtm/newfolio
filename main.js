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

if (toggle) {
    toggle.addEventListener('click', () => {
        video.muted = !video.muted;
        iconMuted.style.display = video.muted ? 'block' : 'none';
        iconUnmuted.style.display = video.muted ? 'none' : 'block';
    });
}

// ── 3D Parallax Tilt on Text ────────────────────
const content = document.getElementById('content');
const headline = document.getElementById('headline');
const subhead = document.getElementById('subhead');

const MAX_ROTATION = 8;

if (content) {
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
}

// ── View Toggle & CTA Initialization ──
const homeBtn = document.getElementById('home-btn');
const ctaPrimary = document.getElementById('cta-primary');

// Dynamic Iframe Loading Strategy
// ── Iframe Lazy Loader (Intersection Observer) ──
const projectIframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const iframe = entry.target;
            if (!iframe.src) {
                iframe.src = iframe.getAttribute('data-src');
            }
        }
    });
}, { threshold: 0.1, rootMargin: '200px' });

document.querySelectorAll('.project-iframe').forEach(iframe => {
    projectIframeObserver.observe(iframe);
});

// CTA & Navigation Listeners
if (ctaPrimary) {
    ctaPrimary.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('stream-section').scrollIntoView({ behavior: 'smooth' });
    });
}

const streamReadMoreBtn = document.getElementById('stream-read-more');
const streamDescExtended = document.getElementById('stream-desc-extended');

if (streamReadMoreBtn && streamDescExtended) {
    streamReadMoreBtn.addEventListener('click', () => {
        const isExpanded = streamDescExtended.classList.contains('expanded');
        if (isExpanded) {
            streamDescExtended.classList.remove('expanded');
            streamReadMoreBtn.textContent = 'Read More +';
        } else {
            streamDescExtended.classList.add('expanded');
            streamReadMoreBtn.textContent = 'Read Less -';
        }
    });
}

const ctaSecondary = document.getElementById('cta-secondary');
if (ctaSecondary) {
    ctaSecondary.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' });
    });
}

if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Conversational Form Logic (Warm Mode) ───────
const madlibsForm = document.getElementById('madlibs-form');
const toast = document.getElementById('toast');
const submitBtn = document.getElementById('submit-btn');

if (madlibsForm) {
    const inputs = madlibsForm.querySelectorAll('input');
    const sensor = document.createElement('span');
    sensor.className = 'input-resize-sensor';
    document.body.appendChild(sensor);

    const resizeInput = (input) => {
        sensor.style.fontFamily = window.getComputedStyle(input).fontFamily;
        sensor.style.fontSize = window.getComputedStyle(input).fontSize;
        sensor.textContent = input.value || input.placeholder;
        const newWidth = Math.max(sensor.clientWidth + 10, input.placeholder.length * 12);
        input.style.width = `${newWidth}px`;
    };

    inputs.forEach(input => {
        resizeInput(input);
        input.addEventListener('input', () => resizeInput(input));
    });

    madlibsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btnIcon = submitBtn.querySelector('.btn-icon');
        const originalSVG = btnIcon.innerHTML;

        btnIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
        btnIcon.classList.add('spinning');
        submitBtn.style.pointerEvents = 'none';
        submitBtn.style.opacity = '0.7';

        const formData = new FormData(madlibsForm);
        fetch("https://formsubmit.co/ajax/edohoeketio@gmail.com", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                toast.textContent = "Message sent successfully.";
                toast.classList.add('show');
                madlibsForm.reset();
                inputs.forEach(input => resizeInput(input));
                btnIcon.innerHTML = originalSVG;
                btnIcon.classList.remove('spinning');
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.opacity = '1';
                setTimeout(() => toast.classList.remove('show'), 3000);
            })
            .catch(error => {
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
                    toast.style.background = "";
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

// ── Theme Management ───────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function applyTheme(mode) {
    if (mode === 'brutalist') {
        body.classList.add('theme-brutalist');
        document.documentElement.style.backgroundColor = '#e5e5e5';
    } else {
        body.classList.remove('theme-brutalist');
        document.documentElement.style.backgroundColor = '#000';
        // Refresh iframes to ensure load
        document.querySelectorAll('.project-iframe').forEach(iframe => {
            if (iframe.src) iframe.src = iframe.src;
        });
    }
    localStorage.setItem('portfolio-theme', mode);
}

// Initial Load
const savedTheme = localStorage.getItem('portfolio-theme') || 'brutalist';
applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isBrutalist = body.classList.contains('theme-brutalist');
        applyTheme(isBrutalist ? 'warm' : 'brutalist');
    });
}

// ── Brutalist Mode: Anchored Preview ───────────
const hoverPreview = document.getElementById('hover-preview');
const brutalistItems = document.querySelectorAll('.brutalist-item');

brutalistItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        if (!body.classList.contains('theme-brutalist')) return;
        const previewImg = item.getAttribute('data-preview');
        if (previewImg) {
            item.appendChild(hoverPreview);
            hoverPreview.innerHTML = `<img src="${previewImg}" alt="Preview">`;
            hoverPreview.style.left = '105%';
            hoverPreview.style.top = '-20px';
            hoverPreview.classList.add('active');
        }
    });

    item.addEventListener('mouseleave', () => {
        hoverPreview.classList.remove('active');
    });
});

// ── Intersection Observer for Reveals ──────────
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length > 0) {
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
}

// ── Chat Contact Interface ────────────────────────
const chatModal = document.getElementById('chat-modal');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatClose = document.getElementById('chat-close');
const contactBtn = document.getElementById('brutalist-contact-btn');

if (chatModal) {
    const chatSteps = [
        { question: "hey! 👋 what's your name?", field: 'name', placeholder: 'Your name...' },
        { question: null, field: null },
        { question: "nice — what are you looking to build?", field: 'project_details', placeholder: 'A killer web app...' },
        { question: "last thing — drop your email so I can get back to you", field: 'email', placeholder: 'you@email.com' },
    ];

    let chatStep = 0;
    const chatData = {};

    function scrollChat() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addUserBubble(text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble user';
        bubble.innerHTML = `${text}<span class="blue-checks">✓✓</span>`;
        chatMessages.appendChild(bubble);
        scrollChat();
        setTimeout(() => {
            const checks = bubble.querySelector('.blue-checks');
            if (checks) checks.classList.add('seen');
        }, 800);
    }

    function typeMessage(text) {
        return new Promise(resolve => {
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble maurice typing-cursor';
            bubble.textContent = '';
            chatMessages.appendChild(bubble);
            scrollChat();

            let i = 0;
            const speed = 30 + Math.random() * 20;
            const interval = setInterval(() => {
                bubble.textContent += text[i];
                i++;
                scrollChat();
                if (i >= text.length) {
                    clearInterval(interval);
                    bubble.classList.remove('typing-cursor');
                    resolve();
                }
            }, speed);
        });
    }

    function disableInput() {
        if (chatInput) chatInput.disabled = true;
        if (chatSend) chatSend.disabled = true;
    }

    function enableInput(placeholder) {
        if (chatInput) {
            chatInput.disabled = false;
            chatInput.placeholder = placeholder || 'Type here...';
            chatInput.value = '';
            chatInput.focus();
        }
        if (chatSend) chatSend.disabled = false;
    }

    async function startChat() {
        chatStep = 0;
        chatMessages.innerHTML = '';
        Object.keys(chatData).forEach(k => delete chatData[k]);
        disableInput();
        await typeMessage(chatSteps[0].question);
        enableInput(chatSteps[0].placeholder);
    }

    async function handleSend() {
        const value = chatInput.value.trim();
        if (!value) return;

        disableInput();
        addUserBubble(value);

        if (chatStep === 0) {
            chatData.name = value;
            chatSteps[1].question = `nice to meet you, ${value}! who are you with? (company or just yourself)`;
            chatSteps[1].field = 'company';
            chatStep = 1;
            await new Promise(r => setTimeout(r, 600));
            await typeMessage(chatSteps[1].question);
            enableInput('Company name...');
        } else if (chatStep === 1) {
            chatData.company = value;
            chatStep = 2;
            await new Promise(r => setTimeout(r, 600));
            await typeMessage(chatSteps[2].question);
            enableInput(chatSteps[2].placeholder);
        } else if (chatStep === 2) {
            chatData.project_details = value;
            chatStep = 3;
            await new Promise(r => setTimeout(r, 600));
            await typeMessage(chatSteps[3].question);
            enableInput(chatSteps[3].placeholder);
        } else if (chatStep === 3) {
            chatData.email = value;
            chatStep = 4;
            const formData = new FormData();
            formData.append('name', chatData.name);
            formData.append('company', chatData.company);
            formData.append('project_details', chatData.project_details);
            formData.append('email', chatData.email);
            fetch("https://formsubmit.co/ajax/edohoeketio@gmail.com", {
                method: "POST",
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).catch(() => { });

            await new Promise(r => setTimeout(r, 800));
            await typeMessage("perfect — I've got everything I need 🤝");
            await new Promise(r => setTimeout(r, 400));
            await typeMessage("i'll get back to you within 24 hours. talk soon!");
            chatInput.placeholder = 'Sent ✓';
        }
    }

    if (contactBtn) contactBtn.addEventListener('click', () => { chatModal.classList.add('open'); startChat(); });
    if (chatClose) chatClose.addEventListener('click', () => { chatModal.classList.remove('open'); });
    if (chatModal) chatModal.addEventListener('click', (e) => { if (e.target === chatModal) chatModal.classList.remove('open'); });
    if (chatSend) chatSend.addEventListener('click', handleSend);
    if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });
}

// ── Music Pill Rotation ──
const songs = [
    { title: "Sing about me, im dying of thirst", artist: "Kendrick Lamar", art: "/kendrick.png" },
    { title: "Poor thang.", artist: "J. Cole", art: "/jcole.png" },
    { title: "lost souls", artist: "Baby Keem", art: "/babykeem.jpg" }
];

let currentSongIndex = 0;
const musicArt = document.getElementById('music-art');
const musicTitle = document.getElementById('music-title');
const musicArtist = document.getElementById('music-artist');
const musicPill = document.querySelector('.music-pill');

function rotateSong() {
    if (!musicPill || !musicArt || !musicTitle || !musicArtist) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    const song = songs[currentSongIndex];
    musicPill.style.opacity = '0';
    musicPill.style.transform = 'translateY(5px)';
    setTimeout(() => {
        musicArt.src = song.art;
        musicTitle.textContent = song.title;
        musicArtist.textContent = song.artist;
        musicPill.style.opacity = '1';
        musicPill.style.transform = 'translateY(0)';
    }, 400);
}

if (musicPill) setInterval(rotateSong, 45000);

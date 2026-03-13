export function initChat(analytics) {
    const chatModal = document.getElementById('chat-modal');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatClose = document.getElementById('chat-close');
    const contactBtn = document.getElementById('brutalist-contact-btn');

    if (!chatModal || !contactBtn) return;

    const chatSteps = [
        { question: "hey! 👋 what's your name?", field: 'name', placeholder: 'Your name...' },
        { question: null, field: null },
        { question: "nice — what are you looking to build?", field: 'project_details', placeholder: 'A killer web app...' },
        { question: "last thing — drop your email so I can get back to you", field: 'email', placeholder: 'you@email.com' },
    ];

    let chatStep = 0;
    const chatData = {};
    let isSubmitting = false;

    function scrollChat() {
        if(chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addUserBubble(text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble user';
        bubble.innerHTML = `${text}<span class="blue-checks" aria-hidden="true">✓✓</span>`;
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
            // Important for a11y: make sure screen readers don't read every letter typing out
            bubble.setAttribute('aria-live', 'polite');
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
        isSubmitting = false;
        disableInput();
        await typeMessage(chatSteps[0].question);
        enableInput(chatSteps[0].placeholder);
    }

    async function handleSend() {
        if (isSubmitting) return; // Prevent double submit
        const value = chatInput?.value?.trim();
        if (!value) return;

        isSubmitting = true;
        disableInput();
        addUserBubble(value);

        try {
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
                
                try {
                    const response = await fetch("https://formsubmit.co/ajax/edohoeketio@gmail.com", {
                        method: "POST",
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });
                    
                    if (analytics) {
                        analytics.track('Submitted Contact Form', { 
                            company: chatData.company, 
                            project_details_length: chatData.project_details.length 
                        });
                    }

                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    
                    await new Promise(r => setTimeout(r, 800));
                    await typeMessage("perfect — I've got everything I need 🤝");
                    await new Promise(r => setTimeout(r, 400));
                    await typeMessage("i'll get back to you within 24 hours. talk soon!");
                    if(chatInput) chatInput.placeholder = 'Sent ✓';
                } catch (error) {
                    if (analytics) {
                        analytics.track('Contact Form Error', { error: error.message });
                    }
                    console.error("Form submission failed:", error);
                    await new Promise(r => setTimeout(r, 800));
                    await typeMessage("ah, something went wrong on my end. 😔");
                    await new Promise(r => setTimeout(r, 400));
                    await typeMessage("could you email me directly instead? edohoeketio@gmail.com");
                    if(chatInput) chatInput.placeholder = 'Error ✕';
                }
            }
        } finally {
            if (chatStep < 4 && chatStep !== 0) { // Keep disabled if finished or reset
                isSubmitting = false;
            }
        }
    }

    contactBtn.addEventListener('click', () => { 
        if (analytics) analytics.track('Opened Contact Chat');
        chatModal.classList.add('open'); 
        startChat(); 
    });
    
    if (chatClose) {
        chatClose.addEventListener('click', () => { 
            chatModal.classList.remove('open'); 
            isSubmitting = false;
        });
    }
    
    chatModal.addEventListener('click', (e) => { 
        if (e.target === chatModal) {
            chatModal.classList.remove('open'); 
            isSubmitting = false;
        }
    });

    if (chatSend) chatSend.addEventListener('click', handleSend);
    if (chatInput) chatInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') handleSend(); 
    });

    // Focus Trapping for accessibility
    chatModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            chatModal.classList.remove('open');
            isSubmitting = false;
        }
    });
}

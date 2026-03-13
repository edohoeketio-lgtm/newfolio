export function initUI(analytics) {
    // ── View Toggle & CTA Initialization ──
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (analytics) analytics.track('Clicked Home Top Nav');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── Brutalist Mode: Anchored Preview ───────────
    const hoverPreview = document.getElementById('hover-preview');
    const brutalistItems = document.querySelectorAll('.brutalist-item');

    brutalistItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const previewImg = item.getAttribute('data-preview');
            if (previewImg && hoverPreview) {
                item.appendChild(hoverPreview);
                hoverPreview.innerHTML = `<img src="${previewImg}" alt="Preview">`;
                hoverPreview.style.left = '105%';
                hoverPreview.style.top = '-20px';
                hoverPreview.classList.add('active');
            }
        });

        item.addEventListener('mouseleave', () => {
            if (hoverPreview) hoverPreview.classList.remove('active');
        });
    });

    // ── Global Link Tracking ───────────
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', () => {
            if (analytics) {
                analytics.track('Clicked External Link', { 
                    href: link.href, 
                    text: link.textContent.trim() || link.getAttribute('aria-label') || 'Icon'
                });
            }
        });
    });
}

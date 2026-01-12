// Site base URL for wsrv.nl image proxy
const SITE_BASE_URL = 'https://firekki.github.io/osmotakut';

// Simple markdown to HTML converter
function parseMarkdown(md, mapId) {
    // First, handle special blocks before escaping HTML
    let html = md
        // YouTube embeds: @[youtube](VIDEO_ID)
        .replace(/@\[youtube\]\(([^)]+)\)/g,
            '<div class="video-container"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>')
        // Local videos: @[video](path/to/video.mp4)
        .replace(/@\[video\]\(([^)]+)\)/g, (match, src) => {
            const fullPath = src.startsWith('http') ? src : `tactics/${mapId}/${src}`;
            return `<div class="video-container"><video controls><source src="${fullPath}" type="video/mp4">Video not supported</video></div>`;
        })
        // Images: ![alt text](path/to/image.jpg) - uses wsrv.nl for thumbnails
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
            const relativePath = src.startsWith('http') ? src : `tactics/${mapId}/${src}`;
            const fullImageUrl = src.startsWith('http') ? src : `${SITE_BASE_URL}/${relativePath}`;
            const thumbnailUrl = `https://wsrv.nl/?url=${encodeURIComponent(fullImageUrl)}&w=400&q=70`;
            return `<figure class="tactic-image"><img src="${thumbnailUrl}" data-full-src="${fullImageUrl}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`;
        });

    // Now continue with regular markdown parsing
    html = html
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Unordered lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Paragraphs (lines that aren't already wrapped)
        .replace(/^(?!<[hulo]|<b|<hr|<fig|<div)(.+)$/gm, '<p>$1</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        // Fix nested blockquotes
        .replace(/<\/blockquote>\n<blockquote>/g, '<br>');

    return html;
}

// Load markdown content for a map
async function loadTactics(mapId) {
    const tacticsDiv = document.querySelector(`#${mapId} .tactics`);
    if (!tacticsDiv) return;

    try {
        const response = await fetch(`tactics/${mapId}/tactics.md`);
        if (response.ok) {
            const markdown = await response.text();
            tacticsDiv.innerHTML = parseMarkdown(markdown, mapId);
        } else {
            tacticsDiv.innerHTML = '<p class="empty">Ei vielä taktiikoita tälle kartalle.</p>';
        }
    } catch (e) {
        tacticsDiv.innerHTML = '<p class="empty">Ei vielä taktiikoita tälle kartalle.</p>';
    }
}

// Handle map switching based on URL hash
function showMap(mapId) {
    // Hide all map content sections
    document.querySelectorAll('.map-content').forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected map (or home if no map selected)
    const target = document.getElementById(mapId) || document.getElementById('home');
    if (target) {
        target.classList.add('active');

        // Load tactics if it's a map page
        if (mapId && mapId !== 'home') {
            loadTactics(mapId);
        }
    }

    // Update active state on nav links
    document.querySelectorAll('.map-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.map === mapId) {
            link.classList.add('active');
        }
    });
}

// Listen for hash changes
window.addEventListener('hashchange', () => {
    const mapId = window.location.hash.slice(1);
    showMap(mapId);
});

// Handle initial page load
document.addEventListener('DOMContentLoaded', () => {
    const mapId = window.location.hash.slice(1);
    showMap(mapId || 'home');

    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <img src="" alt="">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    // Open lightbox on image click
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.tactic-image img');
        if (img && img.dataset.fullSrc) {
            lightboxImg.src = img.dataset.fullSrc;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    // Close lightbox functions
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImg.src = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});

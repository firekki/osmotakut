// Simple markdown to HTML converter
function parseMarkdown(md) {
    let html = md
        // Escape HTML
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
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
        .replace(/^(?!<[hulo]|<b|<hr)(.+)$/gm, '<p>$1</p>')
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
            tacticsDiv.innerHTML = parseMarkdown(markdown);
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
});

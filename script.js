const tournamentGrid = document.getElementById('tournament-grid');
const searchInput = document.getElementById('search');

async function loadTournaments() {
    try {
        tournamentGrid.innerHTML = '<div class="loading">Loading tournaments...</div>';
        
        // Сначала проверим что возвращает сервер
        const response = await fetch('tournaments/index.json?' + Date.now());
        const text = await response.text(); // Получаем как текст, чтобы увидеть что реально приходит
        
        console.log('Raw response:', text);
        
        let data;
        try {
            data = JSON.parse(text);
            console.log('Parsed data:', data);
        } catch (e) {
            console.error('JSON parse error:', e);
            tournamentGrid.innerHTML = `<div class="loading">Error: Invalid JSON - ${text.substring(0, 100)}</div>`;
            return;
        }
        
        // Преобразуем в массив
        let tournaments = [];
        
        if (Array.isArray(data)) {
            // Если это массив
            tournaments = data.map(item => ({
                folder: item.folder || 'unknown',
                name: item.name || 'Unknown',
                date: item.date || 'TBA',
                location: item.location || 'TBA'
            }));
        } else if (typeof data === 'object' && data !== null) {
            // Если это объект
            tournaments = Object.entries(data).map(([folder, info]) => ({
                folder: folder,
                name: info.name || folder,
                date: info.date || 'TBA',
                location: info.location || 'TBA'
            }));
        } else {
            tournamentGrid.innerHTML = `<div class="loading">Error: Unexpected data format - ${typeof data}</div>`;
            return;
        }
        
        if (tournaments.length === 0) {
            tournamentGrid.innerHTML = '<div class="loading">No tournaments found in index.json</div>';
            return;
        }
        
        displayTournaments(tournaments);
        
    } catch (error) {
        console.error('Error:', error);
        tournamentGrid.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    }
}

function displayTournaments(tournaments) {
    tournamentGrid.innerHTML = '';
    
    tournaments.forEach(t => {
        const card = document.createElement('div');
        card.className = 'tournament-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${t.name}</h3>
            </div>
            <div class="card-info">
                <p><i>📅</i> ${t.date}</p>
                <p><i>📍</i> ${t.location}</p>
            </div>
            <div class="card-actions">
                <a href="tournaments/${t.folder}/register.html">Register</a>
                <a href="tournaments/${t.folder}/results.html">Results</a>
                <a href="tournaments/${t.folder}/participants.html">Participants</a>
            </div>
        `;
        tournamentGrid.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.tournament-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? 'flex' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', loadTournaments);

const tournamentGrid = document.getElementById('tournament-grid');
const searchInput = document.getElementById('search');

// Функция для декодирования строк с %20
function decodeString(str) {
    if (!str) return '';
    try {
        // Декодируем URL-кодировку (%20 в пробелы и т.д.)
        str = decodeURIComponent(str);
        // Заменяем плюсы на пробелы (на всякий случай)
        str = str.replace(/\+/g, ' ');
        return str.trim();
    } catch (e) {
        console.warn('Decode error:', e);
        return str;
    }
}

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
                name: decodeString(item.name) || 'Unknown',  // Декодируем
                date: decodeString(item.date) || 'TBA',       // Декодируем
                location: decodeString(item.location) || 'TBA' // Декодируем
            }));
        } else if (typeof data === 'object' && data !== null) {
            // Если это объект
            tournaments = Object.entries(data).map(([folder, info]) => ({
                folder: folder,
                name: decodeString(info.name) || folder,       // Декодируем
                date: decodeString(info.date) || 'TBA',        // Декодируем
                location: decodeString(info.location) || 'TBA'  // Декодируем
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
        card.dataset.name = t.name.toLowerCase();
        card.dataset.location = t.location.toLowerCase();
        
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
    const term = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.tournament-card').forEach(card => {
        const name = card.dataset.name || '';
        const location = card.dataset.location || '';
        card.style.display = (name.includes(term) || location.includes(term)) ? 'flex' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', loadTournaments);

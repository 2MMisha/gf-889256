const tournamentGrid = document.getElementById('tournament-grid');
const searchInput = document.getElementById('search');

// Загрузка всех турниров из index.json
async function loadTournaments() {
    try {
        tournamentGrid.innerHTML = '<div class="loading">Loading tournaments...</div>';
        
        // Добавляем timestamp чтобы избежать кэширования
        const response = await fetch('tournaments/index.json?' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded tournaments:', data);
        
        // Преобразуем объект в массив
        const tournaments = Object.entries(data).map(([folder, info]) => ({
            folder: folder,
            name: info.name || folder,
            date: info.date || 'TBA',
            location: info.location || 'TBA',
            description: info.description || '',
            maxParticipants: info.maxParticipants,
            registrationDeadline: info.registrationDeadline
        }));
        
        if (tournaments.length === 0) {
            tournamentGrid.innerHTML = '<div class="loading">No tournaments found.</div>';
            return;
        }
        
        displayTournaments(tournaments);
        
    } catch (error) {
        console.error('Error loading tournaments:', error);
        tournamentGrid.innerHTML = '<div class="loading">Error loading tournaments. Please make sure index.json exists.</div>';
    }
}

// Отображение карточек турниров
function displayTournaments(tournaments) {
    tournamentGrid.innerHTML = '';
    
    tournaments.sort((a, b) => {
        if (a.date === 'TBA') return 1;
        if (b.date === 'TBA') return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    tournaments.forEach(tournament => {
        const card = document.createElement('div');
        card.className = 'tournament-card';
        card.dataset.name = tournament.name.toLowerCase();
        card.dataset.location = tournament.location.toLowerCase();
        card.dataset.folder = tournament.folder;
        
        let extraInfo = '';
        if (tournament.description) {
            extraInfo += `<p><i>ℹ️</i> ${tournament.description.substring(0, 60)}${tournament.description.length > 60 ? '...' : ''}</p>`;
        }
        if (tournament.maxParticipants) {
            extraInfo += `<p><i>👥</i> Max: ${tournament.maxParticipants} participants</p>`;
        }
        if (tournament.registrationDeadline && tournament.registrationDeadline !== 'TBA') {
            extraInfo += `<p><i>⏰</i> Deadline: ${tournament.registrationDeadline}</p>`;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${tournament.name}</h3>
            </div>
            <div class="card-info">
                <p><i>📅</i> ${tournament.date}</p>
                <p><i>📍</i> ${tournament.location}</p>
                ${extraInfo}
            </div>
            <div class="card-actions">
                <a href="tournaments/${tournament.folder}/register.html" target="_blank">Register</a>
                <a href="tournaments/${tournament.folder}/results.html" target="_blank">Results</a>
                <a href="tournaments/${tournament.folder}/participants.html" target="_blank">Participants</a>
            </div>
        `;
        
        tournamentGrid.appendChild(card);
    });
}

// Фильтрация карточек при поиске
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.tournament-card');
    
    cards.forEach(card => {
        const name = card.dataset.name || '';
        const location = card.dataset.location || '';
        
        if (name.includes(searchTerm) || location.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// Загрузка турниров при старте
document.addEventListener('DOMContentLoaded', loadTournaments);

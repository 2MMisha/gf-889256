const tournamentGrid = document.getElementById('tournament-grid');
const searchInput = document.getElementById('search');

// Укажите URL вашего Google Apps Script веб-приложения
const googleAppsScriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

// Загрузка всех турниров из автоматически сгенерированного index.json
async function loadTournaments() {
    try {
        tournamentGrid.innerHTML = '<div class="loading">Loading tournaments...</div>';
        
        // Пробуем загрузить сгенерированный index.json
        const response = await fetch('tournaments/index.json?' + new Date().getTime()); // Добавляем timestamp чтобы избежать кэша
        
        if (!response.ok) {
            throw new Error('Index file not found');
        }
        
        const data = await response.json();
        
        // Преобразуем объект в массив
        const tournaments = Object.entries(data).map(([folder, info]) => ({
            folder: folder,
            name: info.name || folder,
            date: info.date || 'TBA',
            location: info.location || 'TBA',
            description: info.description || '',
            maxParticipants: info.maxParticipants || 'Unlimited',
            registrationDeadline: info.registrationDeadline || 'TBA'
        }));
        
        if (tournaments.length === 0) {
            tournamentGrid.innerHTML = '<div class="loading">No tournaments found.</div>';
            return;
        }
        
        displayTournaments(tournaments);
        
    } catch (error) {
        console.error('Error loading tournaments:', error);
        tournamentGrid.innerHTML = '<div class="loading">Error loading tournaments. Please refresh the page.</div>';
    }
}

// Отображение карточек турниров
function displayTournaments(tournaments) {
    tournamentGrid.innerHTML = '';
    
    // Сортировка по дате (самые новые сначала)
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
        
        // Формируем описание для карточки
        let descriptionHtml = '';
        if (tournament.description) {
            descriptionHtml = `<p><i>ℹ️</i> ${tournament.description.substring(0, 60)}${tournament.description.length > 60 ? '...' : ''}</p>`;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${tournament.name}</h3>
            </div>
            <div class="card-info">
                <p><i>📅</i> ${tournament.date}</p>
                <p><i>📍</i> ${tournament.location}</p>
                ${descriptionHtml}
            </div>
            <div class="card-actions">
                <a href="tournaments/${tournament.folder}/register.html">Register</a>
                <a href="tournaments/${tournament.folder}/results.html">Results</a>
                <a href="tournaments/${tournament.folder}/participants.html">Participants</a>
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

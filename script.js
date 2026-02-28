const tournamentGrid = document.getElementById('tournament-grid');
const searchInput = document.getElementById('search');

// Укажите URL вашего Google Apps Script веб-приложения
const googleAppsScriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

// Загрузка списка турниров из папок
async function loadTournaments() {
    try {

        // Способ 2: динамическая загрузка (если у вас есть файл со списком)
         const response = await fetch('tournaments/list.json');
         const tournaments = await response.json();
         displayTournaments(tournaments);
        
    } catch (error) {
        console.error('Error loading tournaments:', error);
        tournamentGrid.innerHTML = '<div class="loading">Error loading tournaments. Please refresh the page.</div>';
    }
}

// Отображение карточек турниров
function displayTournaments(tournaments) {
    tournamentGrid.innerHTML = '';
    
    tournaments.forEach(tournament => {
        const card = document.createElement('div');
        card.className = 'tournament-card';
        card.dataset.name = tournament.name.toLowerCase();
        card.dataset.location = tournament.location.toLowerCase();
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${tournament.name}</h3>
            </div>
            <div class="card-info">
                <p><i>📅</i> ${tournament.date}</p>
                <p><i>📍</i> ${tournament.location}</p>
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
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.tournament-card');
    
    cards.forEach(card => {
        const name = card.dataset.name;
        const location = card.dataset.location;
        
        if (name.includes(searchTerm) || location.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// Загрузка турниров при старте
loadTournaments();
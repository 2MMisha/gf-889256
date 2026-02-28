const tournamentGrid = document.getElementById('tournament-grid');
const searchInput = document.getElementById('search');

// Укажите URL вашего Google Apps Script веб-приложения
const googleAppsScriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

// Функция для получения списка всех папок с турнирами
async function getTournamentFolders() {
    // ВАЖНО: GitHub Pages не может читать список папок автоматически.
    // Поэтому нам нужно либо:
    // 1. Создать файл со списком папок (рекомендуется)
    // 2. Хранить список прямо в коде (проще для начала)
    
    // Вариант 1: Чтение из конфигурационного файла (СОЗДАЙТЕ ЭТОТ ФАЙЛ)
    try {
        const response = await fetch('tournaments/folders.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.log('No folders.json found, using default list');
    }
    
    // Вариант 2: Ручной список (запасной вариант)
    return [
        'summer-cup-2024',
        'autumn-championship',
        'winter-invitational'
        // Добавляйте новые папки сюда
    ];
}

// Загрузка всех турниров
async function loadTournaments() {
    try {
        tournamentGrid.innerHTML = '<div class="loading">Loading tournaments...</div>';
        
        // Получаем список папок
        const folders = await getTournamentFolders();
        
        // Загружаем данные из каждой папки
        const tournaments = [];
        
        for (const folder of folders) {
            try {
                // Пробуем загрузить info.json из папки турнира
                const response = await fetch(`tournaments/${folder}/info.json`);
                
                if (!response.ok) {
                    console.warn(`No info.json found in ${folder}, using folder name as title`);
                    // Если info.json нет, используем название папки как имя турнира
                    tournaments.push({
                        folder: folder,
                        name: folder.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' '),
                        date: 'TBA',
                        location: 'TBA'
                    });
                    continue;
                }
                
                const info = await response.json();
                
                tournaments.push({
                    folder: folder,
                    name: info.name || folder,
                    date: info.date || 'TBA',
                    location: info.location || 'TBA',
                    description: info.description || '',
                    maxParticipants: info.maxParticipants || 'Unlimited',
                    registrationDeadline: info.registrationDeadline || 'TBA'
                });
                
            } catch (error) {
                console.warn(`Error loading ${folder}:`, error);
                // Добавляем турнир с базовой информацией
                tournaments.push({
                    folder: folder,
                    name: folder.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    date: 'TBA',
                    location: 'TBA'
                });
            }
        }
        
        if (tournaments.length === 0) {
            tournamentGrid.innerHTML = '<div class="loading">No tournaments found. Please check the tournaments folder.</div>';
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
    
    tournaments.sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортировка по дате
    
    tournaments.forEach(tournament => {
        const card = document.createElement('div');
        card.className = 'tournament-card';
        card.dataset.name = tournament.name.toLowerCase();
        card.dataset.location = tournament.location.toLowerCase();
        card.dataset.folder = tournament.folder;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${tournament.name}</h3>
            </div>
            <div class="card-info">
                <p><i>📅</i> ${tournament.date}</p>
                <p><i>📍</i> ${tournament.location}</p>
                ${tournament.description ? `<p><i>ℹ️</i> ${tournament.description.substring(0, 50)}${tournament.description.length > 50 ? '...' : ''}</p>` : ''}
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

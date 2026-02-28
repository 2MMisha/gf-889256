const tournamentGrid = document.getElementById('tournament-grid');
const searchInput = document.getElementById('search');

async function loadTournaments() {
    try {
        tournamentGrid.innerHTML = '<div class="loading">Loading tournaments...</div>';
        
        // Пробуем загрузить index.json (созданный GitHub Action)
        const response = await fetch('tournaments/index.json?' + Date.now());
        
        if (!response.ok) {
            console.log('index.json not found, checking folders.json...');
            
            // Пробуем загрузить folders.json (список папок)
            const foldersResponse = await fetch('tournaments/folders.json?' + Date.now());
            
            if (foldersResponse.ok) {
                const folders = await foldersResponse.json();
                console.log('Folders found:', folders);
                
                // Загружаем инфо из каждой папки
                const tournaments = [];
                for (const folder of folders) {
                    try {
                        const infoResponse = await fetch(`tournaments/${folder}/info.json?` + Date.now());
                        if (infoResponse.ok) {
                            const info = await infoResponse.json();
                            tournaments.push({
                                folder: folder,
                                name: info.name || folder,
                                date: info.date || 'TBA',
                                location: info.location || 'TBA'
                            });
                        } else {
                            // Если info.json нет, используем название папки
                            tournaments.push({
                                folder: folder,
                                name: folder.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                                date: 'TBA',
                                location: 'TBA'
                            });
                        }
                    } catch (e) {
                        console.warn(`Error loading ${folder}:`, e);
                    }
                }
                
                if (tournaments.length > 0) {
                    displayTournaments(tournaments);
                    return;
                }
            }
            
            // Если ничего не нашли, показываем тестовый турнир
            console.log('No tournaments found, showing test data');
            const testTournaments = [
                {
                    folder: 'test-tournament',
                    name: 'Test Tournament',
                    date: 'July 2024',
                    location: 'Test Location'
                }
            ];
            displayTournaments(testTournaments);
            return;
        }
        
        // Если index.json существует
        const data = await response.json();
        console.log('Index.json loaded:', data);
        
        const tournaments = Object.entries(data).map(([folder, info]) => ({
            folder: folder,
            name: info.name || folder,
            date: info.date || 'TBA',
            location: info.location || 'TBA'
        }));
        
        displayTournaments(tournaments);
        
    } catch (error) {
        console.error('Error:', error);
        tournamentGrid.innerHTML = '<div class="loading">Error loading tournaments. Check console.</div>';
    }
}

function displayTournaments(tournaments) {
    tournamentGrid.innerHTML = '';
    
    if (tournaments.length === 0) {
        tournamentGrid.innerHTML = '<div class="loading">No tournaments found</div>';
        return;
    }
    
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

document.addEventListener('DOMContentLoaded', () => {
    const difficultySettings = {
        easy: { rows: 8, cols: 8, bombs: 10 },
        medium: { rows: 12, cols: 12, bombs: 30 },
        hard: { rows: 16, cols: 16, bombs: 60 }
    };

    let settings;
    let grid;
    let gameInProgress;
    let firstClick;
    let timerInterval;
    let time;
    let bombsLeft;

    // UI Elements
    const wrapper = document.getElementById('wrapper');
    const timerEl = document.getElementById('timer');
    const bombsLeftEl = document.getElementById('bombs-left');
    const difficultySelect = document.getElementById('difficulty');
    const resetBtn = document.getElementById('reset-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const gameModal = new bootstrap.Modal(document.getElementById('gameModal'));
    const howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalNewGameBtn = document.getElementById('modal-new-game-btn');

    function init() {
        const difficulty = difficultySelect.value;
        settings = difficultySettings[difficulty];
        
        gameInProgress = true;
        firstClick = true;
        time = 0;
        bombsLeft = settings.bombs;
        
        clearInterval(timerInterval);
        timerEl.textContent = 0;

        // Create grid data
        grid = Array(settings.rows).fill(null).map(() => Array(settings.cols).fill(null).map(() => ({
            isBomb: false,
            isRevealed: false,
            isFlagged: false,
            adjacentBombs: 0
        })));

        // Create grid UI
        wrapper.innerHTML = '';
        wrapper.style.setProperty('--grid-rows', settings.rows);
        wrapper.style.setProperty('--grid-cols', settings.cols);

        for (let r = 0; r < settings.rows; r++) {
            for (let c = 0; c < settings.cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', () => handleLeftClick(r, c));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(r, c);
                });
                wrapper.appendChild(cell);
            }
        }
        updateUI();
    }
    
    function placeBombs(firstR, firstC) {
        let bombsPlaced = 0;
        while (bombsPlaced < settings.bombs) {
            const r = Math.floor(Math.random() * settings.rows);
            const c = Math.floor(Math.random() * settings.cols);

            // Avoid placing bomb on first click and its neighbors
            const isNearFirstClick = Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1;

            if (!grid[r][c].isBomb && !isNearFirstClick) {
                grid[r][c].isBomb = true;
                bombsPlaced++;
            }
        }

        // Calculate adjacent bombs
        for (let r = 0; r < settings.rows; r++) {
            for (let c = 0; c < settings.cols; c++) {
                if (!grid[r][c].isBomb) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < settings.rows && nc >= 0 && nc < settings.cols && grid[nr][nc].isBomb) {
                                count++;
                            }
                        }
                    }
                    grid[r][c].adjacentBombs = count;
                }
            }
        }
    }

    function handleLeftClick(r, c) {
        if (!gameInProgress || grid[r][c].isRevealed || grid[r][c].isFlagged) {
            return;
        }

        if (firstClick) {
            placeBombs(r, c);
            firstClick = false;
            timerInterval = setInterval(() => {
                time++;
                timerEl.textContent = time;
            }, 1000);
        }
        
        if (grid[r][c].isBomb) {
            endGame(false);
            return;
        }

        revealCell(r, c);
        checkWin();
    }

    function handleRightClick(r, c) {
        if (!gameInProgress || grid[r][c].isRevealed) {
            return;
        }
        grid[r][c].isFlagged = !grid[r][c].isFlagged;
        bombsLeft += grid[r][c].isFlagged ? -1 : 1;
        updateUI();
    }

    function revealCell(r, c) {
        const queue = [{r, c}];
        const visited = new Set([`${r},${c}`]);

        while(queue.length > 0){
            const {r: row, c: col} = queue.shift();
            const cell = grid[row][col];
            
            if(cell.isRevealed || cell.isFlagged) continue;
            
            cell.isRevealed = true;

            if (cell.adjacentBombs === 0) {
                 for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = row + dr;
                        const nc = col + dc;
                        const key = `${nr},${nc}`;
                        if (nr >= 0 && nr < settings.rows && nc >= 0 && nc < settings.cols && !visited.has(key)) {
                            queue.push({r: nr, c: nc});
                            visited.add(key);
                        }
                    }
                }
            }
        }
        updateUI();
    }
    
    function checkWin(){
        let revealedCount = 0;
        for (let r = 0; r < settings.rows; r++) {
            for (let c = 0; c < settings.cols; c++) {
                if(grid[r][c].isRevealed) revealedCount++;
            }
        }
        if(revealedCount === settings.rows * settings.cols - settings.bombs){
            endGame(true);
        }
    }

    function updateUI() {
        for (let r = 0; r < settings.rows; r++) {
            for (let c = 0; c < settings.cols; c++) {
                const cell = grid[r][c];
                const cellEl = wrapper.children[r * settings.cols + c];
                
                cellEl.className = 'cell'; // Reset classes
                cellEl.textContent = '';
                cellEl.removeAttribute('data-count');
                
                if(cell.isFlagged){
                    cellEl.classList.add('flagged');
                }
                
                if (cell.isRevealed) {
                    cellEl.classList.add('revealed');
                    if (cell.isBomb) {
                        cellEl.classList.add('bomb');
                    } else if (cell.adjacentBombs > 0) {
                        cellEl.textContent = cell.adjacentBombs;
                        cellEl.dataset.count = cell.adjacentBombs;
                    }
                }
            }
        }
        bombsLeftEl.textContent = bombsLeft;
    }
    
    function revealAllBombs() {
        for (let r = 0; r < settings.rows; r++) {
            for (let c = 0; c < settings.cols; c++) {
                if(grid[r][c].isBomb){
                    grid[r][c].isRevealed = true;
                }
            }
        }
        updateUI();
    }

    function endGame(isWin) {
        gameInProgress = false;
        clearInterval(timerInterval);

        if (isWin) {
            modalTitle.textContent = '🎉 Hai Vinto!';
            modalBody.textContent = `Complimenti! Hai trovato tutte le bombe in ${time} secondi.`;
        } else {
            revealAllBombs();
            modalTitle.textContent = '💣 Hai Perso!';
            modalBody.textContent = 'Hai cliccato su una bomba! Riprova.';
        }
        gameModal.show();
    }

    difficultySelect.addEventListener('change', init);
    resetBtn.addEventListener('click', init);
    howToPlayBtn.addEventListener('click', () => howToPlayModal.show());
    modalNewGameBtn.addEventListener('click', () => {
        gameModal.hide();
        init();
    });

    init();
});

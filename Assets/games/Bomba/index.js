document.addEventListener('DOMContentLoaded', () => {
    const GRID_SIZE = 10;
    const INITIAL_BLOCKS = 15;

    let grid = [];
    let bomb = { r: 0, c: 0 };
    let blocksLeft = INITIAL_BLOCKS;
    let wins = 0;
    let gameInProgress = true;

    // UI Elements
    const wrapper = document.getElementById('wrapper');
    const blocksLeftEl = document.getElementById('blocks-left');
    const winsEl = document.getElementById('wins');
    const resetBtn = document.getElementById('reset-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const gameModal = new bootstrap.Modal(document.getElementById('gameModal'));
    const howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalNewGameBtn = document.getElementById('modal-new-game-btn');

    function init() {
        gameInProgress = true;
        blocksLeft = INITIAL_BLOCKS;
        
        // Create grid data
        grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)); // 0: empty, 1: blocked
        
        // Create grid UI
        wrapper.innerHTML = '';
        wrapper.style.setProperty('--grid-size', GRID_SIZE);
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', () => placeBlock(r, c));
                wrapper.appendChild(cell);
            }
        }
        
        // Place initial random blocks
        for (let i = 0; i < 5; i++) {
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            if (grid[r][c] === 0) {
                grid[r][c] = 1;
            } else {
                i--; // Try again
            }
        }
        
        // Place bomb
        bomb.r = Math.floor(GRID_SIZE / 2);
        bomb.c = Math.floor(GRID_SIZE / 2);
        grid[bomb.r][bomb.c] = 0; // Ensure bomb position is not blocked

        updateUI();
    }

    function placeBlock(r, c) {
        if (!gameInProgress || grid[r][c] !== 0 || (r === bomb.r && c === bomb.c) || blocksLeft <= 0) {
            return;
        }

        grid[r][c] = 1;
        blocksLeft--;
        updateUI();
        
        moveBomb();
    }
    
    function moveBomb() {
        const path = findShortestPath(bomb, grid);

        if (path && path.length > 1) {
            // Move bomb along the path
            const nextMove = path[1];
            bomb.r = nextMove.r;
            bomb.c = nextMove.c;
            updateUI();

            // Check if bomb reached the edge
            if (bomb.r === 0 || bomb.r === GRID_SIZE - 1 || bomb.c === 0 || bomb.c === GRID_SIZE - 1) {
                endGame(false); // Player loses
            }
        } else {
            // Bomb is trapped
            endGame(true); // Player wins
        }
    }

    function findShortestPath(start, gridState) {
        const queue = [{ ...start, path: [start] }];
        const visited = new Set([`${start.r},${start.c}`]);
        const directions = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];

        while (queue.length > 0) {
            const current = queue.shift();

            // If at edge, path is found
            if (current.r === 0 || current.r === GRID_SIZE - 1 || current.c === 0 || current.c === GRID_SIZE - 1) {
                return current.path;
            }

            for (const dir of directions) {
                const nextR = current.r + dir.r;
                const nextC = current.c + dir.c;
                const key = `${nextR},${nextC}`;

                if (nextR >= 0 && nextR < GRID_SIZE && nextC >= 0 && nextC < GRID_SIZE &&
                    !visited.has(key) && gridState[nextR][nextC] === 0) {
                    
                    visited.add(key);
                    const newPath = [...current.path, { r: nextR, c: nextC }];
                    queue.push({ r: nextR, c: nextC, path: newPath });
                }
            }
        }
        return null; // No path to edge
    }

    function updateUI() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = wrapper.children[r * GRID_SIZE + c];
                cell.classList.remove('bomb', 'blocked');
                if (r === bomb.r && c === bomb.c) {
                    cell.classList.add('bomb');
                } else if (grid[r][c] === 1) {
                    cell.classList.add('blocked');
                }
            }
        }
        blocksLeftEl.textContent = blocksLeft;
        winsEl.textContent = wins;
    }

    function endGame(isWin) {
        gameInProgress = false;
        if (isWin) {
            wins++;
            modalTitle.textContent = '🎉 Hai Vinto!';
            modalBody.textContent = 'Hai intrappolato la bomba! Complimenti!';
        } else {
            modalTitle.textContent = '💣 Hai Perso!';
            modalBody.textContent = 'La bomba è scappata! Riprova.';
        }
        gameModal.show();
        updateUI();
    }

    resetBtn.addEventListener('click', init);
    howToPlayBtn.addEventListener('click', () => howToPlayModal.show());
    modalNewGameBtn.addEventListener('click', () => {
        gameModal.hide();
        init();
    });

    init();
});

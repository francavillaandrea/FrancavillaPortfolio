document.addEventListener('DOMContentLoaded', () => {
    const ROWS = 6;
    const COLS = 7;
    const PLAYER1 = 'player1';
    const PLAYER2 = 'player2';

    let grid;
    let currentPlayer;
    let gameMode;
    let gameOver;

    // UI Elements
    const wrapper = document.getElementById('wrapper');
    const turnIndicator = document.getElementById('turn-indicator');
    const gameModeSelect = document.getElementById('game-mode');
    const resetBtn = document.getElementById('reset-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const gameModal = new bootstrap.Modal(document.getElementById('gameModal'));
    const howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalNewGameBtn = document.getElementById('modal-new-game-btn');

    function init() {
        gameOver = false;
        currentPlayer = PLAYER1;
        gameMode = gameModeSelect.value;
        
        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

        wrapper.innerHTML = '';
        wrapper.style.setProperty('--rows', ROWS);
        wrapper.style.setProperty('--cols', COLS);
        
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.col = c;
                wrapper.appendChild(cell);
            }
        }
        
        // Use a single event listener on the wrapper
        wrapper.addEventListener('click', handleGridClick);

        updateTurnIndicator();
    }

    function handleGridClick(e) {
        if (gameOver || !e.target.classList.contains('cell')) return;
        
        const col = parseInt(e.target.dataset.col);
        
        if (gameMode === 'pvc' && currentPlayer === PLAYER2) return; // Prevent player clicks during AI turn

        makeMove(col);
    }
    
    function makeMove(col) {
        if(gameOver) return;

        const row = getLowestEmptyRow(col);
        if (row === -1) return; // Column is full

        grid[row][col] = currentPlayer;
        const cell = wrapper.children[row * COLS + col];
        cell.classList.add(currentPlayer);

        const winner = checkWin();
        if (winner) {
            endGame(winner);
        } else if (isBoardFull()) {
            endGame(null, true); // It's a draw
        } else {
            switchPlayer();
            if (gameMode === 'pvc' && currentPlayer === PLAYER2) {
                // AI's turn
                setTimeout(aiMove, 500);
            }
        }
    }

    function getLowestEmptyRow(col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!grid[r][col]) {
                return r;
            }
        }
        return -1; // Column is full
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === PLAYER1) ? PLAYER2 : PLAYER1;
        updateTurnIndicator();
    }
    
    function updateTurnIndicator() {
        turnIndicator.innerHTML = `
            <div class="cell ${currentPlayer}" style="width: 30px; height: 30px;"></div>
            <span>${(gameMode === 'pvc' && currentPlayer === PLAYER2) ? 'Computer' : (currentPlayer === PLAYER1 ? 'Giocatore 1' : 'Giocatore 2')}</span>
        `;
    }
    
    function aiMove() {
        if(gameOver) return;
        
        // 1. Check for winning move
        for(let c = 0; c < COLS; c++){
            const r = getLowestEmptyRow(c);
            if(r > -1){
                grid[r][c] = PLAYER2;
                if(checkWin()){
                    grid[r][c] = null; // backtrack
                    makeMove(c);
                    return;
                }
                grid[r][c] = null; // backtrack
            }
        }

        // 2. Check to block opponent's winning move
        for(let c = 0; c < COLS; c++){
            const r = getLowestEmptyRow(c);
            if(r > -1){
                grid[r][c] = PLAYER1;
                 if(checkWin()){
                    grid[r][c] = null; // backtrack
                    makeMove(c);
                    return;
                }
                grid[r][c] = null; // backtrack
            }
        }

        // 3. Make a random valid move
        let validMoves = [];
        for(let c = 0; c < COLS; c++){
             if(getLowestEmptyRow(c) > -1) validMoves.push(c);
        }
        
        const randomCol = validMoves[Math.floor(Math.random() * validMoves.length)];
        makeMove(randomCol);
    }
    
    function checkWin() {
         // Check horizontal, vertical, and diagonal lines
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    // Horizontal
                    if (c + 3 < COLS && grid[r][c] === grid[r][c+1] && grid[r][c] === grid[r][c+2] && grid[r][c] === grid[r][c+3]) return { player: grid[r][c], line: [{r,c}, {r,c+1}, {r,c+2}, {r,c+3}] };
                    // Vertical
                    if (r + 3 < ROWS && grid[r][c] === grid[r+1][c] && grid[r][c] === grid[r+2][c] && grid[r][c] === grid[r+3][c]) return { player: grid[r][c], line: [{r,c}, {r+1,c}, {r+2,c}, {r+3,c}] };
                    // Diagonal (down-right)
                    if (r + 3 < ROWS && c + 3 < COLS && grid[r][c] === grid[r+1][c+1] && grid[r][c] === grid[r+2][c+2] && grid[r][c] === grid[r+3][c+3]) return { player: grid[r][c], line: [{r,c}, {r+1,c+1}, {r+2,c+2}, {r+3,c+3}] };
                    // Diagonal (up-right)
                    if (r - 3 >= 0 && c + 3 < COLS && grid[r][c] === grid[r-1][c+1] && grid[r][c] === grid[r-2][c+2] && grid[r][c] === grid[r-3][c+3]) return { player: grid[r][c], line: [{r,c}, {r-1,c+1}, {r-2,c+2}, {r-3,c+3}] };
                }
            }
        }
        return null;
    }
    
    function isBoardFull() {
        return grid[0].every(cell => cell !== null);
    }

    function endGame(winner, isDraw = false) {
        gameOver = true;
        wrapper.removeEventListener('click', handleGridClick);

        if (isDraw) {
            modalTitle.textContent = 'Pareggio!';
            modalBody.textContent = 'La griglia è piena. Nessun vincitore.';
        } else {
            const winnerName = (gameMode === 'pvc' && winner.player === PLAYER2) ? 'Il Computer' : (winner.player === PLAYER1 ? 'Giocatore 1' : 'Giocatore 2');
            modalTitle.textContent = `🎉 Vince ${winnerName}!`;
            modalBody.textContent = 'Complimenti!';
            highlightWinningLine(winner.line);
        }
        setTimeout(() => gameModal.show(), 500);
    }
    
    function highlightWinningLine(line) {
        line.forEach(({r, c}) => {
            const cell = wrapper.children[r * COLS + c];
            cell.classList.add('winning-cell');
        });
    }

    // Event listeners
    gameModeSelect.addEventListener('change', init);
    resetBtn.addEventListener('click', init);
    howToPlayBtn.addEventListener('click', () => howToPlayModal.show());
    modalNewGameBtn.addEventListener('click', () => {
        gameModal.hide();
        init();
    });

    init();
});

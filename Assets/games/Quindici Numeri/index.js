document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        grid: [],
        emptyPos: { row: 0, col: 0 },
        moves: 0,
        startTime: null,
        timerInterval: null,
        gameWon: false,
        gridDim: 4, // Default dimension
        
        // UI Elements
        wrapper: document.getElementById('wrapper'),
        movesElement: document.getElementById('moves'),
        timeElement: document.getElementById('time'),
        difficultySelect: document.getElementById('difficulty'),
        btnNewGame: document.getElementById('btnNewGame'),
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        gameResultModal: new bootstrap.Modal(document.getElementById('gameResultModal')),
        howToPlayModal: new bootstrap.Modal(document.getElementById('howToPlayModal')),
        gameResultModalLabel: document.getElementById('gameResultModalLabel'),
        resultMessage: document.getElementById('result-message'),
        finalMoves: document.getElementById('final-moves'),
        finalTime: document.getElementById('final-time'),
        modalNewGameBtn: document.getElementById('modal-new-game-btn'),

        init: function() {
            this.setupEventListeners();
            this.startNewGame();
        },

        setupEventListeners: function() {
            this.btnNewGame.addEventListener('click', () => this.startNewGame());
            this.difficultySelect.addEventListener('change', () => this.startNewGame());
            this.howToPlayBtn.addEventListener('click', () => this.howToPlayModal.show());
            this.modalNewGameBtn.addEventListener('click', () => {
                this.gameResultModal.hide();
                this.startNewGame();
            });
            this.wrapper.addEventListener('click', (e) => {
                if (e.target.classList.contains('tile') && !e.target.classList.contains('empty')) {
                    const row = parseInt(e.target.dataset.row);
                    const col = parseInt(e.target.dataset.col);
                    this.moveTile(row, col);
                }
            });
        },

        startNewGame: function() {
            this.gameWon = false;
            this.moves = 0;
            this.startTime = null;
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            
            this.gridDim = parseInt(this.difficultySelect.value);
            
            this.movesElement.textContent = '0';
            this.timeElement.textContent = '0:00';
            this.gameResultModal.hide();

            this.generateSolvablePuzzle();
            this.renderBoard();
        },

        generateSolvablePuzzle: function() {
            let numbers = [];
            for (let i = 1; i <= (this.gridDim * this.gridDim) - 1; i++) {
                numbers.push(i);
            }
            numbers.push(0); // Represent empty space

            // Shuffle until solvable
            do {
                this.shuffleArray(numbers);
            } while (!this.isSolvable(numbers));

            // Populate grid
            this.grid = Array(this.gridDim).fill(null).map(() => Array(this.gridDim).fill(0));
            let numIndex = 0;
            for (let r = 0; r < this.gridDim; r++) {
                for (let c = 0; c < this.gridDim; c++) {
                    this.grid[r][c] = numbers[numIndex++];
                    if (this.grid[r][c] === 0) {
                        this.emptyPos = { row: r, col: c };
                    }
                }
            }
        },

        shuffleArray: function(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        },

        isSolvable: function(numbers) {
            let inversions = 0;
            const flatGrid = numbers.filter(num => num !== 0); // Exclude empty tile

            for (let i = 0; i < flatGrid.length - 1; i++) {
                for (let j = i + 1; j < flatGrid.length; j++) {
                    if (flatGrid[i] > flatGrid[j]) {
                        inversions++;
                    }
                }
            }

            const isEvenGrid = (this.gridDim % 2 === 0);
            const emptyRowFromBottom = this.gridDim - this.emptyPos.row;

            if (isEvenGrid) {
                // For even grids, solvability depends on (inversions + empty_row_from_bottom) being even
                return (inversions + emptyRowFromBottom) % 2 === 0;
            } else {
                // For odd grids, solvability depends on inversions being even
                return inversions % 2 === 0;
            }
        },

        renderBoard: function() {
            this.wrapper.innerHTML = '';
            this.wrapper.style.setProperty('--grid-dim', this.gridDim);
            // Dynamically adjust tile size based on gridDim for responsiveness (CSS handles this best)
            // Example: if gridDim is 5, adjust --tile-size in CSS.
            // Or here:
            const newTileSize = (this.gridDim === 3) ? '120px' : (this.gridDim === 4) ? '80px' : '60px';
            this.wrapper.style.setProperty('--tile-size', newTileSize);
            
            for (let r = 0; r < this.gridDim; r++) {
                for (let c = 0; c < this.gridDim; c++) {
                    const tile = document.createElement('div');
                    tile.classList.add('tile');
                    tile.dataset.row = r;
                    tile.dataset.col = c;
                    tile.textContent = this.grid[r][c] === 0 ? '' : this.grid[r][c];
                    if (this.grid[r][c] === 0) {
                        tile.classList.add('empty');
                    }
                    this.wrapper.appendChild(tile);
                }
            }
        },

        moveTile: function(row, col) {
            if (this.gameWon) return;

            // Check if clicked tile is adjacent to empty space
            const rowDiff = Math.abs(row - this.emptyPos.row);
            const colDiff = Math.abs(col - this.emptyPos.col);

            if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                if (this.startTime === null) {
                    this.startTime = Date.now();
                    this.startTimer();
                }
                
                this.swapTiles(row, col, this.emptyPos.row, this.emptyPos.col);
                this.moves++;
                this.movesElement.textContent = this.moves;
                
                this.checkWin();
            }
        },

        swapTiles: function(r1, c1, r2, c2) {
            // Update grid data
            [this.grid[r1][c1], this.grid[r2][c2]] = [this.grid[r2][c2], this.grid[r1][c1]];
            
            // Update UI
            const tile1El = this.wrapper.querySelector(`[data-row="${r1}"][data-col="${c1}"]`);
            const tile2El = this.wrapper.querySelector(`[data-row="${r2}"][data-col="${c2}"]`);

            // Apply animation class temporarily
            tile1El.classList.add('moving');
            setTimeout(() => {
                tile1El.classList.remove('moving');
                this.renderBoard(); // Rerender to reflect new positions and empty tile
            }, 200);

            // Update empty position
            this.emptyPos = { row: r1, col: c1 }; // The empty tile moved to (r1, c1)
        },

        checkWin: function() {
            let expected = 1;
            for (let r = 0; r < this.gridDim; r++) {
                for (let c = 0; c < this.gridDim; c++) {
                    if (r === this.gridDim - 1 && c === this.gridDim - 1) {
                        if (this.grid[r][c] !== 0) return; // Empty tile must be last
                    } else {
                        if (this.grid[r][c] !== expected) return;
                        expected++;
                    }
                }
            }
            this.gameWon = true;
            this.endGame();
        },

        startTimer: function() {
            this.timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.timeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }, 1000);
        },

        endGame: function() {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            
            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(timeSpent / 60);
            const seconds = timeSpent % 60;
            const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            this.gameResultModalLabel.textContent = '🎉 Complimenti!';
            this.resultMessage.textContent = 'Hai completato il puzzle!';
            this.finalMoves.textContent = this.moves;
            this.finalTime.textContent = formattedTime;
            this.gameResultModal.show();
        },
    };

    Game.init();
});
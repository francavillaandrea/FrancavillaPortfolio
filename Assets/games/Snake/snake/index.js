document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        gridSize: 20, // Default grid size
        snake: [{ x: 10, y: 10 }], // Initial position
        food: null,
        direction: 'right',
        score: 0,
        gameInterval: null,
        gameSpeed: 150, // Milliseconds
        gameStarted: false,
        gamePaused: false,
        gameOver: false,
        timer: 0,
        timerInterval: null,

        // UI Elements
        wrapper: document.getElementById('wrapper'),
        scoreDisplay: document.getElementById('score-display'),
        timerDisplay: document.getElementById('timer-display'),
        difficultySelect: document.getElementById('difficulty'),
        btnStartPause: document.getElementById('btnStartPause'),
        btnReset: document.getElementById('btnReset'),
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        mobileControls: document.getElementById('mobile-controls'),
        
        gameResultModal: new bootstrap.Modal(document.getElementById('gameResultModal')),
        howToPlayModal: new bootstrap.Modal(document.getElementById('howToPlayModal')),
        gameResultModalLabel: document.getElementById('gameResultModalLabel'),
        resultMessage: document.getElementById('result-message'),
        finalScore: document.getElementById('final-score'),
        finalTime: document.getElementById('final-time'),
        modalNewGameBtn: document.getElementById('modal-new-game-btn'),

        init: function() {
            this.setupEventListeners();
            this.applyDifficultySettings();
            this.createGrid();
            this.resetGame();
        },

        setupEventListeners: function() {
            this.btnStartPause.addEventListener('click', () => this.toggleGame());
            this.btnReset.addEventListener('click', () => this.resetGame());
            this.difficultySelect.addEventListener('change', () => this.resetGame());
            this.howToPlayBtn.addEventListener('click', () => this.howToPlayModal.show());
            this.modalNewGameBtn.addEventListener('click', () => {
                this.gameResultModal.hide();
                this.resetGame();
                this.startGame();
            });

            document.addEventListener('keydown', (e) => this.handleKeyPress(e));
            this.mobileControls.querySelectorAll('.btn-control').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newDirection = btn.dataset.direction;
                    this.changeDirection(newDirection);
                });
            });
        },

        applyDifficultySettings: function() {
            const difficulty = this.difficultySelect.value;
            switch (difficulty) {
                case 'easy':
                    this.gridSize = 30;
                    this.gameSpeed = 200;
                    break;
                case 'medium':
                    this.gridSize = 25;
                    this.gameSpeed = 150;
                    break;
                case 'hard':
                    this.gridSize = 20;
                    this.gameSpeed = 100;
                    break;
            }
            this.wrapper.style.setProperty('--grid-size', this.gridSize);
        },

        createGrid: function() {
            this.wrapper.innerHTML = ''; // Clear existing grid
            for (let r = 0; r < this.gridSize; r++) {
                for (let c = 0; c < this.gridSize; c++) {
                    const cell = document.createElement('div');
                    cell.classList.add('cell');
                    cell.dataset.r = r;
                    cell.dataset.c = c;
                    this.wrapper.appendChild(cell);
                }
            }
        },

        resetGame: function() {
            this.gameStarted = false;
            this.gamePaused = false;
            this.gameOver = false;
            clearInterval(this.gameInterval);
            clearInterval(this.timerInterval);
            this.timer = 0;
            this.score = 0;
            this.snake = [{ x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) }];
            this.direction = 'right';
            this.food = null;
            
            this.applyDifficultySettings(); // Re-apply settings
            this.createGrid(); // Recreate grid based on new size
            this.placeFood();
            this.updateUI();

            this.btnStartPause.innerHTML = '<i class="bi bi-play-fill"></i> Inizia';
            this.btnStartPause.classList.remove('btn-warning');
            this.btnStartPause.classList.add('btn-success');
        },

        startGame: function() {
            if (this.gameStarted) return;
            this.gameStarted = true;
            this.gamePaused = false;
            this.gameOver = false;
            this.gameInterval = setInterval(() => this.moveSnake(), this.gameSpeed);
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateUI();
            }, 1000);
            this.btnStartPause.innerHTML = '<i class="bi bi-pause-fill"></i> Pausa';
            this.btnStartPause.classList.remove('btn-success');
            this.btnStartPause.classList.add('btn-warning');
        },

        pauseGame: function() {
            if (!this.gameStarted || this.gameOver) return;
            this.gamePaused = true;
            clearInterval(this.gameInterval);
            clearInterval(this.timerInterval);
            this.btnStartPause.innerHTML = '<i class="bi bi-play-fill"></i> Riprendi';
            this.btnStartPause.classList.remove('btn-warning');
            this.btnStartPause.classList.add('btn-success');
        },

        toggleGame: function() {
            if (this.gameOver) {
                this.resetGame();
                this.startGame();
            } else if (this.gameStarted && !this.gamePaused) {
                this.pauseGame();
            } else {
                this.startGame();
            }
        },

        moveSnake: function() {
            const head = { ...this.snake[0] };
            switch (this.direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }

            // Check for collision
            if (this.isCollision(head)) {
                this.endGame(false); // Game Over
                return;
            }

            this.snake.unshift(head); // Add new head

            // Check if snake ate food
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                this.placeFood();
            } else {
                this.snake.pop(); // Remove tail if no food eaten
            }
            this.updateUI();
        },

        isCollision: function(head) {
            // Wall collision
            if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
                return true;
            }
            // Self-collision
            for (let i = 1; i < this.snake.length; i++) {
                if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                    return true;
                }
            }
            return false;
        },

        placeFood: function() {
            let r, c;
            do {
                r = Math.floor(Math.random() * this.gridSize);
                c = Math.floor(Math.random() * this.gridSize);
            } while (this.isOccupied(r, c));
            this.food = { x: c, y: r };
        },

        isOccupied: function(r, c) {
            for (const segment of this.snake) {
                if (segment.x === c && segment.y === r) return true;
            }
            return false;
        },

        changeDirection: function(newDirection) {
            if (this.gameOver || this.gamePaused || !this.gameStarted) return;
            // Prevent 180 degree turns
            if ((newDirection === 'up' && this.direction === 'down') ||
                (newDirection === 'down' && this.direction === 'up') ||
                (newDirection === 'left' && this.direction === 'right') ||
                (newDirection === 'right' && this.direction === 'left')) {
                return;
            }
            this.direction = newDirection;
        },

        endGame: function() {
            this.gameOver = true;
            clearInterval(this.gameInterval);
            clearInterval(this.timerInterval);
            this.gameStarted = false;

            this.gameResultModalLabel.textContent = 'Game Over!';
            this.resultMessage.textContent = 'Il serpente ha sbattuto!';
            this.finalScore.textContent = this.score;
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            this.finalTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            this.gameResultModal.show();
            
            this.btnStartPause.innerHTML = '<i class="bi bi-play-fill"></i> Inizia';
            this.btnStartPause.classList.remove('btn-warning');
            this.btnStartPause.classList.add('btn-success');
        },

        updateUI: function() {
            // Clear board
            this.wrapper.querySelectorAll('.cell').forEach(cell => {
                cell.classList.remove('snake', 'snake-head', 'food');
            });

            // Draw snake
            this.snake.forEach((segment, index) => {
                const cell = this.wrapper.querySelector(`[data-r="${segment.y}"][data-c="${segment.x}"]`);
                if (cell) {
                    cell.classList.add('snake');
                    if (index === 0) {
                        cell.classList.add('snake-head');
                    }
                }
            });

            // Draw food
            const foodCell = this.wrapper.querySelector(`[data-r="${this.food.y}"][data-c="${this.food.x}"]`);
            if (foodCell) {
                foodCell.classList.add('food');
            }

            this.scoreDisplay.textContent = this.score;
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            this.timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },

        handleKeyPress: function(e) {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.changeDirection('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.changeDirection('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.changeDirection('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.changeDirection('right');
                    break;
                case ' ': // Spacebar for pause/play
                    e.preventDefault();
                    this.toggleGame();
                    break;
            }
        }
    };

    Game.init();
});
document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        score: 0,
        timer: 0,
        gameInterval: null,
        spawnInterval: null,
        gameStarted: false,
        gamePaused: false,
        gameOver: false,
        
        // Difficulty settings (fallSpeed in ms, spawnRate in ms, bombChance %)
        difficultySettings: {
            easy: { fallSpeed: 5000, spawnRate: 1500, bombChance: 10 },
            medium: { fallSpeed: 3000, spawnRate: 1000, bombChance: 20 },
            hard: { fallSpeed: 2000, spawnRate: 700, bombChance: 30 }
        },
        currentDifficulty: 'easy',
        gameTimeLimit: 60, // seconds

        // UI Elements
        gameArea: document.getElementById('game-area'),
        scoreDisplay: document.getElementById('score-display'),
        timerDisplay: document.getElementById('timer-display'),
        difficultySelect: document.getElementById('difficulty'),
        btnStartPause: document.getElementById('btnStartPause'),
        btnReset: document.getElementById('btnReset'),
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        
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

            this.gameArea.addEventListener('click', (e) => {
                if (e.target.classList.contains('falling-object')) {
                    this.handleClickObject(e.target);
                }
            });
        },

        applyDifficultySettings: function() {
            this.currentDifficulty = this.difficultySelect.value;
            const settings = this.difficultySettings[this.currentDifficulty];
            this.fallSpeed = settings.fallSpeed;
            this.spawnRate = settings.spawnRate;
            this.bombChance = settings.bombChance;
        },

        resetGame: function() {
            this.gameStarted = false;
            this.gamePaused = false;
            this.gameOver = false;
            clearInterval(this.gameInterval);
            clearInterval(this.spawnInterval);
            this.timer = this.gameTimeLimit;
            this.score = 0;
            this.gameArea.innerHTML = ''; // Clear falling objects
            
            this.applyDifficultySettings();
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
            
            this.spawnInterval = setInterval(() => this.createFallingObject(), this.spawnRate);
            this.gameInterval = setInterval(() => this.updateGameTimer(), 1000);
            
            this.btnStartPause.innerHTML = '<i class="bi bi-pause-fill"></i> Pausa';
            this.btnStartPause.classList.remove('btn-success');
            this.btnStartPause.classList.add('btn-warning');
        },

        pauseGame: function() {
            if (!this.gameStarted || this.gameOver) return;
            this.gamePaused = true;
            clearInterval(this.gameInterval);
            clearInterval(this.spawnInterval);
            document.querySelectorAll('.falling-object').forEach(obj => obj.style.animationPlayState = 'paused');
            
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

        updateGameTimer: function() {
            this.timer--;
            if (this.timer <= 0) {
                this.endGame(true); // Time's up, end game
            }
            this.updateUI();
        },

        createFallingObject: function() {
            if (!this.gameStarted || this.gamePaused || this.gameOver) return;

            const isBomb = Math.random() * 100 < this.bombChance;
            const objectType = isBomb ? 'bomb' : 'star';
            
            const fallingObject = document.createElement('div');
            fallingObject.classList.add('falling-object', objectType);
            
            // Random horizontal position
            const gameAreaWidth = this.gameArea.offsetWidth;
            const objectSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--object-size'));
            const randomX = Math.random() * (gameAreaWidth - objectSize);
            fallingObject.style.left = `${randomX}px`;

            this.gameArea.appendChild(fallingObject);

            // Animate falling
            const fallAnimation = fallingObject.animate([
                { top: '-50px' },
                { top: `${this.gameArea.offsetHeight}px` }
            ], {
                duration: this.fallSpeed,
                easing: 'linear',
                fill: 'forwards'
            });

            fallAnimation.onfinish = () => {
                if (!this.gameOver) {
                    fallingObject.remove(); // Remove if it reaches bottom without being clicked
                }
            };
        },

        handleClickObject: function(objectEl) {
            if (!this.gameStarted || this.gamePaused || this.gameOver) return;

            objectEl.classList.add('clicked'); // Visual feedback
            setTimeout(() => objectEl.remove(), 200); // Remove after animation

            if (objectEl.classList.contains('star')) {
                this.score += 10;
                this.displayMessage('+10 Punti!', 'success');
            } else if (objectEl.classList.contains('bomb')) {
                this.score -= 20; // Penalize for bombs
                this.displayMessage('-20 Punti!', 'error');
            }
            this.updateUI();
        },

        endGame: function(timeUp = false) {
            this.gameOver = true;
            this.gameStarted = false;
            clearInterval(this.gameInterval);
            clearInterval(this.spawnInterval);
            document.querySelectorAll('.falling-object').forEach(obj => obj.remove()); // Clear all falling objects

            this.finalScore.textContent = this.score;
            const minutes = Math.floor((this.gameTimeLimit - this.timer) / 60);
            const seconds = (this.gameTimeLimit - this.timer) % 60;
            this.finalTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (this.score >= 0) { // Simple win condition for positive score
                this.gameResultModalLabel.textContent = '🎉 Gioco Finito!';
                this.resultMessage.textContent = timeUp ? 'Tempo scaduto!' : 'Hai raggiunto il punteggio!';
            } else {
                this.gameResultModalLabel.textContent = '😞 Game Over!';
                this.resultMessage.textContent = 'Hai fatto troppi punti negativi!';
            }
            this.gameResultModal.show();
            
            this.btnStartPause.innerHTML = '<i class="bi bi-play-fill"></i> Inizia';
            this.btnStartPause.classList.remove('btn-warning');
            this.btnStartPause.classList.add('btn-success');
        },

        updateUI: function() {
            this.scoreDisplay.textContent = this.score;
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            this.timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },
        
        displayMessage: function(message, type = 'info') {
            // Temporary message display (could be a toast or a dedicated area)
            const msgEl = document.createElement('div');
            msgEl.textContent = message;
            msgEl.classList.add('temp-message', type);
            this.gameArea.appendChild(msgEl);
            setTimeout(() => msgEl.remove(), 1000);
        }
    };

    Game.init();
});

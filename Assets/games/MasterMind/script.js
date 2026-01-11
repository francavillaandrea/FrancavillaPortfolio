document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        // Properties defined by difficulty
        codeLength: 4,
        maxAttempts: 10,
        availableColors: 6, // Number of colors available for selection
        
        // Game state
        secretCode: [],
        playerGuesses: [], // Stores objects: { guess: [], feedback: [] }
        currentRow: 0,
        gameWon: false,
        gameLost: false,

        // UI Elements
        gameBoard: document.getElementById('game-board'),
        colorPaletteContainer: null, // Dynamically created
        secretCodeArea: document.getElementById('secret-code-area'),
        secretCodeDisplay: document.getElementById('secret-code'),
        messageDisplay: document.getElementById('game-message'),
        difficultySelect: document.getElementById('difficulty'),
        resetBtn: document.getElementById('btnNewGame'),
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        gameModal: new bootstrap.Modal(document.getElementById('gameModal')),
        howToPlayModal: new bootstrap.Modal(document.getElementById('howToPlayModal')),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalNewGameBtn: document.getElementById('modal-new-game-btn'),

        init: function() {
            this.cacheElements();
            this.setupEventListeners();
            this.startNewGame();
        },

        cacheElements: function() {
            this.gameBoard = document.getElementById('game-board');
            this.secretCodeArea = document.getElementById('secret-code-area');
            this.secretCodeDisplay = document.getElementById('secret-code');
            this.messageDisplay = document.getElementById('game-message');
            this.difficultySelect = document.getElementById('difficulty');
            this.resetBtn = document.getElementById('btnNewGame');
            this.howToPlayBtn = document.getElementById('how-to-play-btn');
            this.howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));
            // Cache game modal elements
            this.gameModalEl = document.getElementById('gameModal');
            this.modalTitle = this.gameModalEl.querySelector('.modal-title');
            this.modalBody = this.gameModalEl.querySelector('.modal-body');
            this.modalNewGameBtn = this.gameModalEl.querySelector('#modal-new-game-btn');
        },

        setupEventListeners: function() {
            this.resetBtn.addEventListener('click', () => this.startNewGame());
            this.howToPlayBtn.addEventListener('click', () => this.howToPlayModal.show());
            this.difficultySelect.addEventListener('change', () => this.startNewGame());
            this.modalNewGameBtn.addEventListener('click', () => {
                this.gameModal.hide();
                this.startNewGame();
            });
            // Global click handler for color palette, added dynamically
            // (specific to the current guess row, handled in createBoardUI)
        },

        startNewGame: function() {
            this.gameWon = false;
            this.gameLost = false;
            this.currentRow = 0;
            this.playerGuesses = [];

            const difficultyValue = this.difficultySelect.value.split('-');
            this.codeLength = parseInt(difficultyValue[0]);
            this.availableColors = parseInt(difficultyValue[1]);
            
            // Generate color options (e.g., first 4, 5, or 6 colors from 'this.colors' array)
            this.currentColors = this.colors.slice(0, this.availableColors);
            this.secretCode = this.generateSecretCode();

            this.createBoardUI();
            this.createColorPaletteUI();
            this.updateUI();
            this.displayMessage('Indovina il codice!');
            this.secretCodeArea.style.display = 'none'; // Hide secret code until game over
        },

        generateSecretCode: function() {
            const code = [];
            for (let i = 0; i < this.codeLength; i++) {
                const randomIndex = Math.floor(Math.random() * this.currentColors.length);
                code.push(this.currentColors[randomIndex]);
            }
            return code;
        },

        createBoardUI: function() {
            this.gameBoard.innerHTML = ''; // Clear existing board
            // Set CSS variables for dynamic grid layout
            this.gameBoard.style.setProperty('--grid-cols', this.codeLength);
            
            for (let r = 0; r < this.maxAttempts; r++) {
                const rowWrapper = document.createElement('div');
                rowWrapper.classList.add('attempt-row-wrapper');
                rowWrapper.dataset.row = r;

                const attemptNumber = document.createElement('div');
                attemptNumber.classList.add('attempt-number');
                attemptNumber.textContent = r + 1;
                rowWrapper.appendChild(attemptNumber);

                const guessPegsDiv = document.createElement('div');
                guessPegsDiv.classList.add('guess-pegs');
                guessPegsDiv.style.setProperty('--grid-cols', this.codeLength); // For guess pegs display
                
                for (let i = 0; i < this.codeLength; i++) {
                    const peg = document.createElement('div');
                    peg.classList.add('peg', 'empty-peg');
                    peg.dataset.row = r;
                    peg.dataset.col = i;
                    // Make pegs clickable only for the current row
                    if (r === this.currentRow) {
                        peg.addEventListener('click', (e) => this.selectGuessPeg(e.target));
                    } else {
                        peg.classList.add('locked'); // Lock pegs in other rows
                    }
                    guessPegsDiv.appendChild(peg);
                }
                rowWrapper.appendChild(guessPegsDiv);

                const feedbackPegsDiv = document.createElement('div');
                feedbackPegsDiv.classList.add('feedback-pegs');
                for (let i = 0; i < this.codeLength; i++) { // Always show codeLength feedback pegs
                    const feedbackPeg = document.createElement('div');
                    feedbackPeg.classList.add('feedback-peg');
                    feedbackPegsDiv.appendChild(feedbackPeg);
                }
                rowWrapper.appendChild(feedbackPegsDiv);

                this.gameBoard.appendChild(rowWrapper);
            }
            // Append the color palette and submit button outside the game rows but within game-board
            this.colorPaletteContainer = document.createElement('div');
            this.colorPaletteContainer.classList.add('color-palette');
            this.gameBoard.appendChild(this.colorPaletteContainer);

            const submitGuessButton = document.createElement('button');
            submitGuessButton.id = 'submit-guess-btn';
            submitGuessButton.classList.add('submit-btn', 'btn', 'btn-primary');
            submitGuessButton.textContent = 'Verifica';
            submitGuessButton.addEventListener('click', () => this.submitGuess());
            this.gameBoard.appendChild(submitGuessButton);
        },

        createColorPaletteUI: function() {
            this.colorPaletteContainer.innerHTML = ''; // Clear existing palette
            this.currentColors.forEach(color => {
                const colorOption = document.createElement('div');
                colorOption.classList.add('color-option');
                colorOption.style.backgroundColor = color;
                colorOption.dataset.color = color;
                colorOption.addEventListener('click', () => this.selectPaletteColor(color));
                this.colorPaletteContainer.appendChild(colorOption);
            });
        },
        
        selectedColorFromPalette: null,
        selectPaletteColor: function(color) {
            if (this.gameWon || this.gameLost) return;
            // Remove 'selected' class from previously selected palette color
            document.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('selected');
            });
            // Add 'selected' class to the new palette color
            const selectedOption = document.querySelector(`.color-option[data-color="${color}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
            this.selectedColorFromPalette = color;
        },

        selectGuessPeg: function(targetPeg) {
            if (this.gameWon || this.gameLost || parseInt(targetPeg.dataset.row) !== this.currentRow) return;
            
            if (this.selectedColorFromPalette) {
                targetPeg.style.backgroundColor = this.selectedColorFromPalette;
                targetPeg.classList.remove('empty-peg');
                // Store the color in the current guess row array
                let guess = this.playerGuesses[this.currentRow] ? this.playerGuesses[this.currentRow].guess : Array(this.codeLength).fill(null);
                guess[parseInt(targetPeg.dataset.col)] = this.selectedColorFromPalette;
                this.playerGuesses[this.currentRow] = { guess: guess, feedback: [] };
            } else {
                this.displayMessage("Seleziona un colore dalla palette!", "error");
            }
        },

        submitGuess: function() {
            if (this.gameWon || this.gameLost) return;

            const currentGuessData = this.playerGuesses[this.currentRow];
            if (!currentGuessData || currentGuessData.guess.includes(null)) {
                this.displayMessage("Completa la tua riga prima di verificare!", "error");
                return;
            }

            const guess = currentGuessData.guess;
            const feedback = this.checkGuessLogic(guess, this.secretCode);
            currentGuessData.feedback = feedback;
            
            this.displayFeedback(this.currentRow, feedback);

            if (feedback.correctPosition === this.codeLength) {
                this.endGame(true);
            } else if (this.currentRow >= this.maxAttempts - 1) { // Check if max attempts reached
                this.endGame(false);
            } else {
                this.currentRow++;
                this.updateRowInteractivity(this.currentRow);
                this.displayMessage('Indovina il codice!');
            }
            this.updateUI();
        },
        
        checkGuessLogic: function(guess, secret) {
            let correctPosition = 0;
            let correctColor = 0;
            const secretCopy = [...secret];
            const guessCopy = [...guess];

            // First pass: check for correct color and position (black pegs)
            for (let i = 0; i < this.codeLength; i++) {
                if (guessCopy[i] === secretCopy[i]) {
                    correctPosition++;
                    guessCopy[i] = null; // Mark as used
                    secretCopy[i] = null; // Mark as used
                }
            }

            // Second pass: check for correct color, wrong position (white pegs)
            for (let i = 0; i < this.codeLength; i++) {
                if (guessCopy[i] !== null) {
                    const colorIndex = secretCopy.indexOf(guessCopy[i]);
                    if (colorIndex !== -1) {
                        correctColor++;
                        secretCopy[colorIndex] = null; // Mark as used
                    }
                }
            }
            return { correctPosition, correctColor };
        },

        displayFeedback: function(row, feedback) {
            const feedbackPegsDiv = document.querySelector(`.attempt-row-wrapper[data-row='${row}'] .feedback-pegs`);
            const pegs = Array.from(feedbackPegsDiv.children); // Convert HTMLCollection to Array
            
            let pegIndex = 0;
            for (let i = 0; i < feedback.correctPosition; i++) {
                pegs[pegIndex++].classList.add('correct');
            }
            for (let i = 0; i < feedback.correctColor; i++) {
                pegs[pegIndex++].classList.add('present');
            }
        },

        endGame: function(win) {
            this.gameWon = win;
            this.gameLost = !win;
            
            this.secretCodeArea.style.display = 'block'; // Show secret code
            this.secretCodeDisplay.innerHTML = this.secretCode.map(color => {
                const div = document.createElement('div');
                div.style.backgroundColor = color;
                div.classList.add('peg');
                div.classList.add('locked'); // Lock for display
                return div.outerHTML;
            }).join('');
            
            // Disable all guess pegs and submit button
            document.querySelectorAll('.peg').forEach(peg => peg.classList.add('locked'));
            document.getElementById('submit-guess-btn').disabled = true;

            if (win) {
                this.modalTitle.textContent = '🎉 Hai Vinto!';
                this.modalBody.textContent = `Congratulazioni! Hai indovinato il codice in ${this.currentRow + 1} tentativi!`;
            } else {
                this.modalTitle.textContent = '😞 Hai Perso!';
                this.modalBody.textContent = `Hai esaurito i tentativi. Il codice segreto era: ${this.secretCode.join(', ')}. Riprova!`;
            }
            this.gameModal.show();
            this.updateUI(); // Update UI to show final state (e.g., hidden secret code)
        },

        updateUI: function() {
            // Update interactivity for current row
            this.updateRowInteractivity(this.currentRow);
            
            // Highlight current guess row
            document.querySelectorAll('.attempt-row-wrapper').forEach(row => {
                row.classList.remove('current-row');
            });
            const currentRowEl = document.querySelector(`.attempt-row-wrapper[data-row='${this.currentRow}']`);
            if (currentRowEl && !this.gameWon && !this.gameLost) {
                currentRowEl.classList.add('current-row');
            }

            // Update submit button state
            const submitButton = document.getElementById('submit-guess-btn');
            if (submitButton) {
                submitButton.disabled = this.gameWon || this.gameLost;
            }
        },

        updateRowInteractivity: function(rowIndex) {
            document.querySelectorAll('.guess-pegs .peg').forEach(peg => {
                if (parseInt(peg.dataset.row) === rowIndex) {
                    peg.classList.remove('locked');
                    peg.style.cursor = 'pointer';
                } else {
                    peg.classList.add('locked');
                    peg.style.cursor = 'default';
                }
            });

            // Disable submit buttons for other rows
            document.querySelectorAll('.submit-btn').forEach(btn => {
                btn.style.display = 'none'; // Hide all submit buttons initially
            });
            const currentSubmitBtn = document.querySelector(`.submit-btn[data-row='${rowIndex}']`);
            if (currentSubmitBtn && !this.gameWon && !this.gameLost) {
                currentSubmitBtn.style.display = 'block'; // Show only current row's submit button
            }
        },
        
        displayMessage: function(message, type = 'info') {
            this.messageDisplay.textContent = message;
            this.messageDisplay.className = ''; // Clear previous classes
            this.messageDisplay.classList.add(type);
        },

        random: function(min, max) {
            return Math.floor((max - min) * Math.random()) + min;
        }
    };

    Game.init();
});
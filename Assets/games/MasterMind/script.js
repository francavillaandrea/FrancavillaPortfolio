document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        // Color palette - più vibranti e moderne
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#F39C12', '#E74C3C'],
        
        // Properties defined by difficulty
        codeLength: 4,
        maxAttempts: 10,
        availableColors: 6,
        
        // Game state
        secretCode: [],
        playerGuesses: [],
        currentRow: 0,
        gameWon: false,
        gameLost: false,
        selectedColorFromPalette: null,
        
        // UI Elements Cache
        gameBoard: null,
        colorPaletteContainer: null,
        secretCodeArea: null,
        secretCodeDisplay: null,
        messageDisplay: null,
        difficultySelect: null,
        resetBtn: null,
        howToPlayBtn: null,
        howToPlayModal: null,
        submitGuessButton: null,
        
        // Cached DOM references per performance
        rowElements: {},
        colorOptionElements: [],

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
        },

        setupEventListeners: function() {
            this.resetBtn.addEventListener('click', () => this.startNewGame());
            this.howToPlayBtn.addEventListener('click', () => this.howToPlayModal.show());
            this.difficultySelect.addEventListener('change', () => this.startNewGame());
            
            // Delegated event listener per colori
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('color-option')) {
                    this.selectPaletteColor(e.target);
                }
            });
        },

        startNewGame: function() {
            this.gameWon = false;
            this.gameLost = false;
            this.currentRow = 0;
            this.playerGuesses = [];
            this.rowElements = {};
            this.selectedColorFromPalette = null;

            const difficultyValue = this.difficultySelect.value.split('-');
            this.codeLength = parseInt(difficultyValue[0]);
            this.availableColors = parseInt(difficultyValue[1]);
            
            this.currentColors = this.colors.slice(0, this.availableColors);
            this.secretCode = this.generateSecretCode();

            this.createBoardUI();
            this.createColorPaletteUI();
            this.updateUI();
            this.displayMessage('Indovina il codice!');
            this.secretCodeArea.style.display = 'none';
        },

        generateSecretCode: function() {
            const code = [];
            for (let i = 0; i < this.codeLength; i++) {
                code.push(this.currentColors[Math.floor(Math.random() * this.currentColors.length)]);
            }
            return code;
        },

        createBoardUI: function() {
            this.gameBoard.innerHTML = '';
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
                guessPegsDiv.style.setProperty('--grid-cols', this.codeLength);
                
                const pegRow = [];
                for (let i = 0; i < this.codeLength; i++) {
                    const peg = document.createElement('div');
                    peg.classList.add('peg', 'empty-peg');
                    peg.dataset.row = r;
                    peg.dataset.col = i;
                    
                    if (r === this.currentRow) {
                        peg.addEventListener('click', (e) => this.selectGuessPeg(e.target));
                    } else {
                        peg.classList.add('locked');
                    }
                    guessPegsDiv.appendChild(peg);
                    pegRow.push(peg);
                }
                
                this.rowElements[r] = {
                    row: rowWrapper,
                    pegs: pegRow,
                    feedbackPegs: []
                };
                
                rowWrapper.appendChild(guessPegsDiv);

                const feedbackPegsDiv = document.createElement('div');
                feedbackPegsDiv.classList.add('feedback-pegs');
                
                const feedbackRow = [];
                for (let i = 0; i < this.codeLength; i++) {
                    const feedbackPeg = document.createElement('div');
                    feedbackPeg.classList.add('feedback-peg');
                    feedbackPegsDiv.appendChild(feedbackPeg);
                    feedbackRow.push(feedbackPeg);
                }
                
                this.rowElements[r].feedbackPegs = feedbackRow;
                rowWrapper.appendChild(feedbackPegsDiv);
                this.gameBoard.appendChild(rowWrapper);
            }

            this.colorPaletteContainer = document.createElement('div');
            this.colorPaletteContainer.classList.add('color-palette');
            this.gameBoard.appendChild(this.colorPaletteContainer);

            this.submitGuessButton = document.createElement('button');
            this.submitGuessButton.id = 'submit-guess-btn';
            this.submitGuessButton.classList.add('submit-btn');
            this.submitGuessButton.textContent = 'Verifica Codice';
            this.submitGuessButton.addEventListener('click', () => this.submitGuess());
            this.gameBoard.appendChild(this.submitGuessButton);
        },

        createColorPaletteUI: function() {
            this.colorPaletteContainer.innerHTML = '';
            this.colorOptionElements = [];
            
            this.currentColors.forEach(color => {
                const colorOption = document.createElement('div');
                colorOption.classList.add('color-option');
                colorOption.style.backgroundColor = color;
                colorOption.dataset.color = color;
                this.colorPaletteContainer.appendChild(colorOption);
                this.colorOptionElements.push(colorOption);
            });
        },

        selectPaletteColor: function(element) {
            if (this.gameWon || this.gameLost) return;
            
            // Rimuovi selected da tutti
            this.colorOptionElements.forEach(opt => opt.classList.remove('selected'));
            
            // Aggiungi selected solo a quello cliccato
            element.classList.add('selected');
            this.selectedColorFromPalette = element.dataset.color;
        },

        selectGuessPeg: function(targetPeg) {
            if (this.gameWon || this.gameLost || parseInt(targetPeg.dataset.row) !== this.currentRow) return;
            
            if (!this.selectedColorFromPalette) {
                this.displayMessage("Seleziona un colore dalla palette!", "error");
                return;
            }
            
            const row = parseInt(targetPeg.dataset.row);
            const col = parseInt(targetPeg.dataset.col);
            
            targetPeg.style.backgroundColor = this.selectedColorFromPalette;
            targetPeg.classList.remove('empty-peg');
            
            let guess = this.playerGuesses[row] ? this.playerGuesses[row].guess : Array(this.codeLength).fill(null);
            guess[col] = this.selectedColorFromPalette;
            this.playerGuesses[row] = { guess: guess, feedback: [] };
        },

        submitGuess: function() {
            if (this.gameWon || this.gameLost) return;

            const currentGuessData = this.playerGuesses[this.currentRow];
            if (!currentGuessData || currentGuessData.guess.includes(null)) {
                this.displayMessage("Completa tutte le caselle! 🎨", "error");
                return;
            }

            const guess = currentGuessData.guess;
            const feedback = this.checkGuessLogic(guess, this.secretCode);
            currentGuessData.feedback = feedback;
            
            this.displayFeedback(this.currentRow, feedback);

            if (feedback.correctPosition === this.codeLength) {
                this.endGame(true);
            } else if (this.currentRow >= this.maxAttempts - 1) {
                this.endGame(false);
            } else {
                this.currentRow++;
                this.updateUI();
                this.displayMessage('Prossimo tentativo... 🤔');
            }
        },
        
        checkGuessLogic: function(guess, secret) {
            let correctPosition = 0;
            let correctColor = 0;
            const secretCopy = [...secret];
            const guessCopy = [...guess];

            for (let i = 0; i < this.codeLength; i++) {
                if (guessCopy[i] === secretCopy[i]) {
                    correctPosition++;
                    guessCopy[i] = null;
                    secretCopy[i] = null;
                }
            }

            for (let i = 0; i < this.codeLength; i++) {
                if (guessCopy[i] !== null) {
                    const colorIndex = secretCopy.indexOf(guessCopy[i]);
                    if (colorIndex !== -1) {
                        correctColor++;
                        secretCopy[colorIndex] = null;
                    }
                }
            }
            return { correctPosition, correctColor };
        },

        displayFeedback: function(row, feedback) {
            const feedbackPegs = this.rowElements[row].feedbackPegs;
            let pegIndex = 0;
            
            // Correct position (Blue)
            for (let i = 0; i < feedback.correctPosition; i++) {
                feedbackPegs[pegIndex++].classList.add('correct');
            }
            
            // Correct color, wrong position (Yellow)
            for (let i = 0; i < feedback.correctColor; i++) {
                feedbackPegs[pegIndex++].classList.add('present');
            }
        },

        endGame: function(win) {
            this.gameWon = win;
            this.gameLost = !win;
            
            this.secretCodeArea.style.display = 'block';
            this.secretCodeDisplay.innerHTML = this.secretCode.map(color => {
                const div = document.createElement('div');
                div.style.backgroundColor = color;
                div.classList.add('peg', 'locked');
                return div.outerHTML;
            }).join('');
            
            // Disabilita tutte le pegs
            Object.values(this.rowElements).forEach(row => {
                row.pegs.forEach(peg => peg.classList.add('locked'));
            });
            
            this.submitGuessButton.disabled = true;
            
            // Mostra risultato senza modal
            if (win) {
                this.displayMessage(`🎉 Hai vinto in ${this.currentRow + 1} tentativi!`, 'success');
                document.querySelector('.attempt-row-wrapper[data-row="' + this.currentRow + '"]').classList.add('win-row');
            } else {
                this.displayMessage(`😞 Hai perso! Il codice era: ${this.secretCode.map(c => `<span style="display:inline-block; width:20px; height:20px; border-radius:50%; background:${c}; margin:0 3px;"></span>`).join('')}`, 'error');
            }
        },

        updateUI: function() {
            // Update current row interactivity
            Object.keys(this.rowElements).forEach(r => {
                const row = parseInt(r);
                const isCurrentRow = row === this.currentRow && !this.gameWon && !this.gameLost;
                
                this.rowElements[r].row.classList.toggle('current-row', isCurrentRow);
                
                this.rowElements[r].pegs.forEach(peg => {
                    if (isCurrentRow) {
                        peg.classList.remove('locked');
                        peg.style.cursor = 'pointer';
                    } else {
                        peg.classList.add('locked');
                        peg.style.cursor = 'default';
                    }
                });
            });

            if (this.submitGuessButton) {
                this.submitGuessButton.disabled = this.gameWon || this.gameLost;
            }
        },
        
        displayMessage: function(message, type = 'info') {
            this.messageDisplay.textContent = message;
            this.messageDisplay.className = type;
            this.messageDisplay.style.animation = 'none';
            setTimeout(() => {
                this.messageDisplay.style.animation = '';
            }, 10);
        }
    };

    Game.init();
});
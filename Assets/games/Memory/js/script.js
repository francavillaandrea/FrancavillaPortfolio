$(document).ready(function() {
    const Game = {
        symbols: ["🍇", "🍎", "🍌", "🍓", "🍍", "🥭", "🥝", "🍊", "🍉", "🍑", "🍒", "🥥", "🍋", "🍐", "🥑"],
        cardValues: [],
        board: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: 0,
        timerInterval: null,
        gameStarted: false,
        gridRows: 4,
        gridCols: 4,
        
        // UI Elements
        gameBoardEl: $('#game-board'),
        movesCountEl: $('#moves-count'),
        timerDisplayEl: $('#timer-display'),
        difficultySelect: $('#difficulty'),
        btnNewGame: $('#btnNewGame'),
        howToPlayBtn: $('#how-to-play-btn'),
        howToPlayModal: new bootstrap.Modal(document.getElementById('howToPlayModal')),
        gameResultModal: new bootstrap.Modal(document.getElementById('gameResultModal')),
        gameResultModalLabel: $('#gameResultModalLabel'),
        resultMessage: $('#result-message'),
        finalMoves: $('#final-moves'),
        finalTime: $('#final-time'),
        modalNewGameBtn: $('#modal-new-game-btn'),

        init: function() {
            this.setupEventListeners();
            this.startNewGame();
        },

        setupEventListeners: function() {
            this.btnNewGame.on('click', () => this.startNewGame());
            this.difficultySelect.on('change', () => this.startNewGame());
            this.howToPlayBtn.on('click', () => this.howToPlayModal.show());
            this.gameBoardEl.on('click', '.card-inner:not(.flipped):not(.matched)', (e) => this.handleCardClick(e.currentTarget));
            this.modalNewGameBtn.on('click', () => {
                this.gameResultModal.hide();
                this.startNewGame();
            });
        },

        startNewGame: function() {
            this.gameStarted = false;
            clearInterval(this.timerInterval);
            this.flippedCards = [];
            this.matchedPairs = 0;
            this.moves = 0;
            this.timer = 0;
            
            this.setDifficulty();
            this.generateCardValues();
            this.shuffleCards();
            this.createBoardUI();
            this.updateUI();

            // Briefly show all cards at start
            this.gameBoardEl.find('.card-inner').addClass('flipped');
            setTimeout(() => {
                this.gameBoardEl.find('.card-inner').removeClass('flipped');
                this.gameStarted = true;
                this.startTimer();
            }, 2000); // Show for 2 seconds
        },

        setDifficulty: function() {
            const difficulty = this.difficultySelect.val();
            switch (difficulty) {
                case '4x4':
                    this.gridRows = 4;
                    this.gridCols = 4;
                    break;
                case '4x5':
                    this.gridRows = 4;
                    this.gridCols = 5;
                    break;
                case '5x6':
                    this.gridRows = 5;
                    this.gridCols = 6;
                    break;
            }
            this.totalCards = this.gridRows * this.gridCols;
            this.totalPairs = this.totalCards / 2;
        },

        generateCardValues: function() {
            const availableSymbols = this.symbols.slice(0, this.totalPairs);
            this.cardValues = availableSymbols.concat(availableSymbols);
        },

        shuffleCards: function() {
            for (let i = this.cardValues.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.cardValues[i], this.cardValues[j]] = [this.cardValues[j], this.cardValues[i]];
            }
        },

        createBoardUI: function() {
            this.gameBoardEl.empty();
            this.gameBoardEl.css({
                'grid-template-columns': `repeat(${this.gridCols}, var(--card-size))`,
                'grid-template-rows': `repeat(${this.gridRows}, var(--card-size))`
            });
            this.gameBoardEl.css('--grid-rows', this.gridRows);
            this.gameBoardEl.css('--grid-cols', this.gridCols);

            this.cardValues.forEach((symbol, index) => {
                const cardOuter = $('<div>').addClass('card-outer');
                const cardInner = $('<div>').addClass('card-inner').attr('data-id', index);
                const cardFront = $('<div>').addClass('card-front');
                const cardBack = $('<div>').addClass('card-back').html(symbol);
                
                cardInner.append(cardFront, cardBack);
                cardOuter.append(cardInner);
                this.gameBoardEl.append(cardOuter);
            });
        },

        startTimer: function() {
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateUI();
            }, 1000);
        },

        handleCardClick: function(cardElement) {
            if (!this.gameStarted || this.flippedCards.length === 2) return;

            const $card = $(cardElement);
            $card.addClass('flipped');
            this.flippedCards.push($card);
            
            if (this.flippedCards.length === 2) {
                this.moves++;
                this.updateUI();
                const [card1, card2] = this.flippedCards;
                
                if (card1.find('.card-back').html() === card2.find('.card-back').html()) {
                    // Match found
                    card1.addClass('matched');
                    card2.addClass('matched');
                    this.matchedPairs++;
                    this.flippedCards = [];
                    
                    if (this.matchedPairs === this.totalPairs) {
                        this.endGame(true);
                    }
                } else {
                    // No match, flip back
                    setTimeout(() => {
                        card1.removeClass('flipped');
                        card2.removeClass('flipped');
                        this.flippedCards = [];
                    }, 1000);
                }
            }
        },

        endGame: function(win) {
            this.gameStarted = false;
            clearInterval(this.timerInterval);
            
            this.finalMoves.text(this.moves);
            this.finalTime.text(this.timer);

            if (win) {
                this.gameResultModalLabel.text('🎉 Hai Vinto!');
                this.resultMessage.text('Complimenti! Hai trovato tutte le coppie!');
            } else {
                this.gameResultModalLabel.text('😞 Game Over!');
                this.resultMessage.text('Tempo scaduto! Riprova!');
            }
            this.gameResultModal.show();
        },

        updateUI: function() {
            this.movesCountEl.text(this.moves);
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            this.timerDisplayEl.text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            
            // Update CSS variables for grid dynamically
            this.gameBoardEl.css('--grid-rows', this.gridRows);
            this.gameBoardEl.css('--grid-cols', this.gridCols);
        },

        showHowToPlay: function() {
            this.howToPlayModal.show();
        }
    };

    Game.init();
});

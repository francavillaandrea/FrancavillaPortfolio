const words = {
    easy: [
        "casa", "gatto", "cane", "sole", "mare", "luna", "stella", "fiore",
        "albero", "libro", "scuola", "amico", "gioco", "palla", "tavolo",
        "sedia", "porta", "finestra", "mamma", "papà", "bambino", "bambina",
        "acqua", "pane", "latte", "mela", "banana", "arancia", "uva", "pesca"
    ],
    medium: [
        "computer", "javascript", "programmare", "coding", "veloce", "studio",
        "html", "bootstrap", "jquery", "sviluppo", "tecnologia", "digitare",
        "mouse", "tastiera", "logica", "funzione", "schermo", "processore",
        "database", "internet", "algoritmo", "matrice", "variabile", "condizione",
        "ciclo", "evento", "risorsa", "memoria", "connessione", "password"
    ],
    hard: [
        "programmazione", "algoritmico", "architettura", "implementazione",
        "ottimizzazione", "debugging", "refactoring", "documentazione",
        "sperimentazione", "collaborazione", "innovazione", "trasformazione",
        "comunicazione", "organizzazione", "sperimentazione", "visualizzazione",
        "configurazione", "autenticazione", "crittografia", "decompressione",
        "parallelizzazione", "sincronizzazione", "sperimentazione", "ottimizzazione"
    ]
};

$(document).ready(function() {
    const Game = {
        totalTime: 60, // seconds
        timeLeft: 0,
        currentWord: "",
        wordsTyped: 0,
        correctWords: 0,
        incorrectWords: 0,
        correctChars: 0,
        totalChars: 0,
        typedChars: 0,
        startTime: null,
        timeInterval: null,
        gameStarted: false,
        bestWPM: 0,
        
        // UI Elements
        timeDisplay: $('#time'),
        wpmDisplay: $('#wpm'),
        accuracyDisplay: $('#accuracy'),
        bestWPMDisplay: $('#best-wpm'),
        difficultyRadios: $('input[name="difficulty"]'),
        wordDisplay: $('#wordDisplay'),
        typingInput: $('#typingInput'),
        inputFeedback: $('#input-feedback'),
        startBtn: $('#startBtn'),
        resetBtn: $('#resetBtn'),
        resultsContainer: $('#results'),
        finalWPM: $('#final-wpm'),
        finalWords: $('#final-words'),
        finalAccuracy: $('#final-accuracy'),
        finalChars: $('#final-chars'),
        howToPlayBtn: $('#how-to-play-btn'),
        howToPlayModal: new bootstrap.Modal(document.getElementById('howToPlayModal')),

        init: function() {
            this.loadBestWPM();
            this.setupEventListeners();
            this.resetGame();
        },

        setupEventListeners: function() {
            this.startBtn.on('click', () => this.startGame());
            this.resetBtn.on('click', () => this.resetGame());
            this.difficultyRadios.on('change', () => {
                if (!this.gameStarted) {
                    this.resetGame();
                }
            });
            this.typingInput.on('input', () => this.handleTypingInput());
            this.typingInput.on('keypress', (e) => this.handleKeyPress(e));
            this.howToPlayBtn.on('click', () => this.howToPlayModal.show());
        },

        loadBestWPM: function() {
            this.bestWPM = parseInt(localStorage.getItem("speedtype-best-wpm")) || 0;
            this.bestWPMDisplay.text(this.bestWPM);
        },

        startGame: function() {
            if (this.gameStarted) return;
            this.gameStarted = true;
            this.startTime = Date.now();
            this.typingInput.prop('disabled', false).focus();
            this.startBtn.hide();
            this.resetBtn.show();
            this.resultsContainer.hide();

            this.generateNewWord();
            this.startTimer();
            this.updateStatsUI();
        },

        resetGame: function() {
            clearInterval(this.timeInterval);
            this.gameStarted = false;
            this.timeLeft = this.totalTime;
            this.score = 0; // WPM for display
            this.wordsTyped = 0;
            this.correctWords = 0;
            this.incorrectWords = 0;
            this.correctChars = 0;
            this.totalChars = 0;
            this.typedChars = 0;
            this.currentWord = "";

            this.typingInput.val("").prop('disabled', true).removeClass('correct wrong');
            this.wordDisplay.text("Clicca 'Inizia' per iniziare!").removeClass('correct wrong');
            this.inputFeedback.text("");
            this.startBtn.show();
            this.resetBtn.hide();
            this.resultsContainer.hide();
            
            // Reset difficulty radio buttons states
            this.difficultyRadios.prop('disabled', false);

            this.updateStatsUI();
        },

        startTimer: function() {
            this.timeInterval = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
                this.updateStatsUI();
            }, 1000);
        },

        endGame: function() {
            clearInterval(this.timeInterval);
            this.gameStarted = false;
            this.typingInput.prop('disabled', true);
            this.difficultyRadios.prop('disabled', false); // Re-enable difficulty selection

            const elapsedMinutes = (Date.now() - this.startTime) / 1000 / 60;
            const finalWPM = Math.round(this.correctChars / 5 / elapsedMinutes); // 5 chars per word average
            const finalAccuracy = this.typedChars > 0 ? Math.round((this.correctChars / this.typedChars) * 100) : 0;
            
            // Update final results
            this.finalWPM.text(finalWPM);
            this.finalWords.text(this.correctWords);
            this.finalAccuracy.text(finalAccuracy + "%");
            this.finalChars.text(this.typedChars);

            // Update best WPM
            if (finalWPM > this.bestWPM) {
                this.bestWPM = finalWPM;
                localStorage.setItem("speedtype-best-wpm", this.bestWPM);
            }
            this.bestWPMDisplay.text(this.bestWPM); // Update best WPM on UI

            this.resultsContainer.show();
            this.wordDisplay.text("Tempo Scaduto!");
            this.startBtn.show(); // Show Start button for new game
            this.resetBtn.hide(); // Hide reset button
        },

        generateNewWord: function() {
            const currentDifficulty = $('input[name="difficulty"]:checked').val();
            const wordList = words[currentDifficulty];
            this.currentWord = wordList[Math.floor(Math.random() * wordList.length)];
            this.wordDisplay.text(this.currentWord);
            this.typingInput.val('');
            this.typingInput.removeClass('correct wrong');
            this.inputFeedback.text('');
        },

        handleTypingInput: function() {
            if (!this.gameStarted) return;

            const typedText = this.typingInput.val();
            this.typedChars++; // Count every character typed
            
            // Live feedback
            if (this.currentWord.startsWith(typedText)) {
                this.typingInput.removeClass('wrong').addClass('correct');
                this.wordDisplay.removeClass('wrong');
                this.inputFeedback.text('');
            } else {
                this.typingInput.removeClass('correct').addClass('wrong');
                this.wordDisplay.addClass('wrong');
                this.inputFeedback.text('✗ Errore!').css('color', 'var(--bs-danger)');
            }
        },

        handleKeyPress: function(e) {
            if (!this.gameStarted) return;

            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                const typedText = this.typingInput.val().trim();
                
                if (typedText === this.currentWord) {
                    this.correctWords++;
                    this.correctChars += this.currentWord.length;
                    this.generateNewWord();
                    this.inputFeedback.text('✓ Corretto!').css('color', 'var(--bs-success)');
                } else {
                    this.incorrectWords++;
                    this.inputFeedback.text('✗ Sbagliato!').css('color', 'var(--bs-danger)');
                }
                this.wordsTyped++; // Count all words attempted
                this.updateStatsUI();
            }
        },

        updateStatsUI: function() {
            this.timeDisplay.text(this.timeLeft);
            
            const elapsedMinutes = (Date.now() - this.startTime) / 1000 / 60;
            const currentWPM = elapsedMinutes > 0 ? Math.round(this.correctChars / 5 / elapsedMinutes) : 0;
            this.wpmDisplay.text(currentWPM);

            const currentAccuracy = this.typedChars > 0 ? Math.round((this.correctChars / this.typedChars) * 100) : 0;
            this.accuracyDisplay.text(currentAccuracy);

            // Update color of time stat-box
            const timeBox = this.timeDisplay.closest('.stat-box');
            if (this.timeLeft <= 10) {
                timeBox.css("border-color", "var(--bs-danger)");
            } else if (this.timeLeft <= 20) {
                timeBox.css("border-color", "var(--bs-warning)");
            } else {
                timeBox.css("border-color", "var(--bs-border-color)");
            }

            // Update color of accuracy stat-box
            const accuracyBox = this.accuracyDisplay.closest('.stat-box');
            if (currentAccuracy >= 90) {
                accuracyBox.css("border-color", "var(--bs-success)");
            } else if (currentAccuracy >= 70) {
                accuracyBox.css("border-color", "var(--bs-warning)");
            } else {
                accuracyBox.css("border-color", "var(--bs-danger)");
            }
        }
    };

    Game.init();
});
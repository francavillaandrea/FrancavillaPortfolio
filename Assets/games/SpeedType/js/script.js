// Array fallback di parole nel caso l'API non sia disponibile
const fallbackWords = {
    easy: [
        "casa", "gatto", "cane", "sole", "mare", "luna", "stella", "fiore",
        "albero", "libro", "scuola", "amico", "gioco", "palla", "tavolo",
        "sedia", "porta", "finestra", "mamma", "papà", "bambino", "bambina",
        "acqua", "pane", "latte", "mela", "banana", "arancia", "uva", "pesca",
        "naso", "occhio", "bocca", "orecchio", "mano", "piede", "cuore", "testa",
        "notte", "giorno", "ora", "minuto", "secondo", "settimana", "mese", "anno",
        "rosso", "blu", "verde", "giallo", "nero", "bianco", "rosa", "marrone",
        "alto", "basso", "grande", "piccolo", "caldo", "freddo", "nuovo", "vecchio",
        "pizza", "pasta", "formaggio", "burro", "sale", "pepe", "zucchero", "farina"
    ],
    medium: [
        "computer", "javascript", "programmare", "coding", "veloce", "studio",
        "html", "bootstrap", "jquery", "sviluppo", "tecnologia", "digitare",
        "mouse", "tastiera", "logica", "funzione", "schermo", "processore",
        "database", "internet", "algoritmo", "matrice", "variabile", "condizione",
        "ciclo", "evento", "risorsa", "memoria", "connessione", "password",
        "applicazione", "software", "hardware", "sistema", "operativo", "browser",
        "server", "client", "rete", "indirizzo", "dominio", "sito", "pagina",
        "immagine", "video", "audio", "documento", "cartella", "file", "download",
        "caricamento", "sincronizzazione", "aggiornamento", "versione", "backup",
        "sicurezza", "crittografia", "autenticazione", "permesso", "accesso",
        "progetto", "squadra", "collaborazione", "comunicazione", "riunione"
    ],
    hard: [
        "programmazione", "algoritmico", "architettura", "implementazione",
        "ottimizzazione", "debugging", "refactoring", "documentazione",
        "sperimentazione", "collaborazione", "innovazione", "trasformazione",
        "comunicazione", "organizzazione", "visualizzazione", "configurazione",
        "autenticazione", "crittografia", "decompressione", "parallelizzazione",
        "sincronizzazione", "ottimizzazione", "frameworks", "libreria", "modulo",
        "componente", "interfaccia", "protocollo", "architettura", "microservizi",
        "contenitore", "orchestrazione", "containerizzazione", "virtualizzazione",
        "scalabilità", "disponibilità", "affidabilità", "prestazioni", "latenza",
        "throughput", "bandwidth", "compressione", "serializzazione", "parsing",
        "renderizzazione", "interpolazione", "interpolazione", "estrapolazione",
        "approssimazione", "discretizzazione", "quantizzazione", "normalizzazione",
        "standardizzazione", "uniformazione", "formalizzazione", "flessibilità",
        "modularità", "manutenibilità", "leggibilità", "testabilità", "portabilità",
        "compatibilità", "interoperabilità", "estensibilità", "scalabilità"
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
        usedWords: new Set(), // Traccia le parole già usate in questa sessione
        apiWords: [], // Cache delle parole scaricate dall'API
        useAPI: true, // Flag per attivare/disattivare l'uso dell'API
        
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
            this.fetchWordsFromAPI(); // Carica le parole dall'API all'inizializzazione
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
            this.score = 0; // Parole al minuto (WPM) per il display
            this.wordsTyped = 0;
            this.correctWords = 0;
            this.incorrectWords = 0;
            this.correctChars = 0;
            this.totalChars = 0;
            this.typedChars = 0;
            this.currentWord = "";
            this.usedWords.clear(); // Resetta le parole usate per una nuova partita

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
            let word;
            
            if (this.useAPI && this.apiWords.length > 0) {
                // Prova a ottenere una parola dalla cache dell'API che non è stata usata
                let attempts = 0;
                do {
                    word = this.apiWords[Math.floor(Math.random() * this.apiWords.length)];
                    attempts++;
                } while (this.usedWords.has(word.toLowerCase()) && attempts < 10);
                
                // Se abbiamo provato molte volte, ricadi sulla lista locale
                if (attempts >= 10) {
                    word = this.getWordFromFallback(currentDifficulty);
                }
            } else {
                word = this.getWordFromFallback(currentDifficulty);
            }
            
            this.currentWord = word.toLowerCase();
            this.usedWords.add(this.currentWord);
            this.wordDisplay.text(this.currentWord);
            this.typingInput.val('');
            this.typingInput.removeClass('correct wrong');
            this.inputFeedback.text('');
        },
        
        getWordFromFallback: function(difficulty) {
            const wordList = fallbackWords[difficulty];
            let word;
            let attempts = 0;
            
            do {
                word = wordList[Math.floor(Math.random() * wordList.length)];
                attempts++;
            } while (this.usedWords.has(word.toLowerCase()) && attempts < 10);
            
            return word;
        },
        
        fetchWordsFromAPI: async function() {
            try {
                // Tenta di scaricare parole italiane dall'API
                const response = await fetch('https://raw.githubusercontent.com/napolux/parole-italiane/master/parole-italiane.txt');
                if (response.ok) {
                    const text = await response.text();
                    const words = text.split('\n').filter(w => w.trim().length > 0);
                    // Filtra per lunghezza ragionevole (3-15 caratteri) per il gioco di dattilografia
                    this.apiWords = words.filter(w => w.length >= 3 && w.length <= 15 && /^[a-zàèéìòù]+$/i.test(w.trim())).map(w => w.toLowerCase().trim());
                    console.log('Parole italiane dall\'API caricate:', this.apiWords.length);
                    if (this.apiWords.length > 0) {
                        this.useAPI = true;
                        return;
                    }
                }
            } catch (error) {
                console.warn('Caricamento API fallito, uso parole di fallback:', error);
            }
            // Se l'API fallisce, usa il fallback locale
            this.useAPI = false;
            // Combina tutte le parole di fallback in una lista per varietà
            this.apiWords = [...fallbackWords.easy, ...fallbackWords.medium, ...fallbackWords.hard];
            console.log('Uso parole di fallback locale:', this.apiWords.length);
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
$(document).ready(function() {
    window.Game = {
        words: {
            all: [
                "Italia", "Lavagna", "Pizza", "Lasagne", "Spiedino", "Ananas", "Gnocchi", 
                "Gorgonzola", "Broccoli", "Mango", "Biscotti", "Giornale", "Carabina", 
                "Affettati", "Lungimirante", "Affaticato", "Effervescente", "Ambulante", 
                "Ambulanza", "Ostetricia", "Computer", "Tastiera", "Monitor", "Mouse"
            ],
            cibo: ["Pizza", "Lasagne", "Spiedino", "Ananas", "Gnocchi", "Gorgonzola", "Broccoli", "Mango", "Biscotti", "Pasta", "Risotto", "Gelato", "Cioccolato", "Panettone", "Tiramisu", "Cappuccino", "Espresso"],
            nazioni: ["Italia", "Francia", "Spagna", "Germania", "Inghilterra", "Portogallo", "Grecia", "Olanda", "Belgio", "Svizzera", "Austria", "Polonia"],
            animali: ["Cane", "Gatto", "Leone", "Tigre", "Elefante", "Giraffa", "Scimmia", "Orso", "Lupo", "Volpe", "Cavallo", "Mucca", "Maiale", "Pecora"],
            sport: ["Calcio", "Basket", "Tennis", "Nuoto", "Ciclismo", "Atletica", "Pallavolo", "Rugby", "Boxe", "Judo", "Karate", "Sci"],
            tecnologia: ["Computer", "Tastiera", "Monitor", "Mouse", "Smartphone", "Tablet", "Laptop", "Software", "Hardware", "Internet", "Browser", "Email"]
        },
        MAX_TENTATIVI: 6,
        tentativiRimasti: 6,
        parolaSegreta: "",
        parolaMostrata: "",
        lettereUsate: new Set(),
        currentCategory: "all",
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        
        // UI Elements
        _txtParola: null,
        _txtLettera: null,
        _btnInvia: null,
        _imgImpiccato: null,
        _message: null,
        _tentativi: null,
        _lettereUsate: null,
        _btnReset: null,
        _categorySelect: null,
        _hint: null,
        _progressFill: null,
        _gamesPlayed: null,
        _gamesWon: null,
        _gamesLost: null,
        _gameOverOverlay: null,
        _gameOverTitle: null,
        _gameOverMessage: null,
        _keyboardButtons: null,
        _howToPlayModal: null, // Reference for the modal

        init: function() {
            this.cacheElements();
            this.loadStats();
            this.setupEventListeners();
            this.resetGame(); // Initialize game state and UI
        },

        cacheElements: function() {
            this._txtParola = document.getElementById("txtParola");
            this._txtLettera = document.getElementById("txtLettera");
            this._btnInvia = document.getElementById("btnInvia");
            this._imgImpiccato = document.getElementById("imgImpiccato");
            this._message = document.getElementById("message");
            this._tentativi = document.getElementById("tentativi");
            this._lettereUsate = document.getElementById("lettereUsate");
            this._btnReset = document.getElementById("btnReset");
            this._categorySelect = document.getElementById("category-select");
            this._hint = document.getElementById("hint");
            this._progressFill = document.getElementById("progress-fill");
            this._gamesPlayed = document.getElementById("games-played");
            this._gamesWon = document.getElementById("games-won");
            this._gamesLost = document.getElementById("games-lost");
            this._gameOverOverlay = document.getElementById("game-over-overlay");
            this._gameOverTitle = document.getElementById("game-over-title");
            this._gameOverMessage = document.getElementById("game-over-message");
            this._keyboardButtons = document.querySelectorAll(".key-btn");
            this._howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));
        },

        setupEventListeners: function() {
            this._categorySelect.addEventListener("change", () => {
                this.currentCategory = this._categorySelect.value;
                this.resetGame();
            });

            this._txtLettera.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    this.elabora();
                }
            });

            this._txtLettera.addEventListener("input", (event) => this.converti(event));

            this._btnInvia.addEventListener("click", () => this.elabora());
            this._btnReset.addEventListener("click", () => this.resetGame());
            document.getElementById('how-to-play-btn')?.addEventListener('click', () => this.showHowToPlay());

            this._keyboardButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    if (!btn.disabled) {
                        this._txtLettera.value = btn.dataset.letter;
                        this._txtLettera.focus();
                        this.elabora();
                    }
                });
            });
        },

        initGame: function() { // Renamed from init to avoid conflict with global init
            this.tentativiRimasti = this.MAX_TENTATIVI;
            this.parolaSegreta = "";
            this.parolaMostrata = "";
            this.lettereUsate.clear();
            this.currentCategory = this._categorySelect.value || "all";
            
            this.aggiornaParola();
            this.aggiornaTentativi();
            this.aggiornaImmagine();
            this.aggiornaLettereUsate();
            this.aggiornaTastiera();
            this.aggiornaProgressBar();
            this._message.textContent = "";
            this._gameOverOverlay.classList.add("hidden");
            this._txtLettera.disabled = false;
            this._btnInvia.disabled = false;
            this._txtLettera.value = "";
            this._txtLettera.focus();
            this._hint.classList.remove("show");
            this._hint.textContent = "";
            document.getElementById("txtParola").classList.remove("revealed");
            
            this.selectWord();

            // Show hint after a delay if word is selected and game is ready
            setTimeout(() => {
                if (this.tentativiRimasti <= 3 && this.tentativiRimasti > 0 && this.parolaSegreta) {
                    this.mostraSuggerimento();
                }
            }, 2000);
        },

        selectWord: function() {
            const categoriaParole = this.words[this.currentCategory];
            const pos = this.random(0, categoriaParole.length);
            this.parolaSegreta = categoriaParole[pos].toUpperCase();
            this.parolaMostrata = "*".repeat(this.parolaSegreta.length);
        },

        mostraSuggerimento: function() {
            const suggerimenti = {
                cibo: "💡 Suggerimento: È qualcosa che si mangia!",
                nazioni: "💡 Suggerimento: È un paese!",
                animali: "💡 Suggerimento: È un animale!",
                sport: "💡 Suggerimento: È uno sport!",
                tecnologia: "💡 Suggerimento: È qualcosa di tecnologico!",
                all: "💡 Suggerimento: Pensa bene alle lettere più comuni!"
            };
            
            this._hint.textContent = suggerimenti[this.currentCategory] || suggerimenti.all;
            this._hint.classList.add("show");
        },

        aggiornaParola: function() {
            this._txtParola.textContent = this.parolaMostrata;
        },

        aggiornaTentativi: function() {
            this._tentativi.textContent = this.tentativiRimasti;
        },

        aggiornaProgressBar: function() {
            const percentuale = (this.tentativiRimasti / this.MAX_TENTATIVI) * 100;
            this._progressFill.style.width = percentuale + "%";
        },

        aggiornaImmagine: function() {
            const immagini = [
                "img/Vuoto.png",
                "img/Fig1.png",
                "img/Fig2.png",
                "img/Fig3.png",
                "img/Fig4.png",
                "img/Fig5.png"
            ];
            const indice = this.MAX_TENTATIVI - this.tentativiRimasti;
            this._imgImpiccato.src = immagini[Math.min(indice, immagini.length - 1)];
            
            // Shake animation
            if (indice > 0) {
                document.getElementById("hangman-image").classList.add("shake");
                setTimeout(() => document.getElementById("hangman-image").classList.remove("shake"), 500);
            }
        },

        aggiornaLettereUsate: function() {
            const lettereArray = Array.from(this.lettereUsate).sort();
            this._lettereUsate.textContent = lettereArray.length > 0 ? lettereArray.join(", ") : "nessuna";
        },

        aggiornaTastiera: function() {
            this._keyboardButtons.forEach(btn => {
                const lettera = btn.dataset.letter;
                btn.disabled = false;
                btn.classList.remove("used", "correct", "wrong");
                
                if (this.lettereUsate.has(lettera)) {
                    btn.disabled = true;
                    if (this.parolaSegreta.includes(lettera)) {
                        btn.classList.add("used", "correct");
                    } else {
                        btn.classList.add("used", "wrong");
                    }
                }
            });
        },

        elabora: function() {
            const lettera = this._txtLettera.value.toUpperCase().trim();
            
            // Validazione
            if (!lettera) {
                this.mostraMessaggio("Inserisci una lettera!", "error");
                return;
            }
            
            if (lettera.length !== 1 || !/[A-Z]/.test(lettera)) {
                this.mostraMessaggio("Inserisci una sola lettera valida!", "error");
                this._txtLettera.value = "";
                return;
            }
            
            // Controlla se la lettera è già stata usata
            if (this.lettereUsate.has(lettera)) {
                this.mostraMessaggio("Hai già provato questa lettera!", "error");
                this._txtLettera.value = "";
                return;
            }
            
            // Aggiungi la lettera alle lettere usate
            this.lettereUsate.add(lettera);
            this.aggiornaLettereUsate();
            this.aggiornaTastiera();
            
            // Controlla se la lettera è nella parola segreta
            if (this.parolaSegreta.includes(lettera)) {
                // La lettera è corretta: aggiorna la parola mostrata
                let nuovaParolaMostrata = "";
                let trovata = false;
                for (let i = 0; i < this.parolaSegreta.length; i++) {
                    if (this.parolaSegreta[i] === lettera) {
                        nuovaParolaMostrata += lettera;
                        trovata = true;
                    } else {
                        nuovaParolaMostrata += this.parolaMostrata[i];
                    }
                }
                this.parolaMostrata = nuovaParolaMostrata;
                this.aggiornaParola();
                
                if (trovata) {
                    this._txtParola.classList.add("revealed");
                    setTimeout(() => this._txtParola.classList.remove("revealed"), 500);
                }
                
                this.mostraMessaggio(`✓ Ottimo! La lettera "${lettera}" è presente!`, "success");
                
                // Controlla se hai vinto
                if (!this.parolaMostrata.includes("*")) {
                    this.fineGioco(true);
                    return;
                }
            } else {
                // La lettera è sbagliata: diminuisci i tentativi
                this.tentativiRimasti--;
                this.aggiornaTentativi();
                this.aggiornaImmagine();
                this.aggiornaProgressBar();
                
                this.mostraMessaggio(`✗ La lettera "${lettera}" non è presente!`, "error");
                
                // Controlla se hai perso
                if (this.tentativiRimasti === 0) {
                    this.fineGioco(false);
                    return;
                }
            }
            
            // Pulisci l'input e rimetti il focus
            this._txtLettera.value = "";
            this._txtLettera.focus();
        },

        mostraMessaggio: function(testo, tipo) {
            this._message.textContent = testo;
            this._message.className = tipo;
            
            // Rimuovi il messaggio dopo 3 secondi
            setTimeout(() => {
                this._message.textContent = "";
                this._message.className = "";
            }, 3000);
        },

        fineGioco: function(vittoria) {
            this.gamesPlayed++;
            this._txtLettera.disabled = true;
            this._btnInvia.disabled = true;
            
            // Disabilita tutte le lettere della tastiera
            this._keyboardButtons.forEach(btn => {
                btn.disabled = true;
            });
            
            if (vittoria) {
                this.gamesWon++;
                this._gameOverTitle.textContent = "🎉 Complimenti!";
                this._gameOverMessage.textContent = `Hai indovinato la parola: "${this.parolaSegreta}"`;
                this._txtParola.textContent = this.parolaSegreta;
                this._txtParola.classList.add("revealed");
            } else {
                this.gamesLost++;
                this._gameOverTitle.textContent = "💀 Hai Perso!";
                this._gameOverMessage.textContent = `La parola era: "${this.parolaSegreta}"`;
                this._txtParola.textContent = this.parolaSegreta;
                this._txtParola.classList.add("revealed");
                this.aggiornaImmagine();
            }
            
            this.updateStats();
            this.saveStats();
            this._gameOverOverlay.classList.remove("hidden");
        },

        resetGame: function() {
            this.initGame();
        },

        updateStats: function() {
            this._gamesPlayed.textContent = this.gamesPlayed;
            this._gamesWon.textContent = this.gamesWon;
            this._gamesLost.textContent = this.gamesLost;
        },

        saveStats: function() {
            localStorage.setItem("hangman-games-played", this.gamesPlayed.toString());
            localStorage.setItem("hangman-games-won", this.gamesWon.toString());
            localStorage.setItem("hangman-games-lost", this.gamesLost.toString());
        },

        loadStats: function() {
            this.gamesPlayed = parseInt(localStorage.getItem("hangman-games-played")) || 0;
            this.gamesWon = parseInt(localStorage.getItem("hangman-games-won")) || 0;
            this.gamesLost = parseInt(localStorage.getItem("hangman-games-lost")) || 0;
            this.updateStats();
        },

        random: function(min, max) {
            return Math.floor((max - min) * Math.random()) + min;
        },

        converti: function(event) {
            event.target.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        }
    };

    window.Game.init();
});

// Global functions for HTML onclick handlers
function elabora() {
    if (window.Game) {
        window.Game.elabora();
    }
}

function resetGame() {
    if (window.Game) {
        window.Game.resetGame();
    }
}

function showHowToPlay() {
    if (window.Game && window.Game._howToPlayModal) {
        window.Game._howToPlayModal.show();
    } else {
        alert("Come si gioca: Indovina la parola! Inserisci una lettera alla volta. Hai 6 tentativi sbagliati.");
    }
}
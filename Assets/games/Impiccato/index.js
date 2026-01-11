"use strict";

const parole = {
    all: [
        "Italia", "Lavagna", "Pizza", "Lasagne", "Spiedino", "Ananas", "Gnocchi", 
        "Gorgonzola", "Broccoli", "Mango", "Biscotti", "Giornale", "Carabina", 
        "Affettati", "Lungimirante", "Affaticato", "Effervescente", "Ambulante", 
        "Ambulanza", "Ostetricia", "Computer", "Tastiera", "Monitor", "Mouse"
    ],
    cibo: [
        "Pizza", "Lasagne", "Spiedino", "Ananas", "Gnocchi", "Gorgonzola", 
        "Broccoli", "Mango", "Biscotti", "Pasta", "Risotto", "Gelato", 
        "Cioccolato", "Panettone", "Tiramisu", "Cappuccino", "Espresso"
    ],
    nazioni: [
        "Italia", "Francia", "Spagna", "Germania", "Inghilterra", "Portogallo",
        "Grecia", "Olanda", "Belgio", "Svizzera", "Austria", "Polonia"
    ],
    animali: [
        "Cane", "Gatto", "Leone", "Tigre", "Elefante", "Giraffa", "Scimmia",
        "Orso", "Lupo", "Volpe", "Cavallo", "Mucca", "Maiale", "Pecora"
    ],
    sport: [
        "Calcio", "Basket", "Tennis", "Nuoto", "Ciclismo", "Atletica",
        "Pallavolo", "Rugby", "Boxe", "Judo", "Karate", "Sci"
    ],
    tecnologia: [
        "Computer", "Tastiera", "Monitor", "Mouse", "Smartphone", "Tablet",
        "Laptop", "Software", "Hardware", "Internet", "Browser", "Email"
    ]
};

const MAX_TENTATIVI = 6;
let tentativiRimasti = MAX_TENTATIVI;
let parolaSegreta = "";
let parolaMostrata = "";
let lettereUsate = new Set();
let currentCategory = "all";
let gamesPlayed = 0;
let gamesWon = 0;
let gamesLost = 0;

const _txtParola = document.getElementById("txtParola");
const _txtLettera = document.getElementById("txtLettera");
const _btnInvia = document.getElementById("btnInvia");
const _imgImpiccato = document.getElementById("imgImpiccato");
const _message = document.getElementById("message");
const _tentativi = document.getElementById("tentativi");
const _lettereUsate = document.getElementById("lettereUsate");
const _btnReset = document.getElementById("btnReset");
const _categorySelect = document.getElementById("category-select");
const _hint = document.getElementById("hint");
const _progressFill = document.getElementById("progress-fill");
const _gamesPlayed = document.getElementById("games-played");
const _gamesWon = document.getElementById("games-won");
const _gamesLost = document.getElementById("games-lost");
const _gameOverOverlay = document.getElementById("game-over-overlay");
const _gameOverTitle = document.getElementById("game-over-title");
const _gameOverMessage = document.getElementById("game-over-message");

// Carica statistiche
loadStats();

// Inizializza il gioco
init();

// Event listeners
_categorySelect.addEventListener("change", function() {
    currentCategory = this.value;
    resetGame();
});

_txtLettera.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        elabora();
    }
});

_txtLettera.addEventListener("input", converti);

// Tastiera virtuale
document.querySelectorAll(".key-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        if (!this.disabled) {
            _txtLettera.value = this.dataset.letter;
            _txtLettera.focus();
            elabora();
        }
    });
});

function init() {
    // Seleziona una parola casuale dalla categoria corrente
    const categoriaParole = parole[currentCategory];
    const pos = random(0, categoriaParole.length);
    parolaSegreta = categoriaParole[pos].toUpperCase();
    
    // Inizializza la parola mostrata con asterischi
    parolaMostrata = "*".repeat(parolaSegreta.length);
    
    // Reset variabili
    tentativiRimasti = MAX_TENTATIVI;
    lettereUsate.clear();
    
    // Aggiorna l'interfaccia
    aggiornaParola();
    aggiornaTentativi();
    aggiornaImmagine();
    aggiornaLettereUsate();
    aggiornaTastiera();
    aggiornaProgressBar();
    _message.textContent = "";
    _gameOverOverlay.classList.add("hidden");
    _txtLettera.disabled = false;
    _btnInvia.disabled = false;
    _txtLettera.value = "";
    _txtLettera.focus();
    _hint.classList.remove("show");
    _hint.textContent = "";
    _txtParola.classList.remove("revealed");
    
    // Mostra suggerimento dopo alcuni tentativi sbagliati
    setTimeout(() => {
        if (tentativiRimasti <= 3 && tentativiRimasti > 0) {
            mostraSuggerimento();
        }
    }, 2000);
}

function mostraSuggerimento() {
    const suggerimenti = {
        cibo: "💡 Suggerimento: È qualcosa che si mangia!",
        nazioni: "💡 Suggerimento: È un paese!",
        animali: "💡 Suggerimento: È un animale!",
        sport: "💡 Suggerimento: È uno sport!",
        tecnologia: "💡 Suggerimento: È qualcosa di tecnologico!",
        all: "💡 Suggerimento: Pensa bene alle lettere più comuni!"
    };
    
    _hint.textContent = suggerimenti[currentCategory] || suggerimenti.all;
    _hint.classList.add("show");
}

function aggiornaParola() {
    _txtParola.textContent = parolaMostrata;
}

function aggiornaTentativi() {
    _tentativi.textContent = tentativiRimasti;
}

function aggiornaProgressBar() {
    const percentuale = (tentativiRimasti / MAX_TENTATIVI) * 100;
    _progressFill.style.width = percentuale + "%";
}

function aggiornaImmagine() {
    const immagini = [
        "img/Vuoto.png",
        "img/Fig1.png",
        "img/Fig2.png",
        "img/Fig3.png",
        "img/Fig4.png",
        "img/Fig5.png"
    ];
    const indice = MAX_TENTATIVI - tentativiRimasti;
    _imgImpiccato.src = immagini[Math.min(indice, immagini.length - 1)];
    
    if (indice > 0) {
        document.getElementById("hangman-image").classList.add("shake");
        setTimeout(() => {
            document.getElementById("hangman-image").classList.remove("shake");
        }, 500);
    }
}

function aggiornaLettereUsate() {
    const lettereArray = Array.from(lettereUsate).sort();
    _lettereUsate.textContent = lettereArray.length > 0 ? lettereArray.join(", ") : "nessuna";
}

function aggiornaTastiera() {
    document.querySelectorAll(".key-btn").forEach(btn => {
        const lettera = btn.dataset.letter;
        btn.disabled = false;
        btn.classList.remove("used", "correct", "wrong");
        
        if (lettereUsate.has(lettera)) {
            btn.disabled = true;
            if (parolaSegreta.includes(lettera)) {
                btn.classList.add("used", "correct");
            } else {
                btn.classList.add("used", "wrong");
            }
        }
    });
}

function elabora() {
    const lettera = _txtLettera.value.toUpperCase().trim();
    
    // Validazione
    if (!lettera) {
        mostraMessaggio("Inserisci una lettera!", "error");
        return;
    }
    
    if (lettera.length !== 1 || !/[A-Z]/.test(lettera)) {
        mostraMessaggio("Inserisci una sola lettera valida!", "error");
        _txtLettera.value = "";
        return;
    }
    
    // Controlla se la lettera è già stata usata
    if (lettereUsate.has(lettera)) {
        mostraMessaggio("Hai già provato questa lettera!", "error");
        _txtLettera.value = "";
        return;
    }
    
    // Aggiungi la lettera alle lettere usate
    lettereUsate.add(lettera);
    aggiornaLettereUsate();
    aggiornaTastiera();
    
    // Controlla se la lettera è nella parola segreta
    if (parolaSegreta.includes(lettera)) {
        // La lettera è corretta: aggiorna la parola mostrata
        let nuovaParolaMostrata = "";
        let trovata = false;
        for (let i = 0; i < parolaSegreta.length; i++) {
            if (parolaSegreta[i] === lettera) {
                nuovaParolaMostrata += lettera;
                trovata = true;
            } else {
                nuovaParolaMostrata += parolaMostrata[i];
            }
        }
        parolaMostrata = nuovaParolaMostrata;
        aggiornaParola();
        
        if (trovata) {
            _txtParola.classList.add("revealed");
            setTimeout(() => _txtParola.classList.remove("revealed"), 500);
        }
        
        mostraMessaggio(`✓ Ottimo! La lettera "${lettera}" è presente!`, "success");
        
        // Controlla se hai vinto
        if (!parolaMostrata.includes("*")) {
            fineGioco(true);
            return;
        }
    } else {
        // La lettera è sbagliata: diminuisci i tentativi
        tentativiRimasti--;
        aggiornaTentativi();
        aggiornaImmagine();
        aggiornaProgressBar();
        
        mostraMessaggio(`✗ La lettera "${lettera}" non è presente!`, "error");
        
        // Controlla se hai perso
        if (tentativiRimasti === 0) {
            fineGioco(false);
            return;
        }
    }
    
    // Pulisci l'input e rimetti il focus
    _txtLettera.value = "";
    _txtLettera.focus();
}

function mostraMessaggio(testo, tipo) {
    _message.textContent = testo;
    _message.className = tipo;
    
    // Rimuovi il messaggio dopo 3 secondi
    setTimeout(() => {
        _message.textContent = "";
        _message.className = "";
    }, 3000);
}

function fineGioco(vittoria) {
    gamesPlayed++;
    _txtLettera.disabled = true;
    _btnInvia.disabled = true;
    
    // Disabilita tutte le lettere della tastiera
    document.querySelectorAll(".key-btn").forEach(btn => {
        btn.disabled = true;
    });
    
    if (vittoria) {
        gamesWon++;
        _gameOverTitle.textContent = "🎉 Complimenti!";
        _gameOverMessage.textContent = `Hai indovinato la parola: "${parolaSegreta}"`;
        _txtParola.textContent = parolaSegreta;
        _txtParola.classList.add("revealed");
    } else {
        gamesLost++;
        _gameOverTitle.textContent = "💀 Hai Perso!";
        _gameOverMessage.textContent = `La parola era: "${parolaSegreta}"`;
        _txtParola.textContent = parolaSegreta;
        _txtParola.classList.add("revealed");
        aggiornaImmagine();
    }
    
    updateStats();
    saveStats();
    _gameOverOverlay.classList.remove("hidden");
}

function resetGame() {
    init();
}

function updateStats() {
    _gamesPlayed.textContent = gamesPlayed;
    _gamesWon.textContent = gamesWon;
    _gamesLost.textContent = gamesLost;
}

function saveStats() {
    localStorage.setItem("hangman-games-played", gamesPlayed.toString());
    localStorage.setItem("hangman-games-won", gamesWon.toString());
    localStorage.setItem("hangman-games-lost", gamesLost.toString());
}

function loadStats() {
    gamesPlayed = parseInt(localStorage.getItem("hangman-games-played")) || 0;
    gamesWon = parseInt(localStorage.getItem("hangman-games-won")) || 0;
    gamesLost = parseInt(localStorage.getItem("hangman-games-lost")) || 0;
    updateStats();
}

function random(min, max) {
    return Math.floor((max - min) * Math.random()) + min;
}

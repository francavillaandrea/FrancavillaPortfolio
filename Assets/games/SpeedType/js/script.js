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

let score = 0;
let time = 60;
let timeInterval = null;
let currentWord = "";
let currentDifficulty = "easy";
let gameStarted = false;
let totalChars = 0;
let correctChars = 0;
let wordsTyped = 0;
let startTime = null;
let bestScore = 0;

// Carica il record
bestScore = parseInt(localStorage.getItem("speedtype-best")) || 0;
$("#best-score").text(bestScore);

// Event listeners
$("#startBtn").on("click", startGame);
$("#resetBtn").on("click", resetGame);

$('input[name="difficulty"]').on("change", function() {
    currentDifficulty = $(this).val();
    if (!gameStarted) {
        resetGame();
    }
});

$("#typingInput").on("input", function() {
    if (!gameStarted) return;
    
    const val = $(this).val().trim();
    const wordDisplay = $("#wordDisplay");
    
    if (!val) {
        $(this).removeClass("correct wrong");
        $("#input-feedback").text("");
        return;
    }
    
    totalChars++;
    
    // Controlla se la parola è corretta
    if (val === currentWord) {
        // Parola corretta
        correctChars += currentWord.length;
        wordsTyped++;
        score++;
        
        $(this).addClass("correct").removeClass("wrong");
        wordDisplay.addClass("correct").removeClass("wrong");
        $("#input-feedback").text("✓ Corretto!").css("color", "var(--bs-success)");
        
        // Aggiorna statistiche
        updateStats();
        
        // Genera nuova parola
        setTimeout(() => {
            $(this).val("");
            $(this).removeClass("correct wrong");
            wordDisplay.removeClass("correct wrong");
            $("#input-feedback").text("");
            generateNewWord();
            
            // Aggiungi tempo bonus
            time = Math.min(time + 2, 60);
            $("#time").text(time);
        }, 300);
        
    } else if (currentWord.startsWith(val)) {
        // Sta digitando correttamente
        $(this).removeClass("wrong").removeClass("correct");
        wordDisplay.removeClass("wrong");
        $("#input-feedback").text("");
    } else {
        // Errore
        $(this).addClass("wrong").removeClass("correct");
        wordDisplay.addClass("wrong");
        $("#input-feedback").text("✗ Errore!").css("color", "var(--bs-danger)");
    }
    
    updateAccuracy();
});

$("#typingInput").on("keypress", function(e) {
    if (e.key === "Enter" && gameStarted) {
        e.preventDefault();
        const val = $(this).val().trim();
        if (val === currentWord) {
            $(this).trigger("input");
        }
    }
});

function startGame() {
    gameStarted = true;
    score = 0;
    time = 60;
    totalChars = 0;
    correctChars = 0;
    wordsTyped = 0;
    startTime = Date.now();
    
    $("#startBtn").prop("disabled", true).hide();
    $("#resetBtn").show();
    $("#typingInput").prop("disabled", false).focus();
    $("#results").hide();
    
    generateNewWord();
    updateStats();
    
    // Timer
    timeInterval = setInterval(() => {
        time--;
        $("#time").text(time);
        
        // Aggiorna colore del tempo
        const timeBox = $("#time").closest(".stat-box");
        if (time <= 10) {
            timeBox.css("border-color", "var(--bs-danger)");
        } else if (time <= 20) {
            timeBox.css("border-color", "var(--bs-warning)");
        } else {
            timeBox.css("border-color", "var(--bs-border-color)");
        }
        
        if (time <= 0) {
            endGame();
        }
    }, 1000);
}

function generateNewWord() {
    const wordList = words[currentDifficulty];
    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    $("#wordDisplay").text(currentWord);
    
    // Mostra prossima parola (opzionale)
    const nextWord = wordList[Math.floor(Math.random() * wordList.length)];
    if (nextWord !== currentWord) {
        $("#nextWord").text(`Prossima: ${nextWord}`);
    }
}

function updateStats() {
    $("#score").text(score);
    
    // Calcola WPM (Words Per Minute)
    if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000 / 60; // minuti
        const wpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
        $("#score").text(wpm);
    }
}

function updateAccuracy() {
    if (totalChars > 0) {
        const accuracy = Math.round((correctChars / totalChars) * 100);
        $("#accuracy").text(accuracy);
        
        // Aggiorna colore in base alla precisione
        const accuracyBox = $("#accuracy").closest(".stat-box");
        if (accuracy >= 90) {
            accuracyBox.css("border-color", "var(--bs-success)");
        } else if (accuracy >= 70) {
            accuracyBox.css("border-color", "var(--bs-warning)");
        } else {
            accuracyBox.css("border-color", "var(--bs-danger)");
        }
    }
}

function endGame() {
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
    
    gameStarted = false;
    $("#typingInput").prop("disabled", true);
    $("#startBtn").prop("disabled", false).show();
    $("#resetBtn").hide();
    
    // Calcola statistiche finali
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minuti
    const finalWPM = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
    const finalAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    
    // Aggiorna risultati
    $("#final-wpm").text(finalWPM);
    $("#final-words").text(wordsTyped);
    $("#final-accuracy").text(finalAccuracy + "%");
    $("#final-chars").text(totalChars);
    
    // Aggiorna record
    if (finalWPM > bestScore) {
        bestScore = finalWPM;
        $("#best-score").text(bestScore);
        localStorage.setItem("speedtype-best", bestScore.toString());
    }
    
    // Mostra risultati
    $("#results").show();
    $("#wordDisplay").text("Tempo Scaduto!");
    
    // Reset colori
    $(".stat-box").css("border-color", "var(--bs-border-color)");
}

function resetGame() {
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
    
    gameStarted = false;
    score = 0;
    time = 60;
    totalChars = 0;
    correctChars = 0;
    wordsTyped = 0;
    
    $("#startBtn").prop("disabled", false).show();
    $("#resetBtn").hide();
    $("#typingInput").prop("disabled", true).val("").removeClass("correct wrong");
    $("#wordDisplay").text("Clicca 'Inizia' per iniziare!").removeClass("correct wrong");
    $("#nextWord").text("");
    $("#input-feedback").text("");
    $("#results").hide();
    
    $("#time").text(time);
    $("#score").text(0);
    $("#accuracy").text(100);
    
    // Reset colori
    $(".stat-box").css("border-color", "var(--bs-border-color)");
}

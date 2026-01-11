$(document).ready(function () {
    let sequenza = [];
    let sequenzaUtente = [];
    let colori = ["green", "red", "yellow", "blue"];
    let livello = 0;
    let puoiCliccare = false;
    let gameStarted = false;
    let bestLevel = 0;
    let score = 0;
    
    // Carica il record
    bestLevel = parseInt(localStorage.getItem("colorsequence-best")) || 0;
    $("#best-level").text(bestLevel);
    
    $('#btnStart').on("click", function () {
        startGame();
    });
    
    $('#btnReset').on("click", function () {
        resetGame();
    });
    
    // Event listeners per i colori
    $('.color-btn').on("click", function () {
        if (!puoiCliccare || !gameStarted) return;
        
        const colore = $(this).data("color");
        handleColorClick(colore, $(this));
    });
    
    function startGame() {
        gameStarted = true;
        sequenza = [];
        sequenzaUtente = [];
        livello = 0;
        score = 0;
        
        $('#level').text(livello);
        $('#score').text(score);
        $('#txtStatus').text("Preparati...").removeClass("observing playing error");
        $('#btnStart').prop("disabled", true).hide();
        $('#btnReset').show();
        $('#game-over').addClass("hidden");
        
        // Disabilita i pulsanti durante la sequenza
        $('.color-btn').addClass("disabled");
        
        setTimeout(() => {
            nextLevel();
        }, 1000);
    }
    
    function nextLevel() {
        livello++;
        $('#level').text(livello);
        sequenzaUtente = [];
        
        // Aggiungi un nuovo colore alla sequenza
        sequenza.push(colori[Math.floor(Math.random() * colori.length)]);
        
        $('#txtStatus').text("Osserva la sequenza...").addClass("observing").removeClass("playing error");
        
        // Disabilita i click durante la riproduzione
        puoiCliccare = false;
        $('.color-btn').addClass("disabled");
        
        // Riproduci la sequenza completa
        setTimeout(() => {
            playSequence();
        }, 500);
    }
    
    function playSequence() {
        let i = 0;
        
        const playNext = () => {
            if (i < sequenza.length) {
                const colore = sequenza[i];
                espandi(colore);
                i++;
                
                setTimeout(playNext, 600);
            } else {
                // Sequenza completata, ora l'utente può cliccare
                puoiCliccare = true;
                $('.color-btn').removeClass("disabled");
                $('#txtStatus').text("Ripeti la sequenza!").removeClass("observing").addClass("playing");
            }
        };
        
        playNext();
    }
    
    function espandi(colore) {
        const $btn = $('#' + colore);
        $btn.addClass("active");
        
        // Suono visivo (opzionale - potrebbe essere aggiunto un suono reale)
        setTimeout(() => {
            $btn.removeClass("active");
        }, 400);
    }
    
    function handleColorClick(colore, $btn) {
        if (!puoiCliccare) return;
        
        sequenzaUtente.push(colore);
        
        // Feedback visivo
        $btn.addClass("active");
        setTimeout(() => {
            $btn.removeClass("active");
        }, 200);
        
        // Controlla se la sequenza è corretta finora
        const indiceCorrente = sequenzaUtente.length - 1;
        
        if (sequenzaUtente[indiceCorrente] === sequenza[indiceCorrente]) {
            // Corretto finora
            $btn.addClass("correct");
            setTimeout(() => {
                $btn.removeClass("correct");
            }, 300);
            
            // Controlla se ha completato la sequenza
            if (sequenzaUtente.length === sequenza.length) {
                // Sequenza completata correttamente!
                score += livello * 10;
                $('#score').text(score);
                
                $('#txtStatus').text("✓ Corretto! Livello successivo...").removeClass("error").addClass("playing");
                
                // Disabilita i click
                puoiCliccare = false;
                $('.color-btn').addClass("disabled");
                
                // Aggiorna record se necessario
                if (livello > bestLevel) {
                    bestLevel = livello;
                    $('#best-level').text(bestLevel);
                    localStorage.setItem("colorsequence-best", bestLevel.toString());
                }
                
                // Passa al livello successivo
                setTimeout(() => {
                    nextLevel();
                }, 1500);
            }
        } else {
            // Errore!
            $btn.addClass("wrong");
            setTimeout(() => {
                $btn.removeClass("wrong");
            }, 500);
            
            endGame();
        }
    }
    
    function endGame() {
        gameStarted = false;
        puoiCliccare = false;
        $('.color-btn').addClass("disabled");
        
        $('#txtStatus').text("Errore! Game Over!").removeClass("observing playing").addClass("error");
        
        // Mostra risultati
        $('#final-level').text(livello - 1);
        $('#final-score').text(score);
        $('#game-over-title').text("💥 Game Over!");
        $('#game-over-message').text(`Hai raggiunto il livello ${livello - 1} con un punteggio di ${score}!`);
        
        $('#game-over').removeClass("hidden");
        $('#btnStart').prop("disabled", false).show();
        $('#btnReset').hide();
    }
    
    function resetGame() {
        if (gameStarted) {
            gameStarted = false;
            puoiCliccare = false;
            $('.color-btn').addClass("disabled");
        }
        
        sequenza = [];
        sequenzaUtente = [];
        livello = 0;
        score = 0;
        
        $('#level').text(livello);
        $('#score').text(score);
        $('#txtStatus').text("Premi 'Start' per iniziare").removeClass("observing playing error");
        $('#btnStart').prop("disabled", false).show();
        $('#btnReset').hide();
        $('#game-over').addClass("hidden");
        
        $('.color-btn').removeClass("active correct wrong disabled");
    }
});

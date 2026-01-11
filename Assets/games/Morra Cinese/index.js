"use strict";

const choices = ["sasso", "mano", "forbice"];
let userChoice = "";
let scoreUtente = 0;
let scoreComputer = 0;
let scorePareggi = 0;

const _imgUtente = document.getElementById("imgUtente");
const _imgComputer = document.getElementById("imgComputer");
const _small = document.getElementsByClassName("small");
const _btnGioca = document.getElementById("btnGioca");
const _txtRisultato = document.getElementById("txtRisultato");
const _scoreUtente = document.getElementById("score-utente");
const _scoreComputer = document.getElementById("score-computer");
const _scorePareggi = document.getElementById("score-pareggi");

// Carica i punteggi dal localStorage
loadScores();

window.onload = function () {
    // Imposta stili per la visualizzazione delle immagini
    impostaStileImmagine(_imgUtente);
    impostaStileImmagine(_imgComputer);
    for (let small of _small) {
        impostaStileImmagine(small);
    }

    // Inizializzazione immagini
    _imgComputer.style.backgroundImage = "url('img/vuoto.png')";
    _imgUtente.style.backgroundImage = "url('img/vuoto.png')";

    // Caricamento miniature
    for (let i = 0; i < _small.length; i++) {
        const choice = choices[i];
        _small[i].style.backgroundImage = `url('img/${choice}.png')`;
        _small[i].setAttribute("data-choice", choice);
        _small[i].addEventListener("click", function () {
            selectChoice(choice);
        });
    }

    // Gestione click pulsante Gioca
    _btnGioca.addEventListener("click", function () {
        if (userChoice === "") {
            showMessage("Seleziona prima una scelta!", "error");
            return;
        }

        playRound();
    });
}

function selectChoice(choice) {
    userChoice = choice;
    _imgUtente.style.backgroundImage = `url('img/${choice}.png')`;
    _imgComputer.style.backgroundImage = "url('img/vuoto.png')";
    _txtRisultato.innerHTML = "";
    _txtRisultato.className = "";
    
    // Rimuovi selezione precedente
    for (let small of _small) {
        small.classList.remove("selected");
    }
    
    // Aggiungi selezione alla scelta corrente
    const selectedSmall = Array.from(_small).find(s => s.getAttribute("data-choice") === choice);
    if (selectedSmall) {
        selectedSmall.classList.add("selected");
    }
    
    _imgUtente.classList.add("selected");
    _imgComputer.classList.remove("selected");
}

function playRound() {
    // Genera mossa computer
    const computerChoice = choices[random(0, 3)];
    
    // Animazione computer
    _imgComputer.classList.add("shake");
    setTimeout(() => {
        _imgComputer.style.backgroundImage = `url('img/${computerChoice}.png')`;
        _imgComputer.classList.remove("shake");
        
        // Determina il vincitore
        const result = determinaVincitore(userChoice, computerChoice);
        displayResult(result);
    }, 500);
}

function determinaVincitore(sceltaUtente, sceltaComputer) {
    if (sceltaUtente === sceltaComputer) {
        scorePareggi++;
        return { message: "Pareggio!", type: "draw", winner: "none" };
    }
    
    const winConditions = {
        "forbice": "mano",
        "mano": "sasso",
        "sasso": "forbice"
    };
    
    if (winConditions[sceltaUtente] === sceltaComputer) {
        scoreUtente++;
        return { message: "🎉 Hai Vinto!", type: "win", winner: "user" };
    } else {
        scoreComputer++;
        return { message: "💻 Ha Vinto il Computer!", type: "lose", winner: "computer" };
    }
}

function displayResult(result) {
    _txtRisultato.innerHTML = result.message;
    _txtRisultato.className = result.type;
    updateScores();
    saveScores();
    
    // Reset selezione per il prossimo round
    setTimeout(() => {
        userChoice = "";
        for (let small of _small) {
            small.classList.remove("selected");
        }
        _imgUtente.classList.remove("selected");
    }, 2000);
}

function updateScores() {
    _scoreUtente.textContent = scoreUtente;
    _scoreComputer.textContent = scoreComputer;
    _scorePareggi.textContent = scorePareggi;
}

function saveScores() {
    localStorage.setItem("morra-score-utente", scoreUtente.toString());
    localStorage.setItem("morra-score-computer", scoreComputer.toString());
    localStorage.setItem("morra-score-pareggi", scorePareggi.toString());
}

function loadScores() {
    scoreUtente = parseInt(localStorage.getItem("morra-score-utente")) || 0;
    scoreComputer = parseInt(localStorage.getItem("morra-score-computer")) || 0;
    scorePareggi = parseInt(localStorage.getItem("morra-score-pareggi")) || 0;
    updateScores();
}

function resetScore() {
    if (confirm("Vuoi resettare tutti i punteggi?")) {
        scoreUtente = 0;
        scoreComputer = 0;
        scorePareggi = 0;
        updateScores();
        saveScores();
        showMessage("Punteggi resettati!", "success");
    }
}

function showMessage(message, type) {
    _txtRisultato.innerHTML = message;
    _txtRisultato.className = type;
    setTimeout(() => {
        _txtRisultato.innerHTML = "";
        _txtRisultato.className = "";
    }, 2000);
}

function random(min, max) {
    return Math.floor((max - min) * Math.random()) + min;
}

function impostaStileImmagine(elemento) {
    elemento.style.backgroundRepeat = "no-repeat";
    elemento.style.backgroundPosition = "center";
    elemento.style.backgroundSize = "contain";
}

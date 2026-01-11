"use strict";

const DIM = 10;
const wrapper = document.getElementById("wrapper");
const blocksElement = document.getElementById("blocks");
const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("game-over");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverMessage = document.getElementById("game-over-message");

let bombRow = 0;
let bombCol = 0;
let blocks = 0;
let score = 0;
let gameOver = false;
let timerId = null;
let speed = 200;

init();

function init() {
    blocks = 0;
    score = 0;
    gameOver = false;
    speed = 200;
    
    wrapper.innerHTML = "";
    blocksElement.textContent = "0";
    scoreElement.textContent = "0";
    gameOverElement.classList.add("hidden");
    
    // Crea la griglia
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            const div = document.createElement("div");
            div.classList.add("cella");
            div.id = `div-${i}-${j}`;
            div.dataset.row = i;
            div.dataset.col = j;
            div.addEventListener("click", gestisciClick);
            wrapper.appendChild(div);
        }
    }
    
    // Posiziona la bomba iniziale
    generaBomba();
}

function gestisciClick() {
    if (gameOver) return;
    
    const row = parseInt(this.dataset.row);
    const col = parseInt(this.dataset.col);
    
    // Se clicco sulla bomba
    if (row === bombRow && col === bombCol && this.classList.contains("bomb")) {
        score++;
        scoreElement.textContent = score;
        
        // Rimuovi la bomba
        this.classList.remove("bomb");
        this.style.backgroundImage = "none";
        
        // Aumenta la velocità
        speed = Math.max(100, speed - 10);
        
        // Genera nuova bomba
        clearInterval(timerId);
        generaBomba();
        return;
    }
    
    // Toggle del blocco blu
    if (this.classList.contains("blocked")) {
        this.classList.remove("blocked");
        this.style.backgroundColor = "";
        blocks--;
    } else {
        this.classList.add("blocked");
        this.style.backgroundColor = "#0d6efd";
        blocks++;
    }
    
    blocksElement.textContent = blocks;
}

function generaBomba() {
    // Trova una posizione casuale non bloccata
    let attempts = 0;
    do {
        bombRow = generaNumero(0, DIM);
        bombCol = generaNumero(0, DIM);
        attempts++;
    } while (attempts < 100 && document.getElementById(`div-${bombRow}-${bombCol}`).classList.contains("blocked"));
    
    const div = document.getElementById(`div-${bombRow}-${bombCol}`);
    div.classList.add("bomb");
    div.style.backgroundImage = "url('bomba.png')";
    
    timerId = setInterval(spostaBomba, speed);
}

function spostaBomba() {
    if (gameOver) return;
    
    const div = document.getElementById(`div-${bombRow}-${bombCol}`);
    div.classList.remove("bomb");
    div.style.backgroundImage = "none";
    
    // Trova una nuova posizione valida
    const directions = [
        { row: -1, col: 0 },  // sopra
        { row: 1, col: 0 },   // sotto
        { row: 0, col: -1 },  // sinistra
        { row: 0, col: 1 }    // destra
    ];
    
    const validMoves = directions.filter(dir => {
        const newRow = bombRow + dir.row;
        const newCol = bombCol + dir.col;
        return newRow >= 0 && newRow < DIM && 
               newCol >= 0 && newCol < DIM &&
               !document.getElementById(`div-${newRow}-${newCol}`).classList.contains("blocked");
    });
    
    if (validMoves.length === 0) {
        // Bomba bloccata - game over
        endGame("La bomba è stata bloccata! Hai perso!");
        return;
    }
    
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    bombRow += randomMove.row;
    bombCol += randomMove.col;
    
    const newDiv = document.getElementById(`div-${bombRow}-${bombCol}`);
    newDiv.classList.add("bomb");
    newDiv.style.backgroundImage = "url('bomba.png')";
}

function endGame(message) {
    gameOver = true;
    if (timerId) {
        clearInterval(timerId);
    }
    
    gameOverTitle.textContent = "💣 Game Over!";
    gameOverMessage.textContent = `${message} Punteggio finale: ${score}`;
    gameOverElement.classList.remove("hidden");
    
    // Disabilita tutti i click
    const cells = wrapper.querySelectorAll(".cella");
    cells.forEach(cell => cell.removeEventListener("click", gestisciClick));
}

function resetGame() {
    if (timerId) {
        clearInterval(timerId);
    }
    init();
}

function generaNumero(min, max) {
    return Math.floor((max - min) * Math.random()) + min;
}

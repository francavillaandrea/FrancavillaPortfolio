"use strict";

const GIALLO = "on";
const GRIGIO = "off";

const wrapper = document.getElementById("wrapper");
const movesElement = document.getElementById("moves");
const sizeSelect = document.getElementById("size-select");
const gameOverElement = document.getElementById("game-over");
const winMessageElement = document.getElementById("win-message");

let dim = 4;
let grid = [];
let moves = 0;
let gameWon = false;

sizeSelect.addEventListener("change", function() {
    dim = parseInt(this.value);
    init();
});

init();

function init() {
    grid = [];
    moves = 0;
    gameWon = false;
    movesElement.textContent = "0";
    gameOverElement.classList.add("hidden");
    
    wrapper.style.gridTemplateColumns = `repeat(${dim}, 1fr)`;
    wrapper.innerHTML = "";
    
    // Inizializza la griglia con stato casuale
    for (let i = 0; i < dim; i++) {
        grid[i] = [];
        for (let j = 0; j < dim; j++) {
            const div = document.createElement("div");
            div.classList.add("pedina");
            div.classList.add(Math.random() > 0.5 ? GIALLO : GRIGIO);
            div.id = `div-${i}-${j}`;
            grid[i][j] = div.classList.contains(GIALLO);
            div.addEventListener("click", () => cambiaColore(i, j));
            wrapper.appendChild(div);
        }
    }
    
    // Mescola il puzzle con mosse casuali
    shufflePuzzle();
}

function shufflePuzzle() {
    // Esegue mosse casuali per mescolare
    for (let i = 0; i < dim * dim * 2; i++) {
        const randomRow = Math.floor(Math.random() * dim);
        const randomCol = Math.floor(Math.random() * dim);
        toggleCell(randomRow, randomCol, false);
    }
    
    // Reset mosse dopo il mescolamento
    moves = 0;
    movesElement.textContent = "0";
}

function cambiaColore(row, col) {
    if (gameWon) return;
    
    toggleCell(row, col, true);
    moves++;
    movesElement.textContent = moves;
    
    checkWin();
}

function toggleCell(row, col, animate) {
    const div = document.getElementById(`div-${row}-${col}`);
    
    if (animate) {
        div.classList.add("clicked");
        setTimeout(() => div.classList.remove("clicked"), 300);
    }
    
    // Toggle la cella corrente
    accendiSpegni(div, row, col);
    
    // Toggle celle adiacenti
    if (row > 0) {
        const divUp = document.getElementById(`div-${row-1}-${col}`);
        accendiSpegni(divUp, row-1, col);
    }
    if (row < dim - 1) {
        const divDown = document.getElementById(`div-${row+1}-${col}`);
        accendiSpegni(divDown, row+1, col);
    }
    if (col > 0) {
        const divLeft = document.getElementById(`div-${row}-${col-1}`);
        accendiSpegni(divLeft, row, col-1);
    }
    if (col < dim - 1) {
        const divRight = document.getElementById(`div-${row}-${col+1}`);
        accendiSpegni(divRight, row, col+1);
    }
}

function accendiSpegni(div, row, col) {
    if (div.classList.contains(GRIGIO)) {
        div.classList.remove(GRIGIO);
        div.classList.add(GIALLO);
        grid[row][col] = true;
    } else {
        div.classList.remove(GIALLO);
        div.classList.add(GRIGIO);
        grid[row][col] = false;
    }
}

function checkWin() {
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            if (!grid[i][j]) {
                return;
            }
        }
    }
    
    // Vittoria!
    gameWon = true;
    winMessageElement.textContent = `Hai acceso tutte le luci in ${moves} mosse!`;
    gameOverElement.classList.remove("hidden");
    
    // Disabilita i click
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            const div = document.getElementById(`div-${i}-${j}`);
            div.style.pointerEvents = "none";
        }
    }
}

function resetGame() {
    init();
    // Riabilita i click
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            const div = document.getElementById(`div-${i}-${j}`);
            div.style.pointerEvents = "auto";
        }
    }
}

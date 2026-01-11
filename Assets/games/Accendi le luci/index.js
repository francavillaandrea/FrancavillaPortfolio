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

sizeSelect.addEventListener("change", function () {
    dim = parseInt(this.value);
    init();
});

init();

function init() {
    gameWon = false;
    moves = 0;
    movesElement.textContent = "0";
    gameOverElement.classList.add("hidden");
    wrapper.style.gridTemplateColumns = `repeat(${dim}, 1fr)`;
    wrapper.innerHTML = "";

    // Initialize grid data and DOM elements
    grid = Array(dim).fill(null).map(() => Array(dim).fill(false));
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            const div = document.createElement("div");
            div.classList.add("pedina");
            div.id = `div-${i}-${j}`;
            div.addEventListener("click", () => handleCellClick(i, j));
            wrapper.appendChild(div);
        }
    }

    // Shuffle the puzzle to ensure it's solvable
    shufflePuzzle();
    render();
}

function shufflePuzzle() {
    // Genera uno stato casuale garantendo che il puzzle sia risolvibile
    // Inizia da uno stato completamente acceso (tutti true)
    grid = Array(dim).fill(null).map(() => Array(dim).fill(true));
    
    // Applica mosse casuali per creare uno stato iniziale risolvibile
    const numShuffles = Math.floor(Math.random() * (dim * dim)) + (dim * 2);
    for (let i = 0; i < numShuffles; i++) {
        const randomRow = Math.floor(Math.random() * dim);
        const randomCol = Math.floor(Math.random() * dim);
        toggleLights(randomRow, randomCol);
    }
    
    // Assicura che il puzzle non sia già risolto
    // Se tutte le luci sono accese, spegni una casella casuale
    if (grid.every(row => row.every(cell => cell))) {
        const row = Math.floor(Math.random() * dim);
        const col = Math.floor(Math.random() * dim);
        grid[row][col] = false;
    }
}

function handleCellClick(row, col) {
    if (gameWon) return;

    const div = document.getElementById(`div-${row}-${col}`);
    if (div) {
        div.classList.add("clicked");
        setTimeout(() => div.classList.remove("clicked"), 300);
    }
    
    toggleLights(row, col);
    moves++;
    movesElement.textContent = moves;

    render();
    checkWin();
}

function toggleLights(row, col) {
    const cellsToToggle = [
        { r: row, c: col },
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 },
    ];

    cellsToToggle.forEach(({ r, c }) => {
        if (r >= 0 && r < dim && c >= 0 && c < dim) {
            grid[r][c] = !grid[r][c];
        }
    });
}

function render() {
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            const div = document.getElementById(`div-${i}-${j}`);
            if (div) {
                div.classList.toggle(GIALLO, grid[i][j]);
                div.classList.toggle(GRIGIO, !grid[i][j]);
            }
        }
    }
}

function checkWin() {
    if (grid.every(row => row.every(cell => cell))) {
        gameWon = true;
        winMessageElement.textContent = `Hai acceso tutte le luci in ${moves} mosse!`;
        gameOverElement.classList.remove("hidden");
    }
}

function resetGame() {
    init();
}

function showHowToPlay() {
    const howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));
    howToPlayModal.show();
}
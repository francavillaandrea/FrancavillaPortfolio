"use strict";

const DIM = 4;
let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let moved = false;

const wrapper = document.getElementById("wrapper");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const gameOverElement = document.getElementById("game-over");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverMessage = document.getElementById("game-over-message");
// Cerca il modal solo se esiste
const howToPlayModalEl = document.getElementById('howToPlayModal');
const howToPlayModal = howToPlayModalEl ? new bootstrap.Modal(howToPlayModalEl) : null;

// Carica il miglior punteggio dal localStorage
bestScore = parseInt(localStorage.getItem("2048-best")) || 0;
bestElement.textContent = bestScore;

// Inizializza il gioco
init();

function init() {
    grid = Array(DIM).fill().map(() => Array(DIM).fill(0));
    score = 0;
    gameOver = false;
    updateScore();
    createGrid();
    addRandomTile();
    addRandomTile();
    render();
    gameOverElement.classList.add("hidden");
}

function createGrid() {
    wrapper.innerHTML = "";
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cella", "empty");
            cell.id = `${i}-${j}`;
            wrapper.appendChild(cell);
        }
    }
}

function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ i, j });
            }
        }
    }
    if (emptyCells.length > 0) {
        const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function render() {
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            const cell = document.getElementById(`${i}-${j}`);
            const value = grid[i][j];
            cell.textContent = value === 0 ? "" : value;
            cell.setAttribute("data-value", value);
            cell.classList.toggle("empty", value === 0);
        }
    }
}

// --- Refactored Move Logic ---

function operate(row) {
    const newRow = row.filter(val => val);
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2;
            score += newRow[i];
            newRow.splice(i + 1, 1);
        }
    }
    while (newRow.length < DIM) {
        newRow.push(0);
    }
    return newRow;
}

function rotateGrid(grid) {
    const newGrid = Array(DIM).fill().map(() => Array(DIM).fill(0));
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            newGrid[j][DIM - 1 - i] = grid[i][j];
        }
    }
    return newGrid;
}

function move(direction) {
    if (gameOver) return;

    let originalGrid = JSON.stringify(grid);
    let tempGrid = grid.map(row => [...row]);
    let rotations = 0;

    switch (direction) {
        case 'up': rotations = 1; break;
        case 'right': rotations = 2; break;
        case 'down': rotations = 3; break;
    }

    for (let i = 0; i < rotations; i++) {
        tempGrid = rotateGrid(tempGrid);
    }

    for (let i = 0; i < DIM; i++) {
        tempGrid[i] = operate(tempGrid[i]);
    }
    
    // Rotate back
    for (let i = 0; i < (4 - rotations) % 4; i++) {
        tempGrid = rotateGrid(tempGrid);
    }

    grid = tempGrid;
    moved = JSON.stringify(grid) !== originalGrid;

    if (moved) {
        addRandomTile();
        render();
        updateScore();
        checkEndGame();
    }
}

// --- End of Refactored Move Logic ---

function checkEndGame() {
    if (hasWon()) {
        endGame(true);
    } else if (isGameOver()) {
        endGame(false);
    }
}

function hasWon() {
    return grid.some(row => row.includes(2048));
}

function isGameOver() {
    if (grid.some(row => row.includes(0))) {
        return false;
    }
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (j < DIM - 1 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < DIM - 1 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    return true;
}

function updateScore() {
    scoreElement.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestElement.textContent = bestScore;
        localStorage.setItem("2048-best", bestScore);
    }
}

function endGame(won) {
    gameOver = true;
    gameOverElement.classList.remove("hidden");
    gameOverTitle.textContent = won ? "🎉 Hai Vinto!" : "Game Over!";
    gameOverMessage.textContent = won
        ? `Complimenti! Hai raggiunto 2048 con un punteggio di ${score}!`
        : `Il tuo punteggio finale è ${score}. Riprova!`;
}

function resetGame() {
    gameOver = false;
    init();
}

function showHowToPlay() {
    if (howToPlayModal) {
        howToPlayModal.show();
    } else {
        alert("Come si gioca 2048:\n- Usa le frecce o WASD per muovere i numeri\n- Unisci i numeri uguali per crear numeri più grandi\n- Raggiungi 2048 per vincere!");
    }
}

// Gestione eventi tastiera
document.addEventListener("keydown", (event) => {
    if (gameOver) return;
    switch (event.key.toLowerCase()) {
        case "arrowup":
        case "w":
            event.preventDefault();
            move('up');
            break;
        case "arrowdown":
        case "s":
            event.preventDefault();
            move('down');
            break;
        case "arrowleft":
        case "a":
            event.preventDefault();
            move('left');
            break;
        case "arrowright":
        case "d":
            event.preventDefault();
            move('right');
            break;
    }
});
"use strict";

/* =======================
   CONFIGURAZIONE
======================= */
const DIM = 4;
let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;

/* =======================
   ELEMENTI DOM
======================= */
const wrapper = document.getElementById("wrapper");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const gameOverElement = document.getElementById("game-over");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverMessage = document.getElementById("game-over-message");

/* =======================
   INIT
======================= */
bestScore = parseInt(localStorage.getItem("2048-best")) || 0;
bestElement.textContent = bestScore;

init();

function init() {
    grid = Array.from({ length: DIM }, () => Array(DIM).fill(0));
    score = 0;
    gameOver = false;

    createGrid();
    addRandomTile();
    addRandomTile();

    updateScore();
    render();
    gameOverElement.classList.add("hidden");
}

/* =======================
   GRIGLIA
======================= */
function createGrid() {
    wrapper.innerHTML = "";
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            const cell = document.createElement("div");
            cell.className = "cella empty";
            cell.id = `${i}-${j}`;
            wrapper.appendChild(cell);
        }
    }
}

function render() {
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            const cell = document.getElementById(`${i}-${j}`);
            const value = grid[i][j];
            cell.textContent = value === 0 ? "" : value;
            cell.dataset.value = value;
            cell.classList.toggle("empty", value === 0);
        }
    }
}

/* =======================
   TILE RANDOM
======================= */
function addRandomTile() {
    const empty = [];
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j] === 0) empty.push({ i, j });
        }
    }
    if (empty.length) {
        const { i, j } = empty[Math.floor(Math.random() * empty.length)];
        grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

/* =======================
   LOGICA 2048 ORIGINALE
======================= */
function slide(row) {
    const arr = row.filter(v => v !== 0);
    while (arr.length < DIM) arr.push(0);
    return arr;
}

function combine(row) {
    for (let i = 0; i < DIM - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row[i + 1] = 0;
        }
    }
    return row;
}

function operateRow(row) {
    row = slide(row);
    row = combine(row);
    row = slide(row);
    return row;
}

/* =======================
   ROTAZIONE
======================= */
function rotateRight() {
    const newGrid = Array.from({ length: DIM }, () => Array(DIM).fill(0));
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            newGrid[j][DIM - 1 - i] = grid[i][j];
        }
    }
    grid = newGrid;
}

/* =======================
   MOVIMENTI
======================= */
function moveLeft() {
    const oldGrid = JSON.stringify(grid);

    for (let i = 0; i < DIM; i++) {
        grid[i] = operateRow(grid[i]);
    }

    if (JSON.stringify(grid) !== oldGrid) {
        addRandomTile();
        updateScore();
        render();
        checkEndGame();
    }
}

function move(direction) {
    if (gameOver) return;

    switch (direction) {
        case "left":
            moveLeft();
            break;

        case "right":
            rotateRight();
            rotateRight();
            moveLeft();
            rotateRight();
            rotateRight();
            break;

        case "up":
            rotateRight();
            rotateRight();
            rotateRight();
            moveLeft();
            rotateRight();
            break;

        case "down":
            rotateRight();
            moveLeft();
            rotateRight();
            rotateRight();
            rotateRight();
            break;
    }
}

/* =======================
   GAME OVER / WIN
======================= */
function hasWon() {
    return grid.some(row => row.includes(2048));
}

function isGameOver() {
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j] === 0) return false;
            if (j < DIM - 1 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < DIM - 1 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    return true;
}

function checkEndGame() {
    if (hasWon()) endGame(true);
    else if (isGameOver()) endGame(false);
}

function endGame(won) {
    gameOver = true;
    gameOverElement.classList.remove("hidden");
    gameOverTitle.textContent = won ? "Hai vinto!" : "Game Over";
    gameOverMessage.textContent = won
        ? `Hai raggiunto 2048! Punteggio: ${score}`
        : `Punteggio finale: ${score}`;
}

/* =======================
   SCORE
======================= */
function updateScore() {
    scoreElement.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestElement.textContent = bestScore;
        localStorage.setItem("2048-best", bestScore);
    }
}

/* =======================
   RESET
======================= */
function resetGame() {
    init();
}

/* =======================
   INPUT TASTIERA
======================= */
document.addEventListener("keydown", e => {
    if (gameOver) return;

    switch (e.key.toLowerCase()) {
        case "arrowleft":
        case "a":
            e.preventDefault();
            move("left");
            break;

        case "arrowright":
        case "d":
            e.preventDefault();
            move("right");
            break;

        case "arrowup":
        case "w":
            e.preventDefault();
            move("up");
            break;

        case "arrowdown":
        case "s":
            e.preventDefault();
            move("down");
            break;
    }
});

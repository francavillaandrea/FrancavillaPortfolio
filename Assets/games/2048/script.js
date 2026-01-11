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

// Carica il miglior punteggio dal localStorage
bestScore = parseInt(localStorage.getItem("2048-best")) || 0;
bestElement.textContent = bestScore;

// Inizializza il gioco
init();

function init() {
    grid = Array(DIM).fill().map(() => Array(DIM).fill(0));
    score = 0;
    gameOver = false;
    moved = false;
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
            cell.classList.add("cella");
            cell.classList.add("empty");
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
                emptyCells.push({i, j});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function render() {
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            const cell = document.getElementById(`${i}-${j}`);
            const value = grid[i][j];
            
            if (value === 0) {
                cell.classList.add("empty");
                cell.textContent = "";
                cell.removeAttribute("data-value");
            } else {
                cell.classList.remove("empty");
                cell.textContent = value;
                cell.setAttribute("data-value", value);
            }
        }
    }
}

function move(direction) {
    if (gameOver) return;
    
    moved = false;
    const oldGrid = grid.map(row => [...row]);
    
    switch(direction) {
        case 'up':
            moveUp();
            break;
        case 'down':
            moveDown();
            break;
        case 'left':
            moveLeft();
            break;
        case 'right':
            moveRight();
            break;
    }
    
    if (moved) {
        addRandomTile();
        render();
        updateScore();
        
        if (isGameOver()) {
            endGame(false);
        } else if (hasWon()) {
            endGame(true);
        }
    }
}

function moveLeft() {
    for (let i = 0; i < DIM; i++) {
        const row = grid[i].filter(val => val !== 0);
        const merged = [];
        let j = 0;
        
        while (j < row.length) {
            if (j < row.length - 1 && row[j] === row[j + 1]) {
                merged.push(row[j] * 2);
                score += row[j] * 2;
                j += 2;
            } else {
                merged.push(row[j]);
                j++;
            }
        }
        
        while (merged.length < DIM) {
            merged.push(0);
        }
        
        if (JSON.stringify(grid[i]) !== JSON.stringify(merged)) {
            moved = true;
        }
        grid[i] = merged;
    }
}

function moveRight() {
    for (let i = 0; i < DIM; i++) {
        const row = grid[i].filter(val => val !== 0);
        const merged = [];
        let j = row.length - 1;
        
        while (j >= 0) {
            if (j > 0 && row[j] === row[j - 1]) {
                merged.unshift(row[j] * 2);
                score += row[j] * 2;
                j -= 2;
            } else {
                merged.unshift(row[j]);
                j--;
            }
        }
        
        while (merged.length < DIM) {
            merged.unshift(0);
        }
        
        if (JSON.stringify(grid[i]) !== JSON.stringify(merged)) {
            moved = true;
        }
        grid[i] = merged;
    }
}

function moveUp() {
    for (let j = 0; j < DIM; j++) {
        const column = [];
        for (let i = 0; i < DIM; i++) {
            if (grid[i][j] !== 0) {
                column.push(grid[i][j]);
            }
        }
        
        const merged = [];
        let i = 0;
        
        while (i < column.length) {
            if (i < column.length - 1 && column[i] === column[i + 1]) {
                merged.push(column[i] * 2);
                score += column[i] * 2;
                i += 2;
            } else {
                merged.push(column[i]);
                i++;
            }
        }
        
        while (merged.length < DIM) {
            merged.push(0);
        }
        
        const oldColumn = [];
        for (let i = 0; i < DIM; i++) {
            oldColumn.push(grid[i][j]);
        }
        
        if (JSON.stringify(oldColumn) !== JSON.stringify(merged)) {
            moved = true;
        }
        
        for (let i = 0; i < DIM; i++) {
            grid[i][j] = merged[i];
        }
    }
}

function moveDown() {
    for (let j = 0; j < DIM; j++) {
        const column = [];
        for (let i = 0; i < DIM; i++) {
            if (grid[i][j] !== 0) {
                column.push(grid[i][j]);
            }
        }
        
        const merged = [];
        let i = column.length - 1;
        
        while (i >= 0) {
            if (i > 0 && column[i] === column[i - 1]) {
                merged.unshift(column[i] * 2);
                score += column[i] * 2;
                i -= 2;
            } else {
                merged.unshift(column[i]);
                i--;
            }
        }
        
        while (merged.length < DIM) {
            merged.unshift(0);
        }
        
        const oldColumn = [];
        for (let i = 0; i < DIM; i++) {
            oldColumn.push(grid[i][j]);
        }
        
        if (JSON.stringify(oldColumn) !== JSON.stringify(merged)) {
            moved = true;
        }
        
        for (let i = 0; i < DIM; i++) {
            grid[i][j] = merged[i];
        }
    }
}

function hasWon() {
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j] === 2048) {
                return true;
            }
        }
    }
    return false;
}

function isGameOver() {
    // Controlla se ci sono celle vuote
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }
    
    // Controlla se ci sono mosse possibili
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            const current = grid[i][j];
            if ((i < DIM - 1 && grid[i + 1][j] === current) ||
                (j < DIM - 1 && grid[i][j + 1] === current)) {
                return false;
            }
        }
    }
    
    return true;
}

function updateScore() {
    scoreElement.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestElement.textContent = bestScore;
        localStorage.setItem("2048-best", bestScore.toString());
    }
}

function endGame(won) {
    gameOver = true;
    gameOverElement.classList.remove("hidden");
    
    if (won) {
        gameOverTitle.textContent = "🎉 Hai Vinto!";
        gameOverMessage.textContent = `Complimenti! Hai raggiunto 2048 con un punteggio di ${score}!`;
    } else {
        gameOverTitle.textContent = "Game Over!";
        gameOverMessage.textContent = `Il tuo punteggio finale è ${score}. Riprova!`;
    }
}

function resetGame() {
    init();
}

// Gestione eventi tastiera
document.addEventListener("keydown", (event) => {
    if (gameOver) return;
    
    switch(event.key) {
        case "ArrowUp":
            event.preventDefault();
            move('up');
            break;
        case "ArrowDown":
            event.preventDefault();
            move('down');
            break;
        case "ArrowLeft":
            event.preventDefault();
            move('left');
            break;
        case "ArrowRight":
            event.preventDefault();
            move('right');
            break;
    }
});

// Prevenire lo scroll con le frecce
window.addEventListener("keydown", (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
}, false);

"use strict";

const ROW = 5;
const COL = 5;
const BOMBS = 5;

let grid = [];
let revealed = [];
let gameOver = false;
let revealedCount = 0;
const totalCells = ROW * COL;
const safeCells = totalCells - BOMBS;

const wrapper = document.getElementById("wrapper");
const bombCountElement = document.getElementById("bomb-count");
const revealedCountElement = document.getElementById("revealed-count");
const gameOverElement = document.getElementById("game-over");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverMessage = document.getElementById("game-over-message");

init();

function init() {
    grid = Array(ROW).fill().map(() => Array(COL).fill(0));
    revealed = Array(ROW).fill().map(() => Array(COL).fill(false));
    gameOver = false;
    revealedCount = 0;
    
    createBoard();
    placeBombs();
    updateCounts();
    gameOverElement.classList.add("hidden");
}

function createBoard() {
    wrapper.innerHTML = "";
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            const btn = document.createElement("button");
            btn.classList.add("button");
            btn.id = `${i}-${j}`;
            btn.setAttribute("data-bomb", "false");
            btn.setAttribute("data-revealed", "false");
            btn.addEventListener("click", () => buttonPressed(i, j));
            wrapper.appendChild(btn);
        }
    }
}

function placeBombs() {
    let bombsPlaced = 0;
    while (bombsPlaced < BOMBS) {
        const i = generaNumero(0, ROW);
        const j = generaNumero(0, COL);
        
        if (grid[i][j] !== -1) {
            grid[i][j] = -1; // -1 rappresenta una bomba
            bombsPlaced++;
        }
    }
    
    // Calcola i numeri per ogni cella
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            if (grid[i][j] !== -1) {
                grid[i][j] = checkAdjacentBombs(i, j);
            }
        }
    }
}

function checkAdjacentBombs(i, j) {
    let count = 0;
    for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue;
            const ni = i + di;
            const nj = j + dj;
            if (ni >= 0 && ni < ROW && nj >= 0 && nj < COL) {
                if (grid[ni][nj] === -1) {
                    count++;
                }
            }
        }
    }
    return count;
}

function buttonPressed(i, j) {
    if (gameOver || revealed[i][j]) return;
    
    const btn = document.getElementById(`${i}-${j}`);
    
    // Controlla se è una bomba
    if (grid[i][j] === -1) {
        revealBomb(i, j);
        endGame(false);
        return;
    }
    
    // Rivela la cella
    revealCell(i, j);
    
    // Se la cella è vuota, rivela automaticamente le celle adiacenti
    if (grid[i][j] === 0) {
        revealAdjacentCells(i, j);
    }
    
    // Controlla se hai vinto
    if (revealedCount === safeCells) {
        endGame(true);
    }
}

function revealCell(i, j) {
    if (revealed[i][j] || i < 0 || i >= ROW || j < 0 || j >= COL) return;
    
    revealed[i][j] = true;
    revealedCount++;
    
    const btn = document.getElementById(`${i}-${j}`);
    btn.classList.add("revealed");
    btn.setAttribute("data-revealed", "true");
    btn.disabled = true;
    
    const value = grid[i][j];
    if (value > 0) {
        btn.textContent = value;
        btn.setAttribute("data-count", value);
    } else {
        btn.textContent = "";
    }
    
    updateCounts();
}

function revealAdjacentCells(i, j) {
    for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue;
            const ni = i + di;
            const nj = j + dj;
            
            if (ni >= 0 && ni < ROW && nj >= 0 && nj < COL && !revealed[ni][nj]) {
                if (grid[ni][nj] === -1) continue; // Non rivelare bombe
                
                revealCell(ni, nj);
                
                // Se anche questa cella è vuota, continua la ricorsione
                if (grid[ni][nj] === 0) {
                    revealAdjacentCells(ni, nj);
                }
            }
        }
    }
}

function revealBomb(i, j) {
    const btn = document.getElementById(`${i}-${j}`);
    btn.classList.add("bomb");
    const img = document.createElement("img");
    img.src = "bomb.png";
    img.alt = "Bomba";
    btn.innerHTML = "";
    btn.appendChild(img);
}

function revealAllBombs() {
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            if (grid[i][j] === -1 && !revealed[i][j]) {
                revealBomb(i, j);
            }
        }
    }
}

function disableAllButtons() {
    const buttons = document.querySelectorAll(".button");
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.removeEventListener("click", buttonPressed);
    });
}

function updateCounts() {
    bombCountElement.textContent = BOMBS;
    revealedCountElement.textContent = revealedCount;
}

function endGame(won) {
    gameOver = true;
    disableAllButtons();
    
    if (won) {
        gameOverTitle.textContent = "🎉 Hai Vinto!";
        gameOverMessage.textContent = `Complimenti! Hai scoperto tutte le ${safeCells} caselle sicure!`;
    } else {
        gameOverTitle.textContent = "💣 Hai Perso!";
        gameOverMessage.textContent = "Hai trovato una bomba! Riprova!";
        revealAllBombs();
    }
    
    gameOverElement.classList.remove("hidden");
}

function resetGame() {
    init();
}

function generaNumero(min, max) {
    return Math.floor((max - min) * Math.random()) + min;
}

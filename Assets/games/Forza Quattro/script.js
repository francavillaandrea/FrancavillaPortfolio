"use strict";

const RIGHE = 6;
const COLONNE = 7;

const YELLOW = "yellow";
const RED = "red";

const wrapper = document.getElementById("wrapper");
const _nextPlayer = document.getElementById("nextPlayer");
const gameOverElement = document.getElementById("game-over");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverMessage = document.getElementById("game-over-message");

let grid = [];
let currentPlayer = YELLOW;
let gameOver = false;

init();

function init() {
    grid = Array(RIGHE).fill().map(() => Array(COLONNE).fill(null));
    currentPlayer = YELLOW;
    gameOver = false;
    
    wrapper.innerHTML = "";
    gameOverElement.classList.add("hidden");
    
    // Crea la griglia
    for (let i = 0; i < RIGHE; i++) {
        for (let j = 0; j < COLONNE; j++) {
            const div = document.createElement("div");
            div.classList.add("pedina");
            div.id = `div-${i}-${j}`;
            div.dataset.row = i;
            div.dataset.col = j;
            
            if (i === RIGHE - 1) {
                div.addEventListener("click", handleClick);
            }
            
            wrapper.appendChild(div);
        }
    }
    
    updatePlayerDisplay();
}

function handleClick() {
    if (gameOver) return;
    
    const col = parseInt(this.dataset.col);
    const row = findLowestEmptyRow(col);
    
    if (row === -1) return; // Colonna piena
    
    placePiece(row, col);
    
    if (checkWin(row, col)) {
        endGame(`${currentPlayer === YELLOW ? "Giallo" : "Rosso"} ha vinto!`);
    } else if (isBoardFull()) {
        endGame("Pareggio! La griglia è piena.");
    } else {
        switchPlayer();
    }
}

function findLowestEmptyRow(col) {
    for (let i = RIGHE - 1; i >= 0; i--) {
        if (grid[i][col] === null) {
            return i;
        }
    }
    return -1;
}

function placePiece(row, col) {
    grid[row][col] = currentPlayer;
    const div = document.getElementById(`div-${row}-${col}`);
    div.classList.add("filled", currentPlayer);
    div.removeEventListener("click", handleClick);
    
    // Abilita la cella sopra se esiste
    if (row > 0) {
        const divAbove = document.getElementById(`div-${row - 1}-${col}`);
        divAbove.addEventListener("click", handleClick);
    }
}

function checkWin(row, col) {
    return checkHorizontal(row, col) || 
           checkVertical(row, col) || 
           checkDiagonal1(row, col) || 
           checkDiagonal2(row, col);
}

function checkHorizontal(row, col) {
    let count = 1;
    const color = grid[row][col];
    
    // Controlla a sinistra
    for (let j = col - 1; j >= 0 && grid[row][j] === color; j--) {
        count++;
    }
    
    // Controlla a destra
    for (let j = col + 1; j < COLONNE && grid[row][j] === color; j++) {
        count++;
    }
    
    return count >= 4;
}

function checkVertical(row, col) {
    let count = 1;
    const color = grid[row][col];
    
    // Controlla sopra
    for (let i = row - 1; i >= 0 && grid[i][col] === color; i--) {
        count++;
    }
    
    // Controlla sotto
    for (let i = row + 1; i < RIGHE && grid[i][col] === color; i++) {
        count++;
    }
    
    return count >= 4;
}

function checkDiagonal1(row, col) {
    let count = 1;
    const color = grid[row][col];
    
    // Diagonale principale (alto-sinistra a basso-destra)
    let i = row - 1, j = col - 1;
    while (i >= 0 && j >= 0 && grid[i][j] === color) {
        count++;
        i--;
        j--;
    }
    
    i = row + 1;
    j = col + 1;
    while (i < RIGHE && j < COLONNE && grid[i][j] === color) {
        count++;
        i++;
        j++;
    }
    
    return count >= 4;
}

function checkDiagonal2(row, col) {
    let count = 1;
    const color = grid[row][col];
    
    // Diagonale secondaria (alto-destra a basso-sinistra)
    let i = row - 1, j = col + 1;
    while (i >= 0 && j < COLONNE && grid[i][j] === color) {
        count++;
        i--;
        j++;
    }
    
    i = row + 1;
    j = col - 1;
    while (i < RIGHE && j >= 0 && grid[i][j] === color) {
        count++;
        i++;
        j--;
    }
    
    return count >= 4;
}

function isBoardFull() {
    return grid[0].every(cell => cell !== null);
}

function switchPlayer() {
    currentPlayer = currentPlayer === YELLOW ? RED : YELLOW;
    updatePlayerDisplay();
}

function updatePlayerDisplay() {
    _nextPlayer.textContent = currentPlayer === YELLOW ? "🟡 Giallo" : "🔴 Rosso";
    _nextPlayer.className = `pedina ${currentPlayer}`;
}

function endGame(message) {
    gameOver = true;
    gameOverTitle.textContent = "🎉 Game Over!";
    gameOverMessage.textContent = message;
    gameOverElement.classList.remove("hidden");
    
    // Disabilita tutti i click
    const divs = wrapper.querySelectorAll(".pedina");
    divs.forEach(div => div.removeEventListener("click", handleClick));
}

function resetGame() {
    init();
}

"use strict";

const DIM = 4;
const wrapper = document.getElementById("wrapper");
let grid = [];
let emptyPos = { row: DIM - 1, col: DIM - 1 };
let moves = 0;
let startTime = null;
let timerInterval = null;
let gameWon = false;

const movesElement = document.getElementById("moves");
const timeElement = document.getElementById("time");
const gameOverElement = document.getElementById("game-over");
const winMessageElement = document.getElementById("win-message");

init();

function init() {
    grid = [];
    moves = 0;
    gameWon = false;
    emptyPos = { row: DIM - 1, col: DIM - 1 };
    startTime = null;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    wrapper.innerHTML = "";
    movesElement.textContent = "0";
    timeElement.textContent = "0:00";
    gameOverElement.classList.add("hidden");
    
    // Crea array con numeri 1-15
    let numbers = [];
    for (let i = 1; i <= 15; i++) {
        numbers.push(i);
    }
    
    // Mescola i numeri
    shuffleArray(numbers);
    
    // Crea la griglia
    let index = 0;
    for (let i = 0; i < DIM; i++) {
        grid[i] = [];
        for (let j = 0; j < DIM; j++) {
            const div = document.createElement("div");
            div.classList.add("pedina");
            div.id = `div-${i}-${j}`;
            
            if (i === DIM - 1 && j === DIM - 1) {
                div.classList.add("empty");
                grid[i][j] = 0;
            } else {
                grid[i][j] = numbers[index];
                div.textContent = numbers[index];
                index++;
            }
            
            div.addEventListener("click", () => sposta(i, j));
            wrapper.appendChild(div);
        }
    }
    
    // Mescola il puzzle con mosse valide
    shufflePuzzle();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shufflePuzzle() {
    // Esegue 200 mosse casuali per mescolare
    for (let i = 0; i < 200; i++) {
        const directions = [
            { row: -1, col: 0 },  // sopra
            { row: 1, col: 0 },   // sotto
            { row: 0, col: -1 },  // sinistra
            { row: 0, col: 1 }    // destra
        ];
        
        const validMoves = directions.filter(dir => {
            const newRow = emptyPos.row + dir.row;
            const newCol = emptyPos.col + dir.col;
            return newRow >= 0 && newRow < DIM && newCol >= 0 && newCol < DIM;
        });
        
        if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            const newRow = emptyPos.row + randomMove.row;
            const newCol = emptyPos.col + randomMove.col;
            swapTiles(newRow, newCol, emptyPos.row, emptyPos.col, false);
        }
    }
}

function sposta(row, col) {
    if (gameWon) return;
    
    // Controlla se la cella è adiacente allo spazio vuoto
    const rowDiff = Math.abs(row - emptyPos.row);
    const colDiff = Math.abs(col - emptyPos.col);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        if (startTime === null) {
            startTime = Date.now();
            startTimer();
        }
        
        swapTiles(row, col, emptyPos.row, emptyPos.col, true);
        moves++;
        movesElement.textContent = moves;
        
        checkWin();
    }
}

function swapTiles(row1, col1, row2, col2, animate) {
    const div1 = document.getElementById(`div-${row1}-${col1}`);
    const div2 = document.getElementById(`div-${row2}-${col2}`);
    
    // Scambia i valori nella griglia
    [grid[row1][col1], grid[row2][col2]] = [grid[row2][col2], grid[row1][col1]];
    
    // Scambia il contenuto visivo
    const tempText = div1.textContent;
    const tempClass = div1.classList.contains("empty");
    
    div1.textContent = div2.textContent;
    div2.textContent = tempText;
    
    if (tempClass) {
        div1.classList.add("empty");
        div2.classList.remove("empty");
    } else {
        div1.classList.remove("empty");
        if (div2.textContent === "") {
            div2.classList.add("empty");
        }
    }
    
    if (animate) {
        div1.classList.add("moving");
        setTimeout(() => div1.classList.remove("moving"), 200);
    }
    
    // Aggiorna la posizione vuota
    if (grid[row1][col1] === 0) {
        emptyPos = { row: row1, col: col1 };
    } else {
        emptyPos = { row: row2, col: col2 };
    }
}

function checkWin() {
    let expected = 1;
    for (let i = 0; i < DIM; i++) {
        for (let j = 0; j < DIM; j++) {
            if (i === DIM - 1 && j === DIM - 1) {
                if (grid[i][j] !== 0) {
                    return;
                }
            } else {
                if (grid[i][j] !== expected) {
                    return;
                }
                expected++;
            }
        }
    }
    
    // Vittoria!
    gameWon = true;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    winMessageElement.textContent = `Hai completato il puzzle in ${moves} mosse e ${minutes}:${seconds.toString().padStart(2, '0')}!`;
    gameOverElement.classList.remove("hidden");
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function resetGame() {
    init();
}

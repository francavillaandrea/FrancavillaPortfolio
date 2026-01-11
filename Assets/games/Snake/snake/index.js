"use strict";

const DIM = 30;
let wrapper;
let snake = {x: 0, y: 0};
let direction = 'down';
let obstacles = [];
let food = null;
let points = 0;
let snakeTimer;
let foodTimer;
let gameover = false;

wrapper = document.getElementById('wrapper');
createGrid();
createObstacles();
createFood();
initializeSnake();
initializeControls();
startGame();

function generaNumero(min, max){
    return Math.floor((max - min) * Math.random()) + min;   
}

function createGrid() {
    for(let i = 0; i < DIM; i++) {
        let row = document.createElement('div');
        row.className = 'riga';
        for(let j = 0; j < DIM; j++) {
            let cell = document.createElement('div');
            cell.className = 'cella';
            cell.id = `cell-${i}-${j}`;
            row.appendChild(cell);
        }
        wrapper.appendChild(row);
    }
}

function createObstacles() {
    for(let i = 0; i < 16; i++) {
        let x, y;
        do {
            x = generaNumero(2, DIM);
            y = generaNumero(0, DIM);
        } while(isPositionOccupied(x, y));
        
        obstacles.push({x, y});
        getCell(x, y).classList.add('obstacle');
    }
}

function createFood() {
    let x, y, value;
    do {
        x = generaNumero(0, DIM);
        y = generaNumero(0, DIM);
    } while(isPositionOccupied(x, y));

    value = Math.random() < 0.1 ? 90 : generaNumero(1, 26);
    food = {x, y, value};
    let cell = getCell(x, y);
    cell.classList.add('food');
    cell.textContent = value;

    if(foodTimer) clearTimeout(foodTimer);
    foodTimer = setTimeout(createFood, 10000);
}

function initializeSnake() {
    snake = {x: 0, y: 0};
    getCell(0, 0).classList.add('snake');
}

function initializeControls() {
    document.querySelectorAll('input[type="button"]').forEach(btn => {
        btn.addEventListener('click', function() {
            switch(this.value) {
                case 'Up': direction = 'up'; break;
                case 'Dw': direction = 'down'; break;
                case 'Sx': direction = 'left'; break;
                case 'Dx': direction = 'right'; break;
            }
        });
    });
}

function startGame() {
    snakeTimer = setInterval(moveSnake, 250);
}

function moveSnake() {
    if(gameover) return;

    let newX = snake.x;
    let newY = snake.y;
    
    switch(direction) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
    }

    if(isGameOver(newX, newY)) {
        endGame();
        return;
    }    let currentCell = getCell(snake.x, snake.y);
    currentCell.classList.remove('snake');
    currentCell.style.backgroundColor = '#ccc'; // Colore grigio per la posizione precedente
    
    if(newX === food.x && newY === food.y) {
        points += food.value;
        document.getElementById('txtPunti').textContent = points;
        createFood();
    }

    snake.x = newX;
    snake.y = newY;
    getCell(snake.x, snake.y).classList.add('snake');
}

function isGameOver(x, y) {
    return x < 0 || x >= DIM || y < 0 || y >= DIM || 
           obstacles.some(obs => obs.x === x && obs.y === y);
}

function endGame() {
    gameover = true;
    clearInterval(snakeTimer);
    clearTimeout(foodTimer);
    alert('Hai perso!');
    document.querySelectorAll('input[type="button"]').forEach(btn => btn.disabled = true);
}

function isPositionOccupied(x, y) {
    return obstacles.some(obs => obs.x === x && obs.y === y) ||
           (snake.x === x && snake.y === y) ||
           (food && food.x === x && food.y === y);
}

function getCell(x, y) {
    return document.getElementById(`cell-${y}-${x}`);
}

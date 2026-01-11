"use strict";

const COLS = 4;
const ROWS = 3;
const GAME_TIME = 30;

let points = 0;
let timeLeft = GAME_TIME;
let moleInterval = null;
let timerInterval = null;
let gameRunning = false;

let currentMole = null; 
let hideTimeout = null;
let moleVisible = false;

const container = $("#gameContainer");
const scoreBox = $("#score");
const timerBox = $("#timer");
const restartBtn = $("#restartBtn");

init();

function init() {
    generateGrid();
    updateUI();
    startGame();

    restartBtn.on("click", restartGame);
}

function generateGrid() {
    container.empty();

    let id = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            $("<div> <div/>")
                .addClass("hole")
                .attr("id", `hole${id++}`)
                .appendTo(container);
        }
    }
}

function startGame() {
    gameRunning = true;
    moleVisible = false;

    moleInterval = setInterval(showRandomMole, 800);
    timerInterval = setInterval(updateTimer, 1000);
}

function showRandomMole() {
    if (!gameRunning || moleVisible) return;

    moleVisible = true;

    if (currentMole) {
        currentMole.remove();
        currentMole = null;
    }
    clearTimeout(hideTimeout);

    const holes = $(".hole").toArray();
    const randomIndex = Math.floor(Math.random() * holes.length);
    const randomHole = $(holes[randomIndex]);

    currentMole = $("<div><div/>").addClass("mole");
    randomHole.append(currentMole);

    currentMole.animate({ bottom: "10px" }, 300);

    currentMole.on("click", function () {
        if (!gameRunning) return;

        points++;
        updateUI();

        clearTimeout(hideTimeout);

        $(this).stop().animate({ bottom: "-80px" }, 300, () => {
            $(this).remove();
            currentMole = null;
            moleVisible = false;
        });
    });

    hideTimeout = setTimeout(() => {
        if (!currentMole) return;

        currentMole.animate({ bottom: "-80px" }, 300, () => {
            currentMole.remove();
            currentMole = null;
            moleVisible = false;
        });
    }, Math.random() * 1000 + 1000);
}

function updateTimer() {
    timeLeft--;
    updateUI();

    if (timeLeft <= 0) endGame();
}

function endGame() {
    gameRunning = false;

    clearInterval(moleInterval);
    clearInterval(timerInterval);
    clearTimeout(hideTimeout);

    if (currentMole) currentMole.remove();
    currentMole = null;
    moleVisible = false;

    alert(`Tempo scaduto!\nPunteggio finale: ${points}`);
}

function restartGame() {
    clearInterval(moleInterval);
    clearInterval(timerInterval);
    clearTimeout(hideTimeout);

    points = 0;
    timeLeft = GAME_TIME;
    moleVisible = false;
    currentMole = null;

    generateGrid();
    updateUI();
    startGame();
}

function updateUI() {
    scoreBox.text(`Punteggio: ${points}`);
    timerBox.text(`Tempo rimasto: ${timeLeft}s`);
}

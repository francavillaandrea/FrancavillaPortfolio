"use strict";

const COLS = 5;
const ROWS = 3;
const GAME_TIME = 30;

let points = 0;
let timer = GAME_TIME;
let fallSpeed = 3000;

let starInterval = null;
let timerInterval = null;
let gameRunning = false;

const container = $("#gameContainer");

startGame();

container.css({
    position: "relative",
    width: COLS * 70 + "px",
    height: ROWS * 100 + "px",
    margin: "auto",
    backgroundColor: "#111",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 0 20px #00ccff"
});

function startGame() {
    points = 0;
    timer = GAME_TIME;
    fallSpeed = 3000;
    gameRunning = true;

    $("#score").text("Punteggio: 0");
    $("#timer").text("Tempo rimasto: 30s");
    container.empty();

    starInterval = setInterval(createStar, 700);

    timerInterval = setInterval(() => {
        timer--;
        $("#timer").text(`Tempo rimasto: ${timer}s`);

        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}

function createStar() {
    if (!gameRunning) return;

    const colIndex = generaNumero(0, COLS);

    const star = $("<div></div>").addClass("star").css({
        position: "absolute",
        top: "-40px",
        left: colIndex * 70 + 15 + "px",
        width: "30px",
        height: "30px",
        backgroundColor: "yellow",
        borderRadius: "50%",
        boxShadow: "0 0 20px 10px #ffea00",
        cursor: "pointer"
    });

    container.append(star);

    star.animate(
        { top: container.height() - 30 + "px" },
        fallSpeed,
        "linear",
        function () {
            $(this).remove();
        }
    );
}

$(document).on("click", ".star", function () {
    if (!gameRunning) return;

    points++;
    $("#score").text(`Punteggio: ${points}`);

    $(this).stop().fadeOut(200, function () {
        $(this).remove();
    });

    if (points % 5 ==  0 && fallSpeed > 800) {
        fallSpeed -= 500;
    }
});

function endGame() {
    gameRunning = false;
    clearInterval(starInterval);
    clearInterval(timerInterval);

    $(".star").stop().remove();

    alert(`Tempo scaduto!\nPunteggio finale: ${points}`);
}

$("#restartBtn").on("click", function () {
    clearInterval(starInterval);
    clearInterval(timerInterval);
    startGame();
});



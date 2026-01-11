$(document).ready(function () {
    const GAME_TIME = 30;
    const ROWS = 3;
    const COLS = 3;

    let score = 0;
    let timeLeft = GAME_TIME;
    let gameInterval = null;
    let timerInterval = null;
    let gameRunning = false;
    let activeMoles = new Set();

    const difficultySettings = {
        easy: { interval: 1200, duration: 1500 },
        medium: { interval: 800, duration: 1000 },
        hard: { interval: 500, duration: 700 }
    };

    const container = $("#gameContainer");
    const scoreBox = $("#score");
    const timerBox = $("#timer");
    const restartBtn = $("#restartBtn");
    const howToPlayBtn = $("#howToPlayBtn");
    const difficultySelect = $("#difficulty");

    const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
    const howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));
    const finalScoreEl = $("#finalScore");
    const restartFromModalBtn = $("#restartFromModalBtn");

    function init() {
        generateGrid();
        updateUI();

        restartBtn.on("click", toggleGame);
        howToPlayBtn.on("click", () => howToPlayModal.show());
        restartFromModalBtn.on("click", () => {
            gameOverModal.hide();
            resetGame();
            startGame();
        });
        difficultySelect.on("change", resetGame);
    }

    function generateGrid() {
        container.empty();
        for (let i = 0; i < ROWS * COLS; i++) {
            const hole = $("<div>").addClass("hole").attr("data-id", i);
            container.append(hole);
        }
    }

    function toggleGame() {
        if (gameRunning) {
            endGame();
        } else {
            startGame();
        }
    }
    
    function startGame() {
        if (gameRunning) return;
        
        gameRunning = true;
        resetGame();
        
        const difficulty = difficultySelect.val();
        const settings = difficultySettings[difficulty];
        
        gameInterval = setInterval(showRandomMole, settings.interval);
        timerInterval = setInterval(updateTimer, 1000);
        
        restartBtn.text("Ferma Partita").removeClass("btn-primary").addClass("btn-danger");
        difficultySelect.prop("disabled", true);
    }

    function showRandomMole() {
        if (!gameRunning) return;

        const holes = $(".hole").toArray();
        const availableHoles = holes.filter(hole => !activeMoles.has($(hole).data('id')));

        if (availableHoles.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableHoles.length);
        const randomHole = $(availableHoles[randomIndex]);
        const moleId = randomHole.data('id');
        
        activeMoles.add(moleId);

        const mole = $("<div>").addClass("mole").html('&#128045;'); // Emoji for mole
        randomHole.append(mole);

        mole.addClass("active");

        mole.on("click", function () {
            if (!gameRunning) return;

            score++;
            updateUI();

            $(this).stop().removeClass("active").remove();
            activeMoles.delete(moleId);
        });

        const difficulty = difficultySelect.val();
        const settings = difficultySettings[difficulty];
        
        setTimeout(() => {
            if (mole.parent().length > 0) { // Check if mole still exists
                mole.removeClass("active").remove();
                activeMoles.delete(moleId);
            }
        }, settings.duration);
    }

    function updateTimer() {
        timeLeft--;
        updateUI();

        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        if (!gameRunning) return;

        gameRunning = false;
        clearInterval(gameInterval);
        clearInterval(timerInterval);

        $(".mole").remove();
        activeMoles.clear();

        finalScoreEl.text(score);
        gameOverModal.show();
        
        restartBtn.text("Inizia").removeClass("btn-danger").addClass("btn-primary");
        difficultySelect.prop("disabled", false);
    }
    
    function resetGame() {
        score = 0;
        timeLeft = GAME_TIME;
        updateUI();
    }
    
    function updateUI() {
        scoreBox.text(score);
        timerBox.text(`${timeLeft}s`);
    }

    init();
});

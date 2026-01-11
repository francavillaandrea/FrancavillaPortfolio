$(document).ready(function () {
    const Game = {
        sequence: [],
        playerSequence: [],
        colors: ["green", "red", "yellow", "blue"],
        level: 0,
        score: 0,
        bestLevel: 0,
        canClick: false,
        isGameStarted: false,
        difficulty: 'easy',
        speeds: {
            easy: 600,
            medium: 400,
            hard: 250
        },

        init: function() {
            this.bestLevel = parseInt(localStorage.getItem("colorsequence-best")) || 0;
            this.updateUI();

            $('#btnStart').on("click", () => this.startGame());
            $('#how-to-play-btn').on("click", () => new bootstrap.Modal($('#howToPlayModal')).show());
            $('.color-btn').on("click", (e) => {
                if (!this.canClick || !this.isGameStarted) return;
                const color = $(e.currentTarget).data("color");
                this.handlePlayerInput(color);
            });
            $('#difficulty').on("change", (e) => {
                this.difficulty = $(e.currentTarget).val();
            });
        },

        startGame: function() {
            this.isGameStarted = true;
            this.level = 0;
            this.score = 0;
            this.sequence = [];
            
            $('#btnStart').prop("disabled", true);
            $('#difficulty').prop("disabled", true);
            
            this.nextLevel();
        },

        nextLevel: function() {
            this.level++;
            this.playerSequence = [];
            this.sequence.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
            
            this.updateStatus("Osserva...");
            this.playSequence();
        },

        playSequence: function() {
            this.canClick = false;
            $('.color-btn').addClass("disabled");
            
            let i = 0;
            const playNext = () => {
                if (i < this.sequence.length) {
                    this.flashColor(this.sequence[i]);
                    i++;
                    setTimeout(playNext, this.speeds[this.difficulty]);
                } else {
                    this.canClick = true;
                    $('.color-btn').removeClass("disabled");
                    this.updateStatus("Tocca a te!");
                }
            };
            setTimeout(playNext, 800);
        },

        flashColor: function(color) {
            const $btn = $('#' + color);
            $btn.addClass("active");
            this.playSound(color);
            setTimeout(() => $btn.removeClass("active"), this.speeds[this.difficulty] / 2);
        },

        handlePlayerInput: function(color) {
            this.playerSequence.push(color);
            this.flashColor(color);

            const currentIndex = this.playerSequence.length - 1;
            if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
                this.endGame();
                return;
            }

            if (this.playerSequence.length === this.sequence.length) {
                this.score += this.level * 10;
                if (this.level > this.bestLevel) {
                    this.bestLevel = this.level;
                    localStorage.setItem("colorsequence-best", this.bestLevel);
                }
                this.updateUI();
                setTimeout(() => this.nextLevel(), 1000);
            }
        },

        endGame: function() {
            this.isGameStarted = false;
            this.canClick = false;
            this.playSound('error');
            this.updateStatus(`Game Over! Hai raggiunto il livello ${this.level -1}.`);
            $('#btnStart').prop("disabled", false);
            $('#difficulty').prop("disabled", false);
        },
        
        playSound: function(soundId) {
            const audio = document.getElementById(`audio-${soundId}`);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log("Audio play failed:", e));
            }
        },

        updateStatus: function(message) {
            $('#txtStatus').text(message);
        },

        updateUI: function() {
            $('#level').text(this.level);
            $('#score').text(this.score);
            $('#best-level').text(this.bestLevel);
        }
    };

    Game.init();
});

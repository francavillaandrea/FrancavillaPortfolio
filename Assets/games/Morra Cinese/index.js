document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        choices: ["sasso", "carta", "forbice"],
        scoreUtente: 0,
        scoreComputer: 0,
        scorePareggi: 0,
        userChoice: "",
        computerChoice: "",

        // UI Elements
        imgUtente: document.getElementById('imgUtente'),
        imgComputer: document.getElementById('imgComputer'),
        selectionContainer: document.querySelector('.selection-container'),
        btnGioca: document.getElementById('btnGioca'),
        txtRisultato: document.getElementById('txtRisultato'),
        scoreUtenteEl: document.getElementById('score-utente'),
        scoreComputerEl: document.getElementById('score-computer'),
        scorePareggiEl: document.getElementById('score-pareggi'),
        btnReset: document.getElementById('btnReset'),
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        howToPlayModal: new bootstrap.Modal(document.getElementById('howToPlayModal')),

        init: function() {
            this.loadScores();
            this.setupUI();
            this.setupEventListeners();
            this.resetChoicesDisplay();
        },

        setupUI: function() {
            // Set up initial images for player and computer
            this.impostaImmagine(this.imgUtente, 'vuoto.png');
            this.impostaImmagine(this.imgComputer, 'vuoto.png');

            // Populate selection container with small images
            this.selectionContainer.innerHTML = ''; // Clear existing
            this.choices.forEach(choice => {
                const div = document.createElement('div');
                div.classList.add('small');
                div.dataset.choice = choice;
                this.impostaImmagine(div, `${choice}.png`);
                div.addEventListener('click', () => this.selectUserChoice(choice, div));
                this.selectionContainer.appendChild(div);
            });
            this.updateScoresDisplay();
        },

        setupEventListeners: function() {
            this.btnGioca.addEventListener('click', () => this.playRound());
            this.btnReset.addEventListener('click', () => this.resetScore());
            this.howToPlayBtn.addEventListener('click', () => this.howToPlayModal.show());
        },

        selectUserChoice: function(choice, el) {
            this.userChoice = choice;
            // Remove 'selected' from all small choices
            this.selectionContainer.querySelectorAll('.small').forEach(item => {
                item.classList.remove('selected');
            });
            // Add 'selected' to the current one
            el.classList.add('selected');
            
            this.impostaImmagine(this.imgUtente, `${choice}.png`);
            this.impostaImmagine(this.imgComputer, 'vuoto.png');
            this.displayMessage(""); // Clear previous result message
        },

        playRound: function() {
            if (this.userChoice === "") {
                this.displayMessage("Seleziona prima la tua mossa!", "error");
                return;
            }

            this.btnGioca.disabled = true; // Prevent multiple clicks
            
            // Computer's turn
            this.computerChoice = this.choices[this.random(0, this.choices.length)];

            // Animation for computer's choice
            this.imgComputer.classList.add('shake');
            this.impostaImmagine(this.imgComputer, 'vuoto.png'); // Show back of card

            setTimeout(() => {
                this.imgComputer.classList.remove('shake');
                this.impostaImmagine(this.imgComputer, `${this.computerChoice}.png`);
                const result = this.determinaVincitore(this.userChoice, this.computerChoice);
                this.displayResult(result);
                this.btnGioca.disabled = false;
            }, 1000); // Animation duration
        },

        determinaVincitore: function(user, computer) {
            if (user === computer) {
                this.scorePareggi++;
                return { message: "Pareggio!", type: "draw" };
            }
            
            const winConditions = {
                "forbice": "carta",
                "carta": "sasso",
                "sasso": "forbice"
            };

            if (winConditions[user] === computer) {
                this.scoreUtente++;
                return { message: "🎉 Hai Vinto!", type: "win" };
            } else {
                this.scoreComputer++;
                return { message: "💻 Ha Vinto il Computer!", type: "lose" };
            }
        },

        displayResult: function(result) {
            this.displayMessage(result.message, result.type);
            this.updateScoresDisplay();
            this.saveScores();
            this.resetChoicesDisplay(); // Clear user choice for next round
        },

        resetChoicesDisplay: function() {
            this.userChoice = "";
            this.selectionContainer.querySelectorAll('.small').forEach(item => {
                item.classList.remove('selected');
            });
            this.impostaImmagine(this.imgUtente, 'vuoto.png');
            this.impostaImmagine(this.imgComputer, 'vuoto.png');
        },

        updateScoresDisplay: function() {
            this.scoreUtenteEl.textContent = this.scoreUtente;
            this.scoreComputerEl.textContent = this.scoreComputer;
            this.scorePareggiEl.textContent = this.scorePareggi;
        },

        saveScores: function() {
            localStorage.setItem("morra-score-utente", this.scoreUtente.toString());
            localStorage.setItem("morra-score-computer", this.scoreComputer.toString());
            localStorage.setItem("morra-score-pareggi", this.scorePareggi.toString());
        },

        loadScores: function() {
            this.scoreUtente = parseInt(localStorage.getItem("morra-score-utente")) || 0;
            this.scoreComputer = parseInt(localStorage.getItem("morra-score-computer")) || 0;
            this.scorePareggi = parseInt(localStorage.getItem("morra-score-pareggi")) || 0;
        },

        resetScore: function() {
            if (confirm("Vuoi resettare tutti i punteggi?")) {
                this.scoreUtente = 0;
                this.scoreComputer = 0;
                this.scorePareggi = 0;
                this.updateScoresDisplay();
                this.saveScores();
                this.displayMessage("Punteggi resettati!", "info");
            }
        },

        displayMessage: function(message, type = '') {
            this.txtRisultato.textContent = message;
            this.txtRisultato.className = ''; // Clear previous classes
            if (type) {
                this.txtRisultato.classList.add(type);
            }
            // Clear message after a short delay for non-persistent messages
            if (type === 'error' || type === 'info') {
                 setTimeout(() => {
                    this.txtRisultato.textContent = "";
                    this.txtRisultato.className = "";
                }, 2000);
            }
        },

        impostaImmagine: function(element, imageName) {
            element.style.backgroundImage = `url('img/${imageName}')`;
        },

        random: function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
    };

    Game.init();
});
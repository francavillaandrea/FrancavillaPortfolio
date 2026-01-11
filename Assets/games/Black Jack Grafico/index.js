document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let players = [];
    let dealer = {
        name: 'Banco',
        hand: [],
        score: 0,
        element: document.getElementById('dealer-hand'),
        scoreElement: document.getElementById('dealer-score')
    };
    let deck = [];
    let currentPlayerIndex = -1;
    let gameInProgress = false;

    // UI Elements
    const playersArea = document.getElementById('players-area');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerNameInput = document.getElementById('player-name-input');
    const newGameBtn = document.getElementById('btn-new-game');
    const hitBtn = document.getElementById('btn-hit');
    const standBtn = document.getElementById('btn-stand');
    const gameStatus = document.getElementById('game-status');
    const playerControls = document.getElementById('player-controls');
    const addPlayerForm = document.getElementById('add-player-form');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const howToPlayModal = new bootstrap.Modal(document.getElementById('howToPlayModal'));

    // --- Event Listeners ---
    addPlayerBtn.addEventListener('click', addPlayer);
    newGameBtn.addEventListener('click', startGame);
    hitBtn.addEventListener('click', () => playerAction('hit'));
    standBtn.addEventListener('click', () => playerAction('stand'));
    howToPlayBtn.addEventListener('click', () => howToPlayModal.show());


    function createDeck() {
        const suits = ['c', 'd', 'h', 's']; // clubs, diamonds, hearts, spades
        const values = Array.from({ length: 13 }, (_, i) => i + 1);
        deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value, img: `img/${suit}${value}.gif` });
            }
        }
        // Shuffle deck
        deck.sort(() => Math.random() - 0.5);
    }

    function addPlayer() {
        if (players.length >= 4 || gameInProgress) return;
        const name = playerNameInput.value.trim();
        if (name && players.every(p => p.name !== name)) {
            const playerElement = document.createElement('div');
            playerElement.className = 'player';
            playerElement.innerHTML = `
                <h3 class="player-name">${name}</h3>
                <div class="hand"></div>
                <p class="score-display">Punteggio: <span>0</span></p>
                <p class="player-status"></p>
            `;
            playersArea.appendChild(playerElement);

            players.push({
                name,
                hand: [],
                score: 0,
                isBusted: false,
                hasStood: false,
                element: playerElement,
                handElement: playerElement.querySelector('.hand'),
                scoreElement: playerElement.querySelector('span'),
                statusElement: playerElement.querySelector('.player-status')
            });
            playerNameInput.value = '';
        }
    }
    
    function startGame() {
        if (players.length === 0) {
            updateGameStatus('Aggiungi almeno un giocatore per iniziare!');
            return;
        }

        gameInProgress = true;
        addPlayerForm.style.display = 'none';
        newGameBtn.style.display = 'none';
        
        resetGame();
        createDeck();
        dealInitialCards();
    }

    async function dealInitialCards() {
        // Deal two cards to each player
        for (let i = 0; i < 2; i++) {
            for (const player of players) {
                await dealCard(player);
            }
            // Deal one card to dealer
            if (i === 0) await dealCard(dealer);
            if (i === 1) await dealCard(dealer, true); // Hidden card
        }
        
        startNextPlayerTurn();
    }

    function dealCard(participant, isHidden = false) {
        return new Promise(resolve => {
            setTimeout(() => {
                const card = deck.pop();
                card.isHidden = isHidden;
                participant.hand.push(card);
                renderHands();
                calculateScores();
                resolve();
            }, 300); // Stagger card dealing animation
        });
    }

    function renderHands() {
        // Render player hands
        for (const player of players) {
            player.handElement.innerHTML = '';
            for (const card of player.hand) {
                const cardEl = document.createElement('div');
                cardEl.className = 'card';
                cardEl.style.backgroundImage = `url('${card.img}')`;
                player.handElement.appendChild(cardEl);
            }
        }

        // Render dealer hand
        dealer.element.innerHTML = '';
        for (const card of dealer.hand) {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${card.isHidden ? 'hidden' : ''}`;
            if (!card.isHidden) {
                cardEl.style.backgroundImage = `url('${card.img}')`;
            }
            dealer.element.appendChild(cardEl);
        }
    }

    function calculateScores() {
        // Calculate player scores
        for (const player of players) {
            let score = 0;
            let aceCount = 0;
            for (const card of player.hand) {
                let value = card.value > 10 ? 10 : card.value;
                if (value === 1) {
                    aceCount++;
                    score += 11;
                } else {
                    score += value;
                }
            }
            while (score > 21 && aceCount > 0) {
                score -= 10;
                aceCount--;
            }
            player.score = score;
            player.scoreElement.textContent = score;

            if (player.score > 21) {
                player.isBusted = true;
                player.statusElement.textContent = 'Sballato!';
                player.element.classList.add('busted');
            }
        }

        // Calculate dealer score (only visible card)
        let dealerScore = 0;
        let dealerAceCount = 0;
        for (const card of dealer.hand) {
            if (card.isHidden) continue;
            let value = card.value > 10 ? 10 : card.value;
            if (value === 1) {
                dealerAceCount++;
                dealerScore += 11;
            } else {
                dealerScore += value;
            }
        }
        while (dealerScore > 21 && dealerAceCount > 0) {
            dealerScore -= 10;
            dealerAceCount--;
        }
        dealer.score = dealerScore;
        dealer.scoreElement.textContent = dealerScore;
    }
    
    function startNextPlayerTurn() {
        currentPlayerIndex++;
        if (currentPlayerIndex >= players.length) {
            dealerTurn();
            return;
        }

        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer.isBusted) {
            startNextPlayerTurn();
            return;
        }
        
        updateGameStatus(`È il turno di ${currentPlayer.name}.`);
        playerControls.style.display = 'block';
        players.forEach(p => p.element.classList.remove('active'));
        currentPlayer.element.classList.add('active');
    }

    function playerAction(action) {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer || !gameInProgress) return;

        if (action === 'hit') {
            dealCard(currentPlayer).then(() => {
                if (currentPlayer.isBusted) {
                    playerAction('stand'); // Automatically stand if busted
                }
            });
        } else if (action === 'stand') {
            currentPlayer.hasStood = true;
            startNextPlayerTurn();
        }
    }

    async function dealerTurn() {
        playerControls.style.display = 'none';
        players.forEach(p => p.element.classList.remove('active'));
        updateGameStatus('Turno del Banco.');

        // Reveal hidden card
        const hiddenCard = dealer.hand.find(c => c.isHidden);
        if (hiddenCard) {
            hiddenCard.isHidden = false;
            renderHands();
        }
        
        // Recalculate full score for dealer
        let fullScore = 0;
        let aceCount = 0;
        dealer.hand.forEach(card => {
            let value = card.value > 10 ? 10 : card.value;
            if (value === 1) {
                aceCount++;
                fullScore += 11;
            } else {
                fullScore += value;
            }
        });
        while (fullScore > 21 && aceCount > 0) {
            fullScore -= 10;
            aceCount--;
        }
        dealer.score = fullScore;
        dealer.scoreElement.textContent = dealer.score;

        // Dealer hits until 17 or more
        while (dealer.score < 17) {
            await dealCard(dealer);
            // Recalculate score after each hit
            fullScore = 0;
            aceCount = 0;
            dealer.hand.forEach(card => {
                let value = card.value > 10 ? 10 : card.value;
                if (value === 1) { aceCount++; fullScore += 11; } else { fullScore += value; }
            });
            while (fullScore > 21 && aceCount > 0) { fullScore -= 10; aceCount--; }
            dealer.score = fullScore;
            dealer.scoreElement.textContent = dealer.score;
        }

        endRound();
    }
    
    function endRound() {
        const dealerScore = dealer.score;
        const dealerBusted = dealerScore > 21;
        
        for (const player of players) {
            if (player.isBusted) {
                player.statusElement.textContent = 'Hai Perso!';
            } else if (dealerBusted || player.score > dealerScore) {
                player.statusElement.textContent = 'Hai Vinto!';
            } else if (player.score < dealerScore) {
                player.statusElement.textContent = 'Hai Perso!';
            } else {
                player.statusElement.textContent = 'Pareggio!';
            }
        }
        
        updateGameStatus(`Fine del round! Premi "Inizia Partita" per giocare ancora.`);
        newGameBtn.style.display = 'block';
        gameInProgress = false;
        addPlayerForm.style.display = 'block';
    }
    
    function resetGame() {
        players.forEach(p => {
            p.hand = [];
            p.score = 0;
            p.isBusted = false;
            p.hasStood = false;
            p.element.classList.remove('busted', 'active');
            p.statusElement.textContent = '';
            p.handElement.innerHTML = '';
            p.scoreElement.textContent = '0';
        });
        dealer.hand = [];
        dealer.score = 0;
        dealer.element.innerHTML = '';
        dealer.scoreElement.textContent = '0';
        
        currentPlayerIndex = -1;
        playerControls.style.display = 'none';
        updateGameStatus('Aggiungi giocatori e premi Inizia Partita.');
    }

    function updateGameStatus(message) {
        gameStatus.textContent = message;
    }

    // Initial setup
    resetGame();
});

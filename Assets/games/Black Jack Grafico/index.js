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
    let deckId = null; // Store the deck_id from the API
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
    // Add event listener for the player name input to add player on Enter key
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });

    async function createNewShuffledDeck() {
        try {
            const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
            const data = await response.json();
            deckId = data.deck_id;
            console.log('New deck created with ID:', deckId);
        } catch (error) {
            console.error('Error creating new deck:', error);
            updateGameStatus('Errore nel caricamento del mazzo. Riprova.');
        }
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
    
    async function startGame() {
        if (players.length === 0) {
            updateGameStatus('Aggiungi almeno un giocatore per iniziare!');
            return;
        }

        gameInProgress = true;
        addPlayerForm.style.display = 'none';
        newGameBtn.style.display = 'none';
        
        resetGame();
        await createNewShuffledDeck(); // Create deck before dealing
        await dealInitialCards();
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

    async function dealCard(participant, isHidden = false) {
        if (!deckId) {
            console.error('No deck ID available to draw cards.');
            return;
        }
        
        try {
            const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            const data = await response.json();

            if (data.cards && data.cards.length > 0) {
                const apiCard = data.cards[0];
                const card = {
                    code: apiCard.code,
                    value: convertCardValue(apiCard.value),
                    suit: apiCard.suit,
                    image: apiCard.image, // API provided image URL
                    isHidden: isHidden
                };
                
                participant.hand.push(card);
                
                // Render the new card with dealing animation
                const cardEl = document.createElement('div');
                cardEl.className = `card ${card.isHidden ? 'hidden' : ''} dealt`;
                if (!card.isHidden) {
                    cardEl.style.backgroundImage = `url('${card.image}')`; // Use API image
                }
                participant.handElement.appendChild(cardEl);
                
                // Remove 'dealt' class after animation to allow hover effects
                setTimeout(() => cardEl.classList.remove('dealt'), 500); // Match animation duration

                calculateScores(); // Recalculate scores after each card dealt
            } else {
                console.warn('No cards left in the deck or error drawing card.');
                updateGameStatus('Non ci sono più carte nel mazzo!');
                // Handle reshuffle or end game here
            }
        } catch (error) {
            console.error('Error drawing card:', error);
            updateGameStatus('Errore nel pescare una carta. Riprova.');
        }
    }

    // Helper to convert API string values (KING, QUEEN, ACE) to numeric
    function convertCardValue(apiValue) {
        switch (apiValue) {
            case 'ACE': return 1;
            case 'KING':
            case 'QUEEN':
            case 'JACK': return 10;
            default: return parseInt(apiValue);
        }
    }

    // renderHands function is simplified as dealCard now handles individual card rendering
    function renderHands() {
        // This function is mostly for initial setup or full re-render after a reset, not for dealing animations
        for (const player of players) {
            player.handElement.innerHTML = ''; // Clear existing cards
            for (const card of player.hand) {
                const cardEl = document.createElement('div');
                cardEl.className = 'card';
                if (card.isHidden) {
                    cardEl.classList.add('hidden');
                } else {
                    cardEl.style.backgroundImage = `url('${card.image}')`;
                }
                player.handElement.appendChild(cardEl);
            }
        }

        dealer.element.innerHTML = ''; // Clear existing cards
        for (const card of dealer.hand) {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${card.isHidden ? 'hidden' : ''}`;
            if (!card.isHidden) {
                cardEl.style.backgroundImage = `url('${card.image}')`;
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
                let value = card.value; // Already converted to numeric in dealCard
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
                player.statusElement.textContent = 'Sballato! Hai Perso.';
                player.element.classList.add('busted');
            }
        }

        // Calculate dealer score (only visible card for initial display)
        let dealerScore = 0;
        let dealerAceCount = 0;
        for (const card of dealer.hand) {
            if (card.isHidden) continue; 
            let value = card.value;
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
        dealer.scoreElement.textContent = dealer.score;
    }
    
    function startNextPlayerTurn() {
        let nextPlayerFound = false;
        while(currentPlayerIndex < players.length){
            currentPlayerIndex++;
            if(currentPlayerIndex < players.length){
                const currentPlayer = players[currentPlayerIndex];
                if (!currentPlayer.isBusted && !currentPlayer.hasStood) {
                    nextPlayerFound = true;
                    break;
                }
            }
        }

        if (!nextPlayerFound) {
            dealerTurn();
            return;
        }

        const currentPlayer = players[currentPlayerIndex];
        
        updateGameStatus(`È il turno di ${currentPlayer.name}.`);
        playerControls.style.display = 'flex';
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
        players.forEach(p => p.element.classList.remove('active', 'winner'));
        updateGameStatus('Turno del Banco.');

        // Reveal hidden card
        const hiddenCard = dealer.hand.find(c => c.isHidden);
        if (hiddenCard) {
            hiddenCard.isHidden = false;
            const hiddenCardEl = dealer.element.querySelector('.card.hidden');
            if(hiddenCardEl){
                 hiddenCardEl.classList.remove('hidden');
                 hiddenCardEl.style.backgroundImage = `url('${hiddenCard.image}')`; // Use API image
            }
        }
        
        // Recalculate full score for dealer after revealing card
        let fullScore = 0;
        let aceCount = 0;
        dealer.hand.forEach(card => {
            let value = card.value;
            if (value === 1) { aceCount++; fullScore += 11; } else { fullScore += value; }
        });
        while (fullScore > 21 && aceCount > 0) { fullScore -= 10; aceCount--; }
        dealer.score = fullScore;
        dealer.scoreElement.textContent = dealer.score;


        // Dealer hits until 17 or more
        while (dealer.score < 17) {
            await dealCard(dealer);
            fullScore = 0;
            aceCount = 0;
            dealer.hand.forEach(card => {
                let value = card.value;
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
                player.statusElement.textContent = 'Sballato! Hai Perso.';
                player.element.classList.add('busted');
            } else if (dealerBusted || player.score > dealerScore) {
                player.statusElement.textContent = 'Hai Vinto!';
                player.element.classList.add('winner');
            } else if (player.score < dealerScore) {
                player.statusElement.textContent = 'Hai Perso.';
                player.element.classList.add('busted');
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
            p.element.classList.remove('busted', 'active', 'winner');
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
        addPlayerForm.style.display = 'block';
        newGameBtn.style.display = 'block';
        updateGameStatus('Aggiungi giocatori e premi Inizia Partita.');
    }

    function updateGameStatus(message) {
        gameStatus.textContent = message;
    }

    // Initial setup
    resetGame(); // Ensure initial state is correctly set, including button visibility
    // startGame() should not be called automatically here. It should be triggered by newGameBtn click.
});

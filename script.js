document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const keyboard = document.getElementById('keyboard');
    const messageDiv = document.getElementById('message');
    const secretWordInput = document.getElementById('secret-word-input');
    const startButton = document.getElementById('start-game');
    
    let secretWord = '';
    let currentRow = 0;
    let currentTile = 0;
    let gameStarted = false;
    let gameOver = false;

    // Initialize the board with empty tiles
    function initializeBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.state = 'empty';
                row.appendChild(tile);
            }
            board.appendChild(row);
        }
    }

    // Initialize the keyboard
    function initializeKeyboard() {
        keyboard.innerHTML = '';
        
        const keyboardRows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        keyboardRows.forEach(rowKeys => {
            const row = document.createElement('div');
            row.className = 'keyboard-row';
            
            rowKeys.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.className = 'key';
                if (key.length > 1) {
                    keyElement.classList.add('wide');
                    keyElement.textContent = key === 'BACKSPACE' ? '⌫' : key;
                } else {
                    keyElement.textContent = key;
                }
                keyElement.dataset.key = key;
                row.appendChild(keyElement);
            });
            
            keyboard.appendChild(row);
        });
    }

    // Start the game with the entered word
    function startGame() {
    const word = secretWordInput.value.trim().toUpperCase();

    if (word.length !== 5) {
        showMessage('Please enter a 5-letter word');
        return;
    }

    secretWord = word;
    secretWordInput.disabled = true;
    startButton.disabled = true;
    gameStarted = true;
    gameOver = false;
    currentRow = 0;
    currentTile = 0;
    messageDiv.textContent = '';

    initializeBoard();
    initializeKeyboard();
    keyboard.classList.remove('hidden');

    // Hide the input section after game starts
    document.getElementById('input-section').classList.add('hidden');

    showMessage('Game started! Make your first guess');
}


    // Show message to the player
    function showMessage(msg) {
        messageDiv.textContent = msg;
    }

    // Handle keyboard input
    function handleKeyPress(key) {
        if (!gameStarted || gameOver) return;
        
        const currentRowElement = board.children[currentRow];
        
        if (/^[a-zA-Z]$/.test(key) && currentTile < 5) {
            // Letter key pressed
            const tile = currentRowElement.children[currentTile];
            tile.textContent = key.toUpperCase();
            tile.classList.add('active');
            setTimeout(() => tile.classList.remove('active'), 200);
            currentTile++;
        } else if (key === 'BACKSPACE' && currentTile > 0) {
            // Backspace pressed
            currentTile--;
            currentRowElement.children[currentTile].textContent = '';
        } else if (key === 'ENTER' && currentTile === 5) {
            // Enter pressed with complete word
            submitGuess();
        }
    }

    // Submit the current guess
    function submitGuess() {
        const currentRowElement = board.children[currentRow];
        let guess = '';
        
        // Collect the letters from the tiles
        for (let i = 0; i < 5; i++) {
            guess += currentRowElement.children[i].textContent;
        }
        
        // Check if guess is correct
        if (guess === secretWord) {
            markCorrectGuess(currentRowElement, guess);
            gameOver = true;
            showMessage('Congratulations! You guessed the word!');
            return;
        }
        
        // Mark the tiles with correct, present, or absent states
        markTiles(currentRowElement, guess);
        
        // Move to next row or end game
        currentRow++;
        currentTile = 0;
        
        if (currentRow === 6) {
            gameOver = true;
            showMessage(`Game over! The word was ${secretWord}`);
        } else {
            showMessage('Next guess');
        }
    }

    // Mark tiles based on the guess
    function markTiles(rowElement, guess) {
        const secretLetters = secretWord.split('');
        const guessLetters = guess.split('');
        
        // First pass: mark correct letters
        for (let i = 0; i < 5; i++) {
            const tile = rowElement.children[i];
            const letter = guessLetters[i];
            
            if (letter === secretLetters[i]) {
                tile.dataset.state = 'correct';
                secretLetters[i] = ''; // Mark as used
                guessLetters[i] = ''; // Mark as used
                updateKeyState(letter, 'correct');
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < 5; i++) {
            const tile = rowElement.children[i];
            const letter = guessLetters[i];
            
            if (letter === '') continue; // Skip already processed letters
            
            const indexInSecret = secretLetters.indexOf(letter);
            if (indexInSecret !== -1) {
                tile.dataset.state = 'present';
                secretLetters[indexInSecret] = ''; // Mark as used
                updateKeyState(letter, 'present');
            } else {
                tile.dataset.state = 'absent';
                updateKeyState(letter, 'absent');
            }
        }
    }

    // Mark all tiles as correct (for win condition)
    function markCorrectGuess(rowElement, guess) {
        for (let i = 0; i < 5; i++) {
            const tile = rowElement.children[i];
            tile.dataset.state = 'correct';
            updateKeyState(guess[i], 'correct');
        }
    }

    // Update keyboard key state
    function updateKeyState(key, state) {
        const keys = keyboard.querySelectorAll(`[data-key="${key}"]`);
        keys.forEach(keyElement => {
            if (keyElement.dataset.state !== 'correct') { // Correct state takes precedence
                keyElement.dataset.state = state;
            }
        });
    }

    // Event listeners
    startButton.addEventListener('click', startGame);
    
    secretWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (!gameStarted || gameOver) return;
        
        if (e.key === 'Enter') {
            handleKeyPress('ENTER');
        } else if (e.key === 'Backspace') {
            handleKeyPress('BACKSPACE');
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            handleKeyPress(e.key.toUpperCase());
        }
    });
    
    // Virtual keyboard event delegation
    keyboard.addEventListener('click', (e) => {
        if (!gameStarted || gameOver) return;
        
        const keyElement = e.target.closest('.key');
        if (!keyElement) return;
        
        const key = keyElement.dataset.key;
        if (key) {
            handleKeyPress(key);
        }
    });

    // Initialize the game UI
    initializeBoard();
});

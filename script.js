let secretWord = "";
let currentGuess = "";
let guesses = [];
let shareButton;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("word")) {
        secretWord = urlParams.get("word").toUpperCase();
        startGame(true);
    }

    document.getElementById("start-game").addEventListener("click", () => {
        const inputWord = document.getElementById("custom-word").value.trim().toUpperCase();
        if (inputWord.length === 5 && /^[A-Z]+$/.test(inputWord)) {
            secretWord = inputWord;
            startGame(false);
        } else {
            alert("Please enter a valid 5-letter word.");
        }
    });
});

function startGame(fromLink) {
    document.getElementById("setup-section").style.display = "none";
    createBoard();
    createKeyboard();
    createShareButton();
    if (fromLink) {
        document.getElementById("board").scrollIntoView({ behavior: "smooth" });
    }
}

function createBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";
    for (let i = 0; i < 30; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        board.appendChild(tile);
    }
}

function createKeyboard() {
    const keyboardLayout = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";

    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement("div");
        row.split("").forEach(key => {
            const keyButton = document.createElement("button");
            keyButton.textContent = key;
            keyButton.classList.add("key");
            keyButton.addEventListener("click", () => handleKeyPress(key));
            rowDiv.appendChild(keyButton);
        });

        if (row === "ZXCVBNM") {
            const enterButton = document.createElement("button");
            enterButton.textContent = "Enter";
            enterButton.classList.add("key");
            enterButton.addEventListener("click", handleEnter);
            rowDiv.appendChild(enterButton);

            const backButton = document.createElement("button");
            backButton.textContent = "⌫";
            backButton.classList.add("key");
            backButton.addEventListener("click", handleBackspace);
            rowDiv.appendChild(backButton);
        }

        keyboard.appendChild(rowDiv);
    });

    document.addEventListener("keydown", (event) => {
        if (/^[a-zA-Z]$/.test(event.key)) {
            handleKeyPress(event.key.toUpperCase());
        } else if (event.key === "Enter") {
            handleEnter();
        } else if (event.key === "Backspace") {
            handleBackspace();
        }
    });
}

function handleKeyPress(key) {
    if (currentGuess.length < 5) {
        currentGuess += key;
        updateBoard();
    }
}

function handleBackspace() {
    currentGuess = currentGuess.slice(0, -1);
    updateBoard();
}

function handleEnter() {
    if (currentGuess.length !== 5) return;
    checkGuess();
    currentGuess = "";
    updateBoard();
}

function updateBoard() {
    const boardTiles = document.querySelectorAll(".tile");
    boardTiles.forEach((tile, index) => {
        tile.textContent = "";
    });

    guesses.forEach((guess, guessIndex) => {
        guess.split("").forEach((letter, i) => {
            const tile = boardTiles[guessIndex * 5 + i];
            tile.textContent = letter;
        });
    });

    currentGuess.split("").forEach((letter, i) => {
        const tile = boardTiles[guesses.length * 5 + i];
        tile.textContent = letter;
    });
}

function checkGuess() {
    const boardTiles = document.querySelectorAll(".tile");
    const guessIndex = guesses.length;
    const guessArray = currentGuess.split("");

    guessArray.forEach((letter, i) => {
        const tile = boardTiles[guessIndex * 5 + i];
        if (letter === secretWord[i]) {
            tile.classList.add("correct");
        } else if (secretWord.includes(letter)) {
            tile.classList.add("present");
        } else {
            tile.classList.add("absent");
        }
    });

    guesses.push(currentGuess);

    if (currentGuess === secretWord) {
        setTimeout(() => alert("You guessed it!"), 100);
    } else if (guesses.length === 6) {
        setTimeout(() => alert(`Game over! The word was ${secretWord}`), 100);
    }
}

function createShareButton() {
    shareButton = document.createElement("button");
    shareButton.id = "share-game";
    shareButton.textContent = "Share Game Link";
    shareButton.addEventListener("click", () => {
        const shareURL = `${window.location.origin}${window.location.pathname}?word=${secretWord}`;
        navigator.clipboard.writeText(shareURL).then(() => {
            alert("Link copied to clipboard!");
        });
    });
    document.querySelector(".game-container").appendChild(shareButton);
}

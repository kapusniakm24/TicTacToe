<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TTT</title>
</head>
<style>
    .game {
        width: 300px;
        margin: 50px auto;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
    }


    .board{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        padding: 20px;
    }



    .cell{
        width: 80px;
        height: 80px;
        background-color: #f2f2f2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
    }

    .cell:active{
        transform: translateY(5px)
    }


    .cell:hover{
        background-color: #e0dddd ;
    }


    .result {
        font-size: 30px;
        margin-top: 5px;
    }


    .reset-btn {
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
    }

    .reset-btn:hover {
        background-color: #45a049;
    }

    .mode-btn {
        margin-top: 10px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 5px;
    }

    .mode-btn:hover {
        background-color: #0b7dda;
    }

    
</style>
<body>
    <div class="game">
        <h1>Tic Tac Toe</h1>
        <div class="board" id="board">
            <div class="cell" data-index="0"></div>
            <div class="cell" data-index="1"></div>
            <div class="cell" data-index="2"></div>
            <div class="cell" data-index="3"></div>
            <div class="cell" data-index="4"></div>
            <div class="cell" data-index="5"></div>
            <div class="cell" data-index="6"></div>
            <div class="cell" data-index="7"></div>
            <div class="cell" data-index="8"></div>
        </div>
        <div class="result" id="result">Player X's turn</div>
        <button class="reset-btn" id="resetbtn">Reset Game</button>
        <button class="mode-btn" id="modebtn">Switch to vs Computer</button>
    </div>
    <script>
        const board = document.getElementById('board');
        const resultElement = document.getElementById('result');
        const modeBtn = document.getElementById('modebtn');
        let currentPlayer = 'X';
        let gameState = ['', '', '', '', '', '', '', '', ''];
        let isVsComputer = false;
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        function handleClick(e) {
            if (e.target.classList.contains('cell')) {
                const index = e.target.getAttribute('data-index');
                if (gameState[index] === '' && (!isVsComputer || currentPlayer === 'X')) {
                    gameState[index] = currentPlayer;
                    e.target.textContent = currentPlayer;
                    if (checkWin()) {
                        resultElement.textContent = `Player ${currentPlayer} wins!`;
                        board.removeEventListener('click', handleClick);
                    } else if (gameState.every(cell => cell !== '')) {
                        resultElement.textContent = "It's a tie!";
                    } else {
                        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                        resultElement.textContent = `Player ${currentPlayer}'s turn`;
                        if (isVsComputer && currentPlayer === 'O') {
                            setTimeout(makeComputerMove, 500);
                        }
                    }
                }
            }
        }

        board.addEventListener('click', handleClick);

        function checkWin() {
            return winningCombinations.some(combination => {
                return combination.every(index => gameState[index] === currentPlayer);
            });
        }

        function makeComputerMove() {
            const bestMove = getBestMove();
            if (bestMove !== -1) {
                gameState[bestMove] = 'O';
                document.querySelector(`[data-index="${bestMove}"]`).textContent = 'O';
                if (checkWin()) {
                    resultElement.textContent = 'Computer wins!';
                    board.removeEventListener('click', handleClick);
                } else if (gameState.every(cell => cell !== '')) {
                    resultElement.textContent = "It's a tie!";
                } else {
                    currentPlayer = 'X';
                    resultElement.textContent = `Player ${currentPlayer}'s turn`;
                }
            }
        }

        function getBestMove() {
            
            for (let i = 0; i < 9; i++) {
                if (gameState[i] === '') {
                    gameState[i] = 'O';
                    if (checkWin()) {
                        gameState[i] = '';
                        return i;
                    }
                    gameState[i] = '';
                }
            }
           
            for (let i = 0; i < 9; i++) {
                if (gameState[i] === '') {
                    gameState[i] = 'X';
                    if (checkWin()) {
                        gameState[i] = '';
                        return i;
                    }
                    gameState[i] = '';
                }
            }
            
            if (gameState[4] === '') return 4;
            
            const corners = [0, 2, 6, 8];
            for (let corner of corners) {
                if (gameState[corner] === '') return corner;
            }
            
            for (let i = 0; i < 9; i++) {
                if (gameState[i] === '') return i;
            }
            return -1;
        }

        function resetGame() {
            gameState = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            resultElement.textContent = `Player ${currentPlayer}'s turn`;
            document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
            board.addEventListener('click', handleClick);
        }

        function toggleMode() {
            isVsComputer = !isVsComputer;
            modeBtn.textContent = isVsComputer ? 'Switch to 2 Players' : 'Switch to vs Computer';
            resetGame();
        }

        document.getElementById('resetBtn').addEventListener('click', resetGame);
        modeBtn.addEventListener('click', toggleMode);



    </script>
</body>
</html>

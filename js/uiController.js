class UIController {
    constructor(gameLogic) {
        this.game = gameLogic;
        this.canvas = null;
        this.ctx = null;
        this.cellSize = 0;
        this.boardOffset = 0;

        this.elements = {
            currentPlayer: null,
            gameStatus: null,
            moveHistory: null,
            newGameBtn: null,
            undoBtn: null,
            resetBtn: null
        };

        this.init();
    }

    init() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');

        this.elements.currentPlayer = document.getElementById('current-player');
        this.elements.gameStatus = document.getElementById('game-status');
        this.elements.moveHistory = document.getElementById('move-history');
        this.elements.newGameBtn = document.getElementById('new-game-btn');
        this.elements.undoBtn = document.getElementById('undo-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');

        this.calculateBoardDimensions();
        this.setupEventListeners();
        this.updateUI();
        this.drawBoard();
    }

    calculateBoardDimensions() {
        const canvasSize = Math.min(this.canvas.width, this.canvas.height);
        this.boardOffset = 30;
        this.cellSize = (canvasSize - 2 * this.boardOffset) / (this.game.BOARD_SIZE - 1);
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.elements.undoBtn.addEventListener('click', () => this.undoMove());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());

        window.addEventListener('resize', () => {
            this.calculateBoardDimensions();
            this.drawBoard();
        });
    }

    handleCanvasClick(event) {
        if (this.game.isGameOver()) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const { row, col } = this.getGridPosition(x, y);

        if (row !== -1 && col !== -1) {
            this.makeMove(row, col);
        }
    }

    getGridPosition(x, y) {
        const col = Math.round((x - this.boardOffset) / this.cellSize);
        const row = Math.round((y - this.boardOffset) / this.cellSize);

        if (row >= 0 && row < this.game.BOARD_SIZE && col >= 0 && col < this.game.BOARD_SIZE) {
            return { row, col };
        }

        return { row: -1, col: -1 };
    }

    makeMove(row, col) {
        const result = this.game.makeMove(row, col);

        if (result.success) {
            this.drawBoard();
            this.updateMoveHistory();
            this.updateUI();

            if (result.gameOver) {
                this.showGameOverDialog(result.message);
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.game.BOARD_SIZE; i++) {
            const pos = this.boardOffset + i * this.cellSize;

            this.ctx.beginPath();
            this.ctx.moveTo(this.boardOffset, pos);
            this.ctx.lineTo(this.boardOffset + (this.game.BOARD_SIZE - 1) * this.cellSize, pos);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.boardOffset);
            this.ctx.lineTo(pos, this.boardOffset + (this.game.BOARD_SIZE - 1) * this.cellSize);
            this.ctx.stroke();
        }

        this.drawStarPoints();
        this.drawStones();
    }

    drawStarPoints() {
        const starPoints = [
            [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
        ];

        this.ctx.fillStyle = '#000';

        starPoints.forEach(([row, col]) => {
            const x = this.boardOffset + col * this.cellSize;
            const y = this.boardOffset + row * this.cellSize;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    drawStones() {
        for (let row = 0; row < this.game.BOARD_SIZE; row++) {
            for (let col = 0; col < this.game.BOARD_SIZE; col++) {
                const stone = this.game.getBoardValue(row, col);
                if (stone !== this.game.EMPTY) {
                    this.drawStone(row, col, stone);
                }
            }
        }
    }

    drawStone(row, col, player) {
        const x = this.boardOffset + col * this.cellSize;
        const y = this.boardOffset + row * this.cellSize;
        const radius = this.cellSize * 0.4;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);

        if (player === this.game.BLACK) {
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        } else if (player === this.game.WHITE) {
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        const gradient = this.ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );

        if (player === this.game.BLACK) {
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(1, '#000');
        } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    updateUI() {
        this.elements.currentPlayer.textContent = this.game.getCurrentPlayerName();
        this.elements.currentPlayer.style.color = this.game.getCurrentPlayer() === this.game.BLACK ? '#000' : '#666';

        if (this.game.isGameOver()) {
            const winner = this.game.getWinner();
            if (winner) {
                this.elements.gameStatus.textContent = `${this.game.getPlayerName(winner)} 승리!`;
                this.elements.gameStatus.style.color = '#e74c3c';
            } else {
                this.elements.gameStatus.textContent = '무승부';
                this.elements.gameStatus.style.color = '#f39c12';
            }
        } else {
            this.elements.gameStatus.textContent = '게임 진행 중';
            this.elements.gameStatus.style.color = '#27ae60';
        }

        this.elements.undoBtn.disabled = this.game.getMoveHistory().length === 0;
    }

    updateMoveHistory() {
        const history = this.game.getMoveHistory();
        this.elements.moveHistory.innerHTML = '';

        history.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.className = `move-item ${move.player === this.game.BLACK ? 'black' : 'white'}`;

            const playerName = this.game.getPlayerName(move.player);
            const position = `${String.fromCharCode(65 + move.col)}${move.row + 1}`;

            moveElement.innerHTML = `
                <strong>${index + 1}.</strong> ${playerName} - ${position}
            `;

            this.elements.moveHistory.appendChild(moveElement);
        });

        this.elements.moveHistory.scrollTop = this.elements.moveHistory.scrollHeight;
    }

    startNewGame() {
        this.game.resetGame();
        this.drawBoard();
        this.updateUI();
        this.updateMoveHistory();
        this.hideGameOverDialog();
        this.showMessage('새 게임이 시작되었습니다!', 'success');
    }

    undoMove() {
        const result = this.game.undoMove();

        if (result.success) {
            this.drawBoard();
            this.updateUI();
            this.updateMoveHistory();
            this.hideGameOverDialog();
            this.showMessage('한 수를 물렀습니다.', 'info');
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    resetGame() {
        if (confirm('정말로 게임을 초기화하시겠습니까?')) {
            this.startNewGame();
        }
    }

    showGameOverDialog(message) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        const dialog = document.createElement('div');
        dialog.className = 'winner-announcement';
        dialog.innerHTML = `
            <h2>🎉 게임 종료!</h2>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove(); uiController.startNewGame();">
                새 게임 시작
            </button>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    hideGameOverDialog() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        switch(type) {
            case 'success':
                messageDiv.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#e74c3c';
                break;
            case 'info':
                messageDiv.style.backgroundColor = '#3498db';
                break;
            default:
                messageDiv.style.backgroundColor = '#95a5a6';
        }

        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}
class OmokGame {
    constructor() {
        this.BOARD_SIZE = 15;
        this.EMPTY = 0;
        this.BLACK = 1;
        this.WHITE = 2;

        this.board = [];
        this.currentPlayer = this.BLACK;
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];

        this.initializeBoard();
    }

    initializeBoard() {
        this.board = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                this.board[i][j] = this.EMPTY;
            }
        }
    }

    makeMove(row, col) {
        if (this.gameOver) {
            return { success: false, message: "게임이 이미 종료되었습니다." };
        }

        if (row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE) {
            return { success: false, message: "잘못된 위치입니다." };
        }

        if (this.board[row][col] !== this.EMPTY) {
            return { success: false, message: "이미 돌이 놓여진 자리입니다." };
        }

        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });

        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            return {
                success: true,
                gameOver: true,
                winner: this.currentPlayer,
                message: `${this.getPlayerName(this.currentPlayer)}이 승리했습니다!`
            };
        }

        if (this.isBoardFull()) {
            this.gameOver = true;
            return {
                success: true,
                gameOver: true,
                winner: null,
                message: "무승부입니다!"
            };
        }

        this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;

        return {
            success: true,
            gameOver: false,
            nextPlayer: this.currentPlayer
        };
    }

    checkWin(row, col) {
        const directions = [
            [0, 1],   // 가로
            [1, 0],   // 세로
            [1, 1],   // 대각선 \
            [1, -1]   // 대각선 /
        ];

        const player = this.board[row][col];

        for (let [dx, dy] of directions) {
            let count = 1;

            // 한 방향으로 체크
            let newRow = row + dx;
            let newCol = col + dy;
            while (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === player) {
                count++;
                newRow += dx;
                newCol += dy;
            }

            // 반대 방향으로 체크
            newRow = row - dx;
            newCol = col - dy;
            while (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === player) {
                count++;
                newRow -= dx;
                newCol -= dy;
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
    }

    isBoardFull() {
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (this.board[i][j] === this.EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }

    undoMove() {
        if (this.moveHistory.length === 0) {
            return { success: false, message: "무를 수 있는 수가 없습니다." };
        }

        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = this.EMPTY;

        this.gameOver = false;
        this.winner = null;
        this.currentPlayer = lastMove.player;

        return {
            success: true,
            undoneMove: lastMove,
            currentPlayer: this.currentPlayer
        };
    }

    resetGame() {
        this.initializeBoard();
        this.currentPlayer = this.BLACK;
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];

        return { success: true, message: "게임이 초기화되었습니다." };
    }

    getPlayerName(player) {
        switch(player) {
            case this.BLACK: return "흑돌";
            case this.WHITE: return "백돌";
            default: return "없음";
        }
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    getCurrentPlayerName() {
        return this.getPlayerName(this.currentPlayer);
    }

    getGameState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner,
            moveHistory: this.moveHistory
        };
    }

    getBoardValue(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.board[row][col];
        }
        return null;
    }

    getMoveHistory() {
        return [...this.moveHistory];
    }

    isGameOver() {
        return this.gameOver;
    }

    getWinner() {
        return this.winner;
    }
}
let game;
let uiController;

document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    addKeyboardShortcuts();
});

function initializeGame() {
    try {
        game = new OmokGame();
        uiController = new UIController(game);

        console.log('오목 게임이 성공적으로 초기화되었습니다.');

        showWelcomeMessage();
    } catch (error) {
        console.error('게임 초기화 중 오류 발생:', error);
        showErrorMessage('게임을 시작할 수 없습니다. 페이지를 새로고침해주세요.');
    }
}

function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey || event.metaKey) {
            switch(event.key.toLowerCase()) {
                case 'n':
                    event.preventDefault();
                    uiController.startNewGame();
                    break;
                case 'z':
                    event.preventDefault();
                    uiController.undoMove();
                    break;
                case 'r':
                    event.preventDefault();
                    uiController.resetGame();
                    break;
            }
        }

        switch(event.key) {
            case 'Escape':
                uiController.hideGameOverDialog();
                break;
        }
    });
}

function showWelcomeMessage() {
    setTimeout(() => {
        uiController.showMessage('오목 게임에 오신 것을 환영합니다!', 'info');
    }, 500);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
        font-size: 18px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;

    errorDiv.innerHTML = `
        <h3>오류 발생</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            margin-top: 15px;
            padding: 10px 20px;
            background: white;
            color: #e74c3c;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        ">새로고침</button>
    `;

    document.body.appendChild(errorDiv);
}

window.addEventListener('beforeunload', function(event) {
    if (game && game.getMoveHistory().length > 0 && !game.isGameOver()) {
        event.preventDefault();
        event.returnValue = '진행 중인 게임이 있습니다. 정말로 페이지를 떠나시겠습니까?';
        return event.returnValue;
    }
});

window.addEventListener('error', function(event) {
    console.error('전역 오류 발생:', event.error);
    showErrorMessage('예상치 못한 오류가 발생했습니다.');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('처리되지 않은 Promise 오류:', event.reason);
    showErrorMessage('비동기 작업 중 오류가 발생했습니다.');
});

function getGameStats() {
    if (!game) return null;

    return {
        totalMoves: game.getMoveHistory().length,
        currentPlayer: game.getCurrentPlayerName(),
        gameOver: game.isGameOver(),
        winner: game.getWinner() ? game.getPlayerName(game.getWinner()) : null,
        boardState: game.getGameState()
    };
}

function exportGameState() {
    const stats = getGameStats();
    if (!stats) {
        uiController.showMessage('게임 상태를 내보낼 수 없습니다.', 'error');
        return;
    }

    const gameData = {
        timestamp: new Date().toISOString(),
        gameStats: stats,
        moveHistory: game.getMoveHistory()
    };

    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `omok-game-${new Date().toISOString().slice(0, 19)}.json`;
    link.click();

    uiController.showMessage('게임 상태가 내보내기되었습니다.', 'success');
}

console.log('오목 게임 애플리케이션 로드 완료');
console.log('키보드 단축키:');
console.log('- Ctrl+N: 새 게임');
console.log('- Ctrl+Z: 무르기');
console.log('- Ctrl+R: 초기화');
console.log('- ESC: 대화상자 닫기');
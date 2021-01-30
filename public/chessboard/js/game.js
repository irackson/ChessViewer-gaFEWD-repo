window.onload = function () {

    const fenArray = getGame();

    var blackRook = document.createElement('img');
    var blackNight = document.createElement('img');
    var blackBishop = document.createElement('img');
    var blackQueen = document.createElement('img');
    var blackKing = document.createElement('img');
    var blackPawn = document.createElement('img');

    var whitePawn = document.createElement('img');
    var whiteRook = document.createElement('img');
    var whiteNight = document.createElement('img');
    var whiteBishop = document.createElement('img');
    var whiteQueen = document.createElement('img');
    var whiteKing = document.createElement('img');

    drawBoard();
    createPieces();
    autoPlay(1000);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function autoPlay(delay) {
        for (let i = 0; i < fenArray.length; i++) {
            drawState(fenArray[i]);
            await sleep(delay);
        }
    }

    function createPieces() {
        blackRook.setAttribute('src', 'icon/black/rook.svg');
        blackNight.setAttribute('src', 'icon/black/night.svg');
        blackBishop.setAttribute('src', 'icon/black/bishop.svg');
        blackQueen.setAttribute('src', 'icon/black/queen.svg');
        blackKing.setAttribute('src', 'icon/black/king.svg');
        blackPawn.setAttribute('src', 'icon/black/pawn.svg');

        whitePawn.setAttribute('src', 'icon/white/pawn.svg');
        whiteRook.setAttribute('src', 'icon/white/rook.svg');
        whiteNight.setAttribute('src', 'icon/white/night.svg');
        whiteBishop.setAttribute('src', 'icon/white/bishop.svg');
        whiteQueen.setAttribute('src', 'icon/white/queen.svg');
        whiteKing.setAttribute('src', 'icon/white/king.svg');

    }

    function clearPieces() {
        for (let i = 0; i < 64; i++) {
            document.getElementById(i.toString()).innerHTML = "";
        }
    }

    function drawState(fenString) {
        clearPieces();
        let count = 0;
        const moveString = fenString.split(' ')[0];
        const movesByRowArray = moveString.split('/');
        for (let r = 0; r < movesByRowArray.length; r++) {
            const movesByColArray = movesByRowArray[r].split('');
            for (let c = 0; c < movesByColArray.length; c++) {
                let target = movesByColArray[c];
                if (!parseInt(target)) {
                    switch (target) {
                        case 'r':
                            document.getElementById(count.toString()).append(blackRook.cloneNode(true));
                            break;
                        case 'n':
                            document.getElementById(count.toString()).append(blackNight.cloneNode(true));
                            break;
                        case 'b':
                            document.getElementById(count.toString()).append(blackBishop.cloneNode(true));
                            break;
                        case 'q':
                            document.getElementById(count.toString()).append(blackQueen.cloneNode(true));
                            break;
                        case 'k':
                            document.getElementById(count.toString()).append(blackKing.cloneNode(true));
                            break;
                        case 'p':
                            document.getElementById(count.toString()).append(blackPawn.cloneNode(true));
                            break;
                        case 'R':
                            document.getElementById(count.toString()).append(whiteRook.cloneNode(true));
                            break;
                        case 'N':
                            document.getElementById(count.toString()).append(whiteNight.cloneNode(true));
                            break;
                        case 'B':
                            document.getElementById(count.toString()).append(whiteBishop.cloneNode(true));
                            break;
                        case 'Q':
                            document.getElementById(count.toString()).append(whiteQueen.cloneNode(true));
                            break;
                        case 'K':
                            document.getElementById(count.toString()).append(whiteKing.cloneNode(true));
                            break;
                        case 'P':
                            document.getElementById(count.toString()).append(whitePawn.cloneNode(true));
                            break;
                    };
                    count++;
                } else {
                    for (let i = 0; i < parseInt(target); i++) {
                        count++;
                    }
                }
            }
        }
    }

    function drawBoard() {
        let squareNum = 0;
        const boardElm = document.createElement('div');
        boardElm.setAttribute('id', 'board');
        for (let r = 0; r < 8; r++) {
            const rowElm = document.createElement('ul');
            for (let c = 0; c < 8; c++) {
                const colElm = document.createElement('li');
                colElm.setAttribute('id', squareNum.toString());
                if (r % 2 === 0) {
                    if (c % 2 === 0) {
                        colElm.setAttribute('style', 'background-color: rgb(232,235,239)');
                    }
                    else {
                        colElm.setAttribute('style', 'background-color: rgb(125,135,150)');
                    }
                } else {
                    if (c % 2 === 0) {
                        colElm.setAttribute('style', 'background-color: rgb(125,135,150)');
                    } else {
                        colElm.setAttribute('style', 'background-color: rgb(232,235,239)');
                    }
                }
                rowElm.appendChild(colElm);
                squareNum++;
            }
            boardElm.appendChild(rowElm);
        }
        document.getElementById('board-container').append(boardElm);
    }

    function getGame() {
        let fenArray = [];
        for (var i = 0; i < localStorage.length; i++) {
            const boardState = localStorage.getItem(i.toString());
            fenArray.push(boardState.replace(/,/g, '. '));
        };
        localStorage.clear();
        sessionStorage.clear();
        return fenArray;
    }
}
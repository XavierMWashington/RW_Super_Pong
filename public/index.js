const BG_COLOR = '#3333ff';
const PADDLE_COLOR = '#33ff33';
const BALL_COLOR = '#ff3333';



const socket = io('https://super-pong-app.herokuapp.com/');
socket.on('canvas_size', setCanvasSize);
socket.on('gameStart', ridGeneralHud); //Also activates the bothPlayersIn Boolean
socket.on('gameState', handleGameState);
socket.on('gameCode', handleGameCode);
socket.on('gameOver', handleGameOver);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('game-screen');
let gameInitialized;
let gameActive = false;
let gameWin;
let bothPlayersIn;
let countDown;


const initialScreen = document.getElementById('initial-screen');
const manualScreen = document.getElementById('manual-screen');
const newGameButton = document.getElementById('new-game-button');
const joinGameButton = document.getElementById('join-game-button');
const gameCodeInput = document.getElementById('game-code-input');
const gameCodeDisplay = document.getElementById('game-code');
const generalHud = document.getElementById('general-hud');
const generalText = document.getElementById('general-text');
const hudBackButton = document.getElementById('hud-back-button');
const manualBackButton = document.getElementById('manual-back-button');
const manualButton = document.getElementById('manual-screen-button');

newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);
hudBackButton.addEventListener('click', resetGame);
manualButton.addEventListener('click', displayManualScreen);
manualBackButton.addEventListener('click', resetGame);

let canvas, contex;
let canvasSize;
let playerNumber;

function newGame(){
    generalHud.style.display = 'flex';
    playerNumber = 1;
    socket.emit('newGame');
    init();
}

function joinGame(){
    generalHud.style.display = 'none';
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    playerNumber = 2;
    init();
}


function handleGameState(gamestate){
    if(!gameActive) return;

    let gameState = JSON.parse(gamestate);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode;
}

function handleGameOver(victor){

    if(!gameActive) return;

    document.removeEventListener('keydown', keydown);
    document.removeEventListener('keyup', keyup);

    victor = JSON.parse(victor);
    if(victor["victor"] === playerNumber){
        gameWin = true;
        generalHud.style.display = "flex";
        generalText.innerText = "You win!";
        // location.reload();
        return
    }
    gameWin = false;
    generalHud.style.display = "flex";
    generalText.innerText = "You lose";
    // location.reload();
}

function handleUnknownGame(){
    resetGame();
    alert("Game code has found no match");
}

function handleTooManyPlayers(){
    resetGame();
    alert("This room is already full");
}

function ridGeneralHud(){
    generalHud.style.display = "none";
    bothPlayersIn = true;
}

function resetGame(){
    countDown = 4;
    bothPlayersIn = false;
    gameActive = false;
    playerNumber = null;
    gameCodeInput.value = '';
    gameCodeDisplay.innerText = '';
    initialScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    generalHud.style.display = "flex";
    manualScreen.style.display = "none";
    generalText.innerText = "Waiting for second player...";
}

function displayManualScreen(){
    initialScreen.style.display ="none";
    manualScreen.style.display = "block";
}

function init(){
    gameCodeDisplay.style.userSelect = 'none';
    gameScreen.style.userSelect = 'none';

    initialScreen.style.display = "none";
    manualScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    contex = canvas.getContext("2d");

    canvas.width = canvas.height = canvasSize;

    contex.fillStyle = BG_COLOR;
    contex.fillRect(0, 0, canvas.width, canvas.height);
    
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);


    countDown = 4;

    const intervalCount = setInterval(() => {
        generalHud.style.display = "flex";
        //console.log(countDown);
        if(!bothPlayersIn) return;
        countDown -= 1;
        generalText.innerText = "Game starting in " + countDown + " seconds"; 
        if(countDown <= 0){
            clearInterval(intervalCount);
            generalHud.style.display = "none";
            gameInitialized = true;
            gameActive = true;
        }
    }, 1000);
}

function keydown(e){
    socket.emit('keydown', e.keyCode);
}

function keyup(e){
    socket.emit('keyup');
}

function setCanvasSize(canvas_size){
    canvasSize = parseInt(canvas_size);
}

function paintGame(state) {
    if(gameInitialized){
        contex.fillStyle = BG_COLOR;
        contex.fillRect(0, 0, canvas.width, canvas.height);

        //painting the ball 
        const ball = state.ball;

        contex.fillStyle = BALL_COLOR;
        contex.fillRect(ball.pos.x, ball.pos.y, ball.size, ball.size);

        //painting the player
        const playerOne = state.players[0];

        contex.fillStyle = PADDLE_COLOR;
        contex.fillRect(playerOne.pos.x, playerOne.pos.y, playerOne.size.x, playerOne.size.y);

        const playerTwo = state.players[1];
        contex.fillRect(playerTwo.pos.x, playerTwo.pos.y, playerTwo.size.x, playerTwo.size.y);
    }
}



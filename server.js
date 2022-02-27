const express = require('express')();
const httpServer = require('http').createServer(express);

const { FRAME_RATE, CANVAS_SIZE } = require('./constant');
const { gameLoop } = require('./game');
const { createGameState, getUpdatedVelocity } = require('./game');
const { makeID } = require('./utils');

const gameState = {};
const clientRooms = {};
let winner;
let activation;
let gameStarted = false;
let frameActivation = false;

const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true

    }
});

//Major note!!!
    //The "client" is actually called the socket in normal circumstances. 
        //So keep that in mind

io.on('connection', client =>{
    client.emit('canvas_size', JSON.stringify(CANVAS_SIZE));
    // client.emit('init', {data: 'hello, world'});
    //const gameState = createGameState();

    client.on('keydown', handleKeydown);
    client.on('keyup', keyUp);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('gameon', () => gameStarted = true)

    console.log("Connected");
    console.log(String.fromCharCode(1));

    let roomName = "null";
    gameState[roomName] = createGameState();

    function handleJoinGame(joinCode){
        client.emit("gameStart");
        frameActivation = false;
        gameStarted = false;

        const tempCode = new Array(joinCode.length);

        for(i = 0; i < joinCode.length; i++){
            tempCode[i] = joinCode[i].toUpperCase();
        }

        joinCode = tempCode.join('');

        const room = io.sockets.adapter.rooms.get(joinCode);

        let roomValue;
        
        try{
            roomValue = Array.from(room);

        } catch (err){
            client.emit('unknownGame');
            return;
        }

        // console.log( typeof roomValue );
        // console.log("Object's value: " + roomValue[0]);
        
        let allUsers;
        if(room){
            //the key is the client's id 
            //The object itself is the client
            allUsers = roomValue.length;
        }

        let numClients = 0;

        if(allUsers){
            numClients = allUsers;
        }

        if (numClients > 1){
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = joinCode;

        client.join(joinCode);
        client.to(roomValue).emit("gameStart");
        client.emit("gameStart");
        client.number = 2;

        startGameInterval(joinCode);
        
    }

    function handleNewGame(){
        roomName = makeID(5).join('');
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        frameActivation = false;
        gameStarted = false;


        gameState[roomName] = createGameState();

        client.join(roomName);

        client.number = 1;
        client.emit('init', 1);

        //startGameInterval(roomName);
    }

    function keyUp(){
        const roomName =  clientRooms[client.id];

        activation = false;

        if(!roomName){
            return;
        }

        if(!winner && gameState[roomName]){
            gameState[roomName].players[client.number - 1].vel = 0;         
        }
    }


    function handleKeydown(keyCode){
        const roomName =  clientRooms[client.id];

        if(!roomName){
            return;
        }

        if(!winner){
            try{
                keyCode = parseInt(keyCode);
            } catch (err){
                console.log(err);
                return;
            }

            let player;
            let ball;

            try {
                player = gameState[roomName].players[client.number - 1];
                ball = gameState[roomName].ball;
            } catch (TypeError){
                return;
            }
   
            const velocity = getUpdatedVelocity(keyCode, player);

            if(velocity){
                player.vel = velocity
            } 

            if(player.pos.x <= 0){
                keyUp();
                player.pos.x = 1;
            }

            if(player.pos.x + player.size.x >= CANVAS_SIZE){
                keyUp();
                player.pos.x = CANVAS_SIZE - player.size.x - 1;
            }

            //Warping to other side

            if(player.pos.x < 5 && keyCode === 32 && !activation){
                player.pos.x = CANVAS_SIZE - player.size.x - 1;
                activation = true;
            }

            if(player.pos.x > CANVAS_SIZE - player.size.x - 5 && keyCode === 32 && !activation){
                player.pos.x = 1;
                activation = true;
            }

            //Spiking the ball

            if(ball.pos.y > player.pos.y - ball.size - 10 && client.number === 1){
                if(keyCode === 32  && !activation){
                    ball.vel.y = -13;
                    ball.spiked = true;
                }
            }

            if(ball.pos.y < player.pos.y + ball.size + 10 && keyCode === 32 && client.number === 2 && !activation){
                ball.vel.y = 13;
                ball.spiked = true;
            }

            activation = true; //This prevents the spacebar abilities from being abused

        }
    }

    // startGameInterval(client, gameState[roomName]);
});

function startGameInterval(roomNumber){

    const intervalID = setInterval(() => {

        winner = gameLoop(gameState[roomNumber]);
        const ball = gameState[roomNumber].ball;
        if(gameStarted && !frameActivation){
            ball.vel.y = 6;
            frameActivation = true;
        }

        console.log(frameActivation)
        console.log(gameStarted)

        if (!winner){
            emitGameState(roomNumber, gameState[roomNumber]);
        } else {
            emitGameOver(roomNumber, winner);
            frameActivation = false;
            gameStarted = false;
            gameState[roomNumber] = null;
            winner = null;
            clearInterval(intervalID);
        }
    }, FRAME_RATE);
}

function emitGameState(roomNumber, state){
    io.sockets.in(roomNumber).emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, victor){
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({victor}));

}

io.listen(3000);
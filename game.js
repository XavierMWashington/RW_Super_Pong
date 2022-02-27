const { FRAME_RATE, CANVAS_SIZE } = require('./constant');

function createGameState(){
    return {
        players: [{
            pos: {
                x : 250,
                y : 550
            },
            speed: 5,
            vel: 0,
            size: {
                x: 100,
                y: 15
            }
        }, {
            pos: {
                x : 250,
                y : 50
            },
            speed: 5,
            vel: 0,
            size: {
                x: 100,
                y: 15
            }  
        }],
        ball: {
            pos: {
                x: 293,
                y: 250
            },
            size: 15,
            vel: {
                x: 6,
                y: 6
            },
            speed: {
                x: 0,
                y: 6
            },
            centerPass: false,
            spiked: false,
        }
    }  
}

function gameLoop(state){
    if (!state) return;

    const playerOne = state.players[0];
    const playerTwo = state.players[1];
    

    playerOne.pos.x += playerOne.vel;
    playerTwo.pos.x += playerTwo.vel;
    
    const ball = state.ball;

    if(ball.pos.y + ball.size > CANVAS_SIZE){
        return 2;
    }

    if(ball.pos.y < 0){
        return 1;
    }

    ball.pos.y += 1;
    console.log(ball.pos.y)
    ball.pos.x += ball.vel.x;

    //wall collision 

    if(ball.pos.y + ball.size > CANVAS_SIZE || ball.pos.y < 0){
        ball.vel.y *= -1;
    } 

    if(ball.pos.x + ball.size > CANVAS_SIZE || ball.pos.x < 0){
        ball.vel.x *= -1;
    }

    //player collision

        //player one

    // console.log("Rectangle position: " + playerOne.pos.x)
    // console.log(ball.vel.x)
    // console.log(ball.pos.x)

    if(ball.pos.x + ball.size > playerOne.pos.x && ball.pos.x < playerOne.pos.x + playerOne.size.x
        && ball.pos.y + ball.size > playerOne.pos.y && ball.pos.y < playerOne.pos.y){
            ball.vel.y = -ball.speed.y;
            calculateHorizontalImpact(playerOne, ball);
        }

        //player two

    if(ball.pos.x + ball.size > playerTwo.pos.x && ball.pos.x < playerTwo.pos.x + playerTwo.size.x
        && ball.pos.y < playerTwo.pos.y + playerTwo.size.y && ball.pos.y + ball.size > playerTwo.pos.y){
            ball.vel.y = ball.speed.y;
            calculateHorizontalImpact(playerTwo, ball);
        }

    //Spiking logic

    if(ball.y > CANVAS_SIZE * 0.25 && ball.y < CANVAS_SIZE * 0.75){
        ball.centerPass = true;
    }

    //limit ball speed
    if(ball.vel.x >= 10){
        ball.vel.x = 10;
    } 

    if(ball.vel.x <= -10){
        ball.vel.x = 10;
    }
    
}

function calculateHorizontalImpact(player, ball){
    if(ball.pos.x > player.pos.x + (player.size.x * 0.8)){
        ball.vel.x += 4;
    }
    
    if
    (ball.pos.x > player.pos.x + (player.size.x * 0.6)){
        ball.vel.x += 2;
    } 

    if (ball.pos.x < player.pos.x + (player.size.x * 0.4)){
        ball.vel.x -= 2;
    } 

    if (ball.pos.x < player.pos.x + (player.size.x * 0.2)){
        ball.vel.x -= 4;
    } 
}

function getUpdatedVelocity(keyCode, player){

    
    switch(keyCode){ //left
        case 37: {
            player.vel = -1 * player.speed;
            break;
        }
        case 65: {
            player.vel = -1 * player.speed;
            break;
        }
        case 39: { //right
            player.vel = player.speed;
            break;
        }
        case 68: {
            player.vel = player.speed;
            break;    
        }
    }
}

/************
 * Special abilities that consumes meter
 * Popping from one side of the screen to the other
 * Spiking the ball
 * Shooting a ranged paddle
 */

module.exports = {
    createGameState,
    getUpdatedVelocity,
    gameLoop
}

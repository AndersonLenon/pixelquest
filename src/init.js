import { keyDownUp, hasKey } from "./keyboard";
import { loadImage, loadAudio } from "./loaderAssets";

let CTX;
let CANVAS;
const FRAMES = 60;
let gameoverSound, enemySound, lifeSound, themeSound;

let personagemImage = null;
let cloudImage = null;
let bgImage = null;
let personagemPositionY = 0;
let personagemPositionVertical = 0; 
let backgroundPositionX = 0;
let cloudPositionX = 0;
let cellWidth = 50;
let cellHeight = 50;
let totalSprites = 4;
let x = 0;
let y = 0;
let personagemVelocity = 5;
let stepCounter = 0;
const stepInterval = 10;
let score = 0;

const ITEM_SIZE = 20;
const START_LIFE = 100;
const DAMAGE = 20;
const ITEM_BONUS = 20;
const ENEMY_SPEED_MULTIPLIER = 1;  
const ITEM_SPEED_MULTIPLIER = 1;   
const ENEMY_SPAWN_INTERVAL = 2000; 
const ITEM_SPAWN_INTERVAL = 5000;  
const ITEM_SPAWN_CHANCE = 0.01;    

let isJumping = false;
let jumpVelocity = 0;
const jumpStrength = 15;
const gravity = 0.8;
const groundY = 200;

let player = {
    x: personagemPositionY,
    y: personagemPositionVertical,
    width: 70,
    height: 70,
    life: START_LIFE
};

let enemies = [];
let items = [];
let gameOver = false;

let lastEnemySpawnTime = 0;
let lastItemSpawnTime = 0;

const init = async () => {
    CANVAS = document.querySelector('canvas');
    CTX = CANVAS.getContext('2d');
    personagemImage = await loadImage('img/personagem.png');
    bgImage = await loadImage('img/grama.jpg');
    cloudImage = await loadImage('img/nuvens.png');
    gameoverSound = await loadAudio('sounds/gameover.mp3');
    enemySound = await loadAudio('sounds/inimigo.mp3');
    lifeSound = await loadAudio('sounds/vida.mp3');
    themeSound = await loadAudio('sounds/tema.mp3');

    themeSound.loop = true;
    themeSound.play();

    personagemPositionY = CANVAS.width / 2 - cellWidth / 2;
    personagemPositionVertical = CANVAS.height - groundY - cellHeight;
    player.x = personagemPositionY;
    player.y = personagemPositionVertical;
    keyDownUp(CANVAS);
    loop();
};

const drawRepeatedImage = (image, x, y, imageWidth, imageHeight) => {
    let posX = x % imageWidth;
    if (posX > 0) posX -= imageWidth;

    for (let i = 0; i <= CANVAS.width / imageWidth + 1; i++) {
        CTX.drawImage(image, posX + i * imageWidth, y, imageWidth, imageHeight);
    }
};

const createEnemy = () => {
    if (enemies.length === 0) {
        const x = CANVAS.width;
        const y = CANVAS.height / 2 -30 ;
        enemies.push({ x, y, width: 30, height: 30 });
    }
};

const createItem = () => {
    const x = CANVAS.width;
    const y = CANVAS.height - groundY - ITEM_SIZE - Math.random() * (CANVAS.height - groundY - ITEM_SIZE);
    items.push({ x, y, width: ITEM_SIZE, height: ITEM_SIZE });
};

const drawEnemies = () => {
    CTX.fillStyle = 'red';
    enemies.forEach(enemy => {
        CTX.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
};

const drawItems = () => {
    CTX.fillStyle = 'green';
    items.forEach(item => {
        CTX.fillRect(item.x, item.y, item.width, item.height);
    });
};

const drawScore = () => {
    CTX.fillStyle = 'black';
    CTX.font = '20px Arial';
    CTX.fillText(`Score: ${score}`, CANVAS.width - 100, 20); // Ajuste a posição conforme necessário
};

const drawLife = () => {
    CTX.fillStyle = 'black';
    CTX.font = '20px Arial';
    CTX.fillText(`Vida: ${player.life}`, 10, 20);
};

const checkCollisions = () => {
    enemies.forEach((enemy, index) => {
        // Verifica colisão direta com o inimigo
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            // Verifica se é uma colisão direta
            if (player.y + player.height > enemy.y + enemy.height / 2) {
                // O jogador está colidindo diretamente com o inimigo
                player.life = Math.max(0, player.life - DAMAGE);
                enemies.splice(index, 1);  // Remove o inimigo
                enemySound.play();  // Toca o som do inimigo
            }
        }

        if (player.y + player.height <= enemy.y &&
            player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width) {
            score++;
        }
    });

    items.forEach((item, index) => {
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y + player.height > item.y &&
            player.y < item.y + item.height) {
            if (player.y + player.height > item.y + ITEM_SIZE / 2) {
                player.life = Math.min(100, player.life + ITEM_BONUS);
                items.splice(index, 1);
                lifeSound.play();  // Toca o som de coleta de vida
            }
        }
    });
};

const update = () => {
    if (gameOver) {
        gameoverSound.play();  // Toca o som de game over
        return;
    }

    let moving = false;
    let currentVelocity = personagemVelocity;

    if (hasKey('Shift')) {
        currentVelocity *= 2;
        stepCounter++;
        if (stepCounter >= stepInterval) {
            y = y < totalSprites - 1 ? y + 1 : 0;
            stepCounter = 0;
        }
    }

    if (hasKey('ArrowRight')) {
        backgroundPositionX -= currentVelocity;
        cloudPositionX -= currentVelocity / 5;
        x = 3;
        moving = true;
    }

    if (hasKey('ArrowLeft')) {
        backgroundPositionX += currentVelocity;
        cloudPositionX += currentVelocity / 5;
        x = 1;
        moving = true;
    }

    if (moving) {
        stepCounter++;
        if (stepCounter >= stepInterval) {
            y = y < totalSprites - 1 ? y + 1 : 0;
            stepCounter = 0;
        }
    } else {
        y = 0;
    }

    if (isJumping) {
        personagemPositionVertical -= jumpVelocity;
        jumpVelocity -= gravity;

        if (personagemPositionVertical >= CANVAS.height - groundY - cellHeight) {
            personagemPositionVertical = CANVAS.height - groundY - cellHeight;
            isJumping = false;
            jumpVelocity = 0;
        }
    } else if (hasKey(' ')) {
        isJumping = true;
        jumpVelocity = jumpStrength;
    }

    player.x = personagemPositionY;
    player.y = personagemPositionVertical;

    const currentTime = Date.now();

    if (currentTime - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
        createEnemy();
        lastEnemySpawnTime = currentTime;
    }

    if (currentTime - lastItemSpawnTime > ITEM_SPAWN_INTERVAL && Math.random() < ITEM_SPAWN_CHANCE) {
        createItem();
        lastItemSpawnTime = currentTime;
    }

    enemies.forEach(enemy => {
        if (hasKey('ArrowRight')) {
            enemy.x -= currentVelocity * ENEMY_SPEED_MULTIPLIER;
        } else if (hasKey('ArrowLeft')) {
            enemy.x += currentVelocity * ENEMY_SPEED_MULTIPLIER;
        }
    });

    items.forEach(item => {
        if (hasKey('ArrowRight')) {
            item.x -= currentVelocity * ITEM_SPEED_MULTIPLIER;
        } else if (hasKey('ArrowLeft')) {
            item.x += currentVelocity * ITEM_SPEED_MULTIPLIER;
        }
    });

    enemies = enemies.filter(enemy => enemy.x + enemy.width > 0);
    items = items.filter(item => item.x + item.width > 0);

    checkCollisions();

    if (player.life <= 0) {
        gameOver = true;
        alert('Game Over!');
    }
};

const loop = () => {
    setTimeout(() => {
        update();

        drawRepeatedImage(cloudImage, cloudPositionX, 0, cloudImage.width, 220, cloudImage.height);
        drawRepeatedImage(bgImage, backgroundPositionX, 200, bgImage.width, bgImage.height);

        CTX.drawImage(
            personagemImage,
            x * cellWidth,
            y * cellHeight,
            cellWidth,
            cellHeight,
            personagemPositionY,
            personagemPositionVertical,
            70,
            70
        );

        drawEnemies();
        drawItems();
        drawLife();
        drawScore();

        requestAnimationFrame(loop);
    }, 1000 / FRAMES);
};

export { init };

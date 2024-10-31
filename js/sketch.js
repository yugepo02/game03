let player;
let platforms = [];
let obstacles = []; // 障害物の配列を追加
let goal; // ゴールを表す変数を追加
let jumpForce = -15;
let gravity = 0.5;
let isJumping = false;
let leftPressed = false;
let rightPressed = false;
let score = 0;
let platformCount = 5;
let cameraY = 0;
let enemies = [];

function preload() {
    normalImage = loadImage('./assets/reimu_good_01.png');
    fallingImage = loadImage('./assets/reimu_bad_03.png');
    jumpSound = loadSound('./assets/v_reimu.mp3');
}

function setup() {
    createCanvas(800, 1500);
    player = new Sprite(width / 2 - 15, height - 30);
    player.width = 30;
    player.height = 30;
    player.color = "orange";
    player.image = normalImage;
    player.velocity = { x: 0, y: 0 };

    createPlatforms();
    createEnemies();
    createObstacles();
    createGoal(); // ゴールの生成関数を呼び出す
    cameraY = player.y - height / 2 + player.height / 2;
}

function createPlatforms() {
    platforms = [];
    platforms.push(new FixedPlatform(100, 2000, 200, 20));

    for (let i = 0; i < platformCount; i++) {
        let x = random(0, width - 200);
        let y = random(1000, 2000);
        platforms.push(new MovingPlatform(x, y, 200, 20, random(2, 3)));
    }
}

function createEnemies() {
    for (let i = 0; i < 3; i++) {
        let x = random(0, width);
        let y = random(100, 200);
        enemies.push(new Enemy(x, y));
    }
}

function createObstacles() {
    for (let i = 0; i < 5; i++) { // 障害物の数を設定
        let x = random(0, width - 100);
        let y = random(300, 800); // 障害物のY座標範囲を設定
        obstacles.push(new Obstacle(x, y, 100, 20)); // 障害物のサイズを設定
    }
}

function createGoal() {
    let x = width / 2 - 50; // ゴールのX座標
    let y = 50; // ゴールのY座標
    goal = new Goal(x, y, 100, 20); // ゴールのサイズを設定
}

class FixedPlatform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.collider = "static";
    }

    draw() {
        fill("blue");
        rect(this.x, this.y - cameraY, this.width, this.height);
    }
}

class MovingPlatform {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 1;
    }

    draw() {
        fill("green");
        rect(this.x, this.y - cameraY, this.width, this.height);
        this.move();
    }

    move() {
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x + this.width >= width) {
            this.direction *= -1;
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = "red";
        this.direction = random([-1, 1]);
    }

    draw() {
        fill(this.color);
        rect(this.x, this.y - cameraY, this.width, this.height);
        this.move();
    }

    move() {
        this.x += this.direction * 2;
        if (this.x < 0 || this.x + this.width > width) {
            this.direction *= -1;
        }
    }
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        fill("purple"); // 障害物の色
        rect(this.x, this.y - cameraY, this.width, this.height);
    }
}

class Goal {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        fill("gold"); // ゴールの色
        rect(this.x, this.y - cameraY, this.width, this.height);
    }
}

function draw() {
    background("silver");
    handlePlayerMovement();
    handleGravity();
    handleCollisions();
    constrainPlayerPosition();
    handleImageChange();
    player.draw();

    cameraY = player.y - height / 2 + player.height / 2;

    for (let platform of platforms) {
        platform.draw();
    }

    for (let enemy of enemies) {
        enemy.draw();
    }

    for (let obstacle of obstacles) {
        obstacle.draw(); // 障害物を描画
    }

    goal.draw(); // ゴールを描画

    player.draw();

    fill(0);
    textSize(32);
    text(`Score: ${score}`, 10, 30);
}

function handlePlayerMovement() {
    if (leftPressed) {
        player.x -= 5;
    }
    if (rightPressed) {
        player.x += 5;
    }
}

function handleGravity() {
    if (isJumping) {
        player.velocity.y += gravity;
        player.y += player.velocity.y;
    }
}

function handleImageChange() {
    if (player.velocity.y > 0) {
        player.image = fallingImage; // 落下画像
    } else {
        player.image = normalImage; // 通常画像
    }
}

function handleCollisions() {
    if (player.y + player.height >= height) {
        resetPlayerToGround();
    }

    let onPlatform = false;
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y - cameraY &&
            player.y + player.height <= platform.y + platform.height - cameraY &&
            player.velocity.y >= 0) {

            player.y = platform.y - player.height - cameraY;
            player.velocity.y = 0;

            isJumping = false;
            onPlatform = true;
            break;
        }
    }

    if (!onPlatform && player.y + player.height < height) {
        player.velocity.y += gravity;
    }

    for (let enemy of enemies) {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height - cameraY &&
            player.y + player.height > enemy.y - cameraY) {
            resetPlayerToGround();
            score -= 10;
            break;
        }
    }

    // ゴールの当たり判定
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height - cameraY &&
        player.y + player.height > goal.y - cameraY) {
        score += 100; // ゴールに到達した場合のスコアを増加
        resetPlayerToGround(); // プレイヤーを元の位置にリセット
    }

    for (let obstacle of obstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height - cameraY &&
            player.y + player.height > obstacle.y - cameraY) {
            resetPlayerToGround();
            score -= 5; // 障害物に衝突した場合のスコアを減らす
            break;
        }
    }
}

function resetPlayerToGround() {
    player.y = height - player.height;
    player.velocity.y = 0;
    isJumping = false;
}

function constrainPlayerPosition() {
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > width) {
        player.x = width - player.width;
    }
}

function keyPressed() {
    if (key === ' ' && !isJumping) {
        player.velocity.y = jumpForce;
        isJumping = true;
        jumpSound.play();
    }
    if (keyCode === LEFT_ARROW) {
        leftPressed = true;
    }
    if (keyCode === RIGHT_ARROW) {
        rightPressed = true;
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        leftPressed = false;
    }
    if (keyCode === RIGHT_ARROW) {
        rightPressed = false;
    }
}

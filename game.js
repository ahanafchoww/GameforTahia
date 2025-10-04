let player, guitar, coin;
let coinsCollected = 0;
let timeRemaining = 180;  // 3 minutes in seconds
let level = 1;
let guitarSpeed = 100;

let game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
});

function preload() {
    this.load.image('tahia', 'assets/tahia.png');
    this.load.image('guitar', 'assets/guitar.png');
    this.load.image('coin', 'assets/coin.png');
}

function create() {
    player = this.physics.add.image(100, 100, 'tahia').setCollideWorldBounds(true);
    createGuitar(this);
    createCoin(this);

    this.time.addEvent({
        delay: 1000,
        callback: updateTime,
        callbackScope: this,
        loop: true
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.coinsText = this.add.text(16, 16, 'Coins: 0', { fontSize: '32px', fill: '#FFF' });
    this.timeText = this.add.text(650, 16, 'Time: 180', { fontSize: '32px', fill: '#FFF' });
}

function update() {
    player.setVelocity(0);

    if (cursors.left.isDown) player.setVelocityX(-160);
    if (cursors.right.isDown) player.setVelocityX(160);
    if (cursors.up.isDown) player.setVelocityY(-160);
    if (cursors.down.isDown) player.setVelocityY(160);

    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), guitar.getBounds())) {
        createGuitar(this);
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), coin.getBounds())) {
        coinsCollected++;
        this.coinsText.setText('Coins: ' + coinsCollected);
        createCoin(this);
    }

    if (timeRemaining <= 0 || coinsCollected >= 10) {
        nextLevel(this);
    }

    this.timeText.setText('Time: ' + timeRemaining);
}

function updateTime() {
    if (timeRemaining > 0) timeRemaining--;
    if (timeRemaining <= 0) {
        nextLevel(game.scene.scenes[0]);
    }
}

function createGuitar(scene) {
    guitar = scene.physics.add.image(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'guitar');
    guitar.setVelocity(Phaser.Math.Between(-guitarSpeed, guitarSpeed), Phaser.Math.Between(-guitarSpeed, guitarSpeed));
}

function createCoin(scene) {
    coin = scene.physics.add.image(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'coin');
}

function nextLevel(scene) {
    if (level < 15) {
        level++;
        timeRemaining = 180;
        coinsCollected = 0;
        guitarSpeed += 20;
        scene.physics.world.clear();
        createGuitar(scene);
        createCoin(scene);
    } else {
        alert("Congratulations, you've completed all levels!");
        scene.scene.restart();
    }
}

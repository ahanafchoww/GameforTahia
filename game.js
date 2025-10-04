/*
 * Main game logic for the Chase the Guitar game.
 *
 * This file defines a simple 2D game where a player (Tahia) chases a
 * moving guitar around a play field, collects coins, and progresses
 * through multiple increasingly difficult levels.  Each level gives
 * the player three minutes to catch the guitar ten times.  On
 * completion of the final level the game restarts.
 *
 * The game uses Phaser 3 which is loaded via a CDN from index.html.
 */

let player, guitar, coin;
let coinsCollected = 0;
let timeRemaining = 180;  // seconds per level (3 minutes)
let level = 1;
let guitarSpeed = 100;  // initial guitar speed
let game;

function preload() {
  // Load sprite assets relative to the project root.  When deploying to
  // GitHub pages or another static host the assets folder must be at
  // the same level as this file.
  this.load.image('tahia', 'assets/tahia.png');
  this.load.image('guitar', 'assets/guitar.png');
  this.load.image('coin', 'assets/coin.png');
}

function create() {
  // Add the player sprite and constrain it to the world bounds.
  player = this.physics.add.image(100, 100, 'tahia');
  player.setCollideWorldBounds(true);

  // Create the initial guitar and coin objects.
  createGuitar(this);
  createCoin(this);

  // Set up a repeating timed event to decrement the level timer.
  this.time.addEvent({
    delay: 1000,
    callback: updateTime,
    callbackScope: this,
    loop: true,
  });

  // Create cursor input for player movement.
  cursors = this.input.keyboard.createCursorKeys();

  // Text objects for displaying coins collected and time remaining.
  this.coinsText = this.add.text(16, 16, 'Coins: 0', {
    fontSize: '24px',
    fill: '#000',
  });
  this.timeText = this.add.text(16, 48, 'Time: ' + timeRemaining, {
    fontSize: '24px',
    fill: '#000',
  });
  this.levelText = this.add.text(16, 80, 'Level: ' + level + '/15', {
    fontSize: '24px',
    fill: '#000',
  });
}

function update() {
  // Reset velocity each frame before applying new values.
  player.setVelocity(0);

  // Move the player based on arrow key input.
  if (cursors.left.isDown) player.setVelocityX(-200);
  if (cursors.right.isDown) player.setVelocityX(200);
  if (cursors.up.isDown) player.setVelocityY(-200);
  if (cursors.down.isDown) player.setVelocityY(200);

  // Collision check for the guitar.
  if (Phaser.Geom.Intersects.RectangleToRectangle(
        player.getBounds(),
        guitar.getBounds())) {
    // Each time the guitar is caught, spawn a new one.
    createGuitar(this);
    coinsCollected++;
    this.coinsText.setText('Coins: ' + coinsCollected);
    // After 10 catches, proceed to the next level.
    if (coinsCollected >= 10) {
      nextLevel(this);
    }
  }

  // Collision check for the coin.
  if (Phaser.Geom.Intersects.RectangleToRectangle(
        player.getBounds(),
        coin.getBounds())) {
    // Increase coin count when collected and spawn a new one.
    coinsCollected++;
    this.coinsText.setText('Coins: ' + coinsCollected);
    createCoin(this);
    if (coinsCollected >= 10) {
      nextLevel(this);
    }
  }

  // Update the on-screen timer each frame.
  this.timeText.setText('Time: ' + timeRemaining);
  this.levelText.setText('Level: ' + level + '/15');

  // If time runs out, go to the next level or end game.
  if (timeRemaining <= 0) {
    nextLevel(this);
  }
}

function updateTime() {
  if (timeRemaining > 0) {
    timeRemaining--;
  } else {
    // Trigger level transition when timer hits zero.
    nextLevel(game.scene.scenes[0]);
  }
}

function createGuitar(scene) {
  // Remove existing guitar before creating a new one.
  if (guitar) {
    guitar.destroy();
  }
  guitar = scene.physics.add.image(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    'guitar'
  );
  // Give the guitar a random velocity within the current speed range.
  const vx = Phaser.Math.Between(-guitarSpeed, guitarSpeed);
  const vy = Phaser.Math.Between(-guitarSpeed, guitarSpeed);
  guitar.setVelocity(vx, vy);
  guitar.setCollideWorldBounds(true);
  guitar.setBounce(1, 1);
}

function createCoin(scene) {
  // Remove existing coin before creating a new one.
  if (coin) {
    coin.destroy();
  }
  coin = scene.physics.add.image(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550),
    'coin'
  );
  // Coins remain static, but could also be given a small velocity if desired.
  coin.setCollideWorldBounds(true);
  coin.setBounce(1, 1);
  coin.setImmovable(true);
}

function nextLevel(scene) {
  // When all levels completed, restart.
  if (level >= 15) {
    alert('Congratulations, you\'ve completed all levels!');
    // Reset game state.
    level = 1;
    coinsCollected = 0;
    timeRemaining = 180;
    guitarSpeed = 100;
    // Recreate objects and update text.
    createGuitar(scene);
    createCoin(scene);
    return;
  }
  // Otherwise progress to next level.
  level++;
  coinsCollected = 0;
  timeRemaining = 180;
  guitarSpeed += 20; // increase difficulty each level
  createGuitar(scene);
  createCoin(scene);
}

// Start the game once the DOM is ready.  Phaser will attach
// itself to the #gameContainer element defined in index.html.
window.addEventListener('load', () => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
  });
});
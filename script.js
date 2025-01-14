const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('scoreValue');
    const livesDisplay = document.getElementById('livesValue');
    const levelDisplay = document.getElementById('levelValue');
    const gameOverText = document.getElementById('gameOver');
    const championText = document.getElementById('champion');
    const explosionSound = document.getElementById('explosionSound');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resetButton = document.getElementById('resetButton');

    let playerWidth = 48;
    let playerHeight = 48;
    let playerSpeed = 3;
    let playerX;
    let playerY;

    let bulletWidth = 8;
    let bulletHeight = 24;
    let bulletSpeed = 5;
    const bullets = [];
    let canShoot = true;
    const shootDelay = 200;
    let fireDelay = 100;
    let lastFireTime = 0;
    let waveFire = [];
    let mouseX = null;

    let invaderWidth = 32;
    let invaderHeight = 32;
    let invaderRows = 4;
    let invaderCols = 10;
    let invaderSpeedX = 0.5;
    let invaderSpeedY = 10;
    let invaders = [];
    let invaderDirection = 1;
    const enemyBullets = [];
    const enemyBulletSpeed = 3;
    const enemyFireRate = 1000;
    let lastEnemyFireTime = 0;

    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let gameOverDisplayed = false;
    const totalLevels = 12;
    const explosions = [];

    const invaderSprite = [
        [0,0,1,1,0,0],
        [0,1,1,1,1,0],
        [1,1,0,0,1,1],
        [1,1,1,1,1,1],
        [1,0,1,1,0,1],
        [0,1,0,0,1,0]
    ];

    const playerSprite = [
        [0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,1,1,0,1,0,1,1,0,0],
        [0,1,1,0,0,1,0,0,1,1,0],
        [1,1,0,0,0,1,0,0,0,1,1],
        [1,1,0,0,0,1,0,0,0,1,1],
        [1,1,0,1,1,1,1,1,0,1,1],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0]
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        playerX = canvas.width / 2 - playerWidth / 2;
        playerY = canvas.height - playerHeight - 100;
    }

    function createInvaders() {
      invaders = [];
      for (let row = 0; row < invaderRows; row++) {
        for (let col = 0; col < invaderCols; col++) {
          invaders.push({
            x: col * (invaderWidth + 16) + 50,
            y: row * (invaderHeight + 16) + 30,
            alive: true,
            color: row % 2 === 0 ? '#00ffff' : '#ff00ff',
            isTracking: false,
            trackingSpeed: 0.5
          });
        }
      }
    }

    function drawPlayer() {
        ctx.fillStyle = '#808080';
        for (let row = 0; row < playerSprite.length; row++) {
            for (let col = 0; col < playerSprite[row].length; col++) {
                if (playerSprite[row][col] === 1) {
                    ctx.fillRect(playerX + col * (playerWidth / 11), playerY + row * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
                }
            }
        }
        
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(playerX + 2 * (playerWidth / 11), playerY + 2 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 8 * (playerWidth / 11), playerY + 2 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 1 * (playerWidth / 11), playerY + 4 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 9 * (playerWidth / 11), playerY + 4 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 1 * (playerWidth / 11), playerY + 5 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 9 * (playerWidth / 11), playerY + 5 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(playerX + 5 * (playerWidth / 11), playerY + 6 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(playerX + 5 * (playerWidth / 11), playerY + 1 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        
        ctx.fillStyle = '#ff8000';
        ctx.fillRect(playerX + 4 * (playerWidth / 11), playerY + 10 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 6 * (playerWidth / 11), playerY + 10 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 4 * (playerWidth / 11), playerY + 11 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
        ctx.fillRect(playerX + 6 * (playerWidth / 11), playerY + 11 * (playerHeight / 12), playerWidth / 11, playerHeight / 12);
    }

    function drawBullets() {
        bullets.forEach(bullet => {
            const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bulletHeight);
            gradient.addColorStop(0, 'yellow');
            gradient.addColorStop(0.5, 'orange');
            gradient.addColorStop(1, 'red');
            ctx.fillStyle = gradient;
            ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
            
            const trailLength = 5;
            for (let i = 1; i <= trailLength; i++) {
                const trailY = bullet.y + (bulletHeight / trailLength) * i;
                const trailAlpha = 1 - (i / trailLength);
                ctx.fillStyle = `rgba(255, 165, 0, ${trailAlpha})`;
                ctx.fillRect(bullet.x, trailY, bulletWidth, bulletHeight / trailLength);
            }
        });
    }

    function drawInvaders() {
        invaders.forEach(invader => {
            if (invader.alive) {
                ctx.fillStyle = invader.color;
                for (let row = 0; row < invaderSprite.length; row++) {
                    for (let col = 0; col < invaderSprite[row].length; col++) {
                        if (invaderSprite[row][col] === 1) {
                            ctx.fillRect(invader.x + col * (invaderWidth / 6), invader.y + row * (invaderHeight / 6), invaderWidth / 6, invaderHeight / 6);
                        }
                    }
                }
            }
        });
    }

    function drawEnemyBullets() {
        ctx.fillStyle = '#ffffff';
        enemyBullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
        });
    }

    function drawExplosions() {
        explosions.forEach(explosion => {
            if (explosion.frame < explosion.frames.length) {
                ctx.fillStyle = explosion.color;
                const frame = explosion.frames[explosion.frame];
                for (const pixel of frame) {
                    ctx.fillRect(explosion.x + pixel[0], explosion.y + pixel[1], 8, 8);
                }
            }
        });
    }

    function drawWaveFire() {
        waveFire.forEach(fire => {
            ctx.fillStyle = 'rgba(245, 245, 220, ' + fire.alpha + ')';
            ctx.beginPath();
            ctx.moveTo(fire.x, fire.y);
            ctx.quadraticCurveTo(fire.x + fire.width / 2, fire.y - fire.height * 2, fire.x + fire.width, fire.y);
            ctx.lineTo(fire.x + fire.width, fire.y + fire.height);
            ctx.quadraticCurveTo(fire.x + fire.width / 2, fire.y - fire.height * 1, fire.x, fire.y + fire.height);
            ctx.closePath();
            ctx.fill();
        });
    }

    function updatePlayer() {
        if (mouseX !== null) {
            playerX = mouseX - playerWidth / 2;
        }
        if (keys['ArrowLeft'] && playerX > 0) {
            playerX -= playerSpeed;
        }
        if (keys['ArrowRight'] && playerX < canvas.width - playerWidth) {
            playerX += playerSpeed;
        }
    }

    function updateBullets() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) {
          bullets.splice(i, 1);
        }
      }
    }

    function updateInvaders() {
      let moveDown = false;
      let aliveInvaders = invaders.filter(invader => invader.alive);
      for (const invader of aliveInvaders) {
        if (!invader.isTracking) {
            invader.x += invaderSpeedX * invaderDirection;
            if (invader.x > canvas.width - invaderWidth || invader.x < 0) {
                moveDown = true;
            }
        } else {
            const dx = playerX + playerWidth / 2 - (invader.x + invaderWidth / 2);
            const dy = playerY + playerHeight / 2 - (invader.y + invaderHeight / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                invader.x += (dx / distance) * invader.trackingSpeed;
                invader.y += (dy / distance) * invader.trackingSpeed;
            }
        }
      }

      if (moveDown) {
        invaderDirection *= -1;
        for (const invader of invaders) {
          if (invader.alive && !invader.isTracking) {
            invader.y += invaderSpeedY;
          }
        }
      }

      if (aliveInvaders.length <= 3) {
          for (const invader of aliveInvaders) {
              if (!invader.isTracking) {
                  invader.isTracking = true;
              }
          }
      }
    }

    function updateEnemyBullets() {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].y += enemyBulletSpeed;
            if (enemyBullets[i].y > canvas.height) {
                enemyBullets.splice(i, 1);
            }
        }
    }

    function updateExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].frame++;
            if (explosions[i].frame >= explosions[i].frames.length) {
                explosions.splice(i, 1);
            }
        }
    }

    function updateWaveFire() {
        for (let i = waveFire.length - 1; i >= 0; i--) {
            waveFire[i].y -= 10;
            waveFire[i].alpha -= 0.1;
            if (waveFire[i].y < playerY - canvas.height / 2 || waveFire[i].alpha <= 0) {
                waveFire.splice(i, 1);
            }
        }
    }

    function enemyFire() {
        if (Date.now() - lastEnemyFireTime > enemyFireRate) {
            const aliveInvaders = invaders.filter(invader => invader.alive && !invader.isTracking);
            if (aliveInvaders.length > 0) {
                const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
                enemyBullets.push({
                    x: randomInvader.x + invaderWidth / 2 - bulletWidth / 2,
                    y: randomInvader.y + invaderHeight
                });
                lastEnemyFireTime = Date.now();
            }
        }
    }

    function checkCollisions() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (const invader of invaders) {
          if (invader.alive &&
              bullet.x < invader.x + invaderWidth &&
              bullet.x + bulletWidth > invader.x &&
              bullet.y < invader.y + invaderHeight &&
              bullet.y + bulletHeight > invader.y) {
            invader.alive = false;
            bullets.splice(i, 1);
            score += 10;
            scoreDisplay.textContent = score;
            explosions.push({
                x: invader.x,
                y: invader.y,
                frame: 0,
                color: invader.color,
                frames: [
                    [[-4,-4],[0,-4],[4,-4],[-4,0],[0,0],[4,0],[-4,4],[0,4],[4,4]],
                    [[-8,-8],[-4,-8],[0,-8],[4,-8],[8,-8],[-8,-4],[-4,-4],[0,-4],[4,-4],[8,-4],[-8,0],[-4,0],[0,0],[4,0],[8,0],[-8,4],[-4,4],[0,4],[4,4],[8,4],[-8,8],[-4,8],[0,8],[4,8],[8,8]],
                    [[-12,-12],[-8,-12],[-4,-12],[0,-12],[4,-12],[8,-12],[12,-12],[-12,-8],[-8,-8],[-4,-8],[0,-8],[4,-8],[8,-8],[12,-8],[-12,-4],[-8,-4],[-4,-4],[0,-4],[4,-4],[8,-4],[12,-4],[-12,0],[-8,0],[-4,0],[0,0],[4,0],[8,0],[12,0],[-12,4],[-8,4],[-4,4],[0,4],[4,4],[8,4],[12,4],[-12,8],[-8,8],[-4,8],[0,8],[4,8],[8,8],[12,8],[-12,12],[-8,12],[-4,12],[0,12],[4,12],[8,12],[12,12]]
                ]
            });
            explosionSound.currentTime = 0;
            explosionSound.play();
            break;
          }
        }
      }

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
          const bullet = enemyBullets[i];
          if (bullet.x < playerX + playerWidth &&
              bullet.x + bulletWidth > playerX &&
              bullet.y < playerY + playerHeight &&
              bullet.y + bulletHeight > playerY) {
              lives--;
              livesDisplay.textContent = lives;
              enemyBullets.splice(i, 1);
              resetGame();
              if (lives <= 0) {
                  gameRunning = false;
                  if (!gameOverDisplayed) {
                      gameOverText.style.display = 'block';
                      gameOverDisplayed = true;
                      setTimeout(startGame, 2000);
                  }
              }
              break;
          }
      }

      for (const invader of invaders) {
          if (invader.alive && invader.y + invaderHeight > playerY) {
              lives--;
              livesDisplay.textContent = lives;
              resetGame();
              if (lives <= 0) {
                  gameRunning = false;
                  if (!gameOverDisplayed) {
                      gameOverText.style.display = 'block';
                      gameOverDisplayed = true;
                      setTimeout(startGame, 2000);
                  }
              }
              break;
          }
      }
    }

    function resetGame() {
        playerX = canvas.width / 2 - playerWidth / 2;
        bullets.length = 0;
        enemyBullets.length = 0;
        createInvaders();
    }

    function nextLevel() {
        level++;
        levelDisplay.textContent = level;
        invaderRows = Math.min(invaderRows + 1, 8);
        invaderCols = Math.min(invaderCols + 2, 16);
        invaderSpeedX += 0.2;
        invaderSpeedY += 2;
        resetGame();
    }

    function checkWin() {
      if (invaders.every(invader => !invader.alive)) {
          if (level < totalLevels) {
              nextLevel();
          } else {
              gameRunning = false;
              championText.style.display = 'block';
          }
      }
    }

    function fire() {
        const bulletY = playerY;
        const bulletX = playerX + playerWidth / 2 - bulletWidth / 2;
        let currentLevel = Math.min(level, 3);
        
        if (currentLevel === 1) {
            setTimeout(() => {
                bullets.push({ x: bulletX, y: bulletY });
            }, 0 * fireDelay);
        } else if (currentLevel === 2) {
            setTimeout(() => {
                bullets.push({ x: bulletX - playerWidth / 4, y: bulletY });
            }, 0 * fireDelay);
            setTimeout(() => {
                bullets.push({ x: bulletX + playerWidth / 4, y: bulletY });
            }, 1 * fireDelay);
        } else if (currentLevel === 3) {
            setTimeout(() => {
                bullets.push({ x: bulletX - playerWidth / 3, y: bulletY });
            }, 0 * fireDelay);
            setTimeout(() => {
                bullets.push({ x: bulletX, y: bulletY });
            }, 1 * fireDelay);
            setTimeout(() => {
                bullets.push({ x: bulletX + playerWidth / 3, y: bulletY });
            }, 2 * fireDelay);
        }
        
        waveFire.push({x: playerX, y: playerY + playerHeight / 2, width: playerWidth, height: 10, alpha: 1});
    }

    function gameLoop() {
      if (!gameRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      updatePlayer();
      updateBullets();
      updateInvaders();
      updateEnemyBullets();
      enemyFire();
      checkCollisions();
      checkWin();
      updateExplosions();
      updateWaveFire();

      drawPlayer();
      drawBullets();
      drawInvaders();
      drawEnemyBullets();
      drawExplosions();
      drawWaveFire();

      requestAnimationFrame(gameLoop);
    }

    function startGame() {
        resizeCanvas();
        score = 0;
        lives = 3;
        level = 1;
        gameRunning = true;
        gameOverDisplayed = false;
        gameOverText.style.display = 'none';
        championText.style.display = 'none';
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        levelDisplay.textContent = level;
        createInvaders();
        gameLoop();
    }

    startButton.addEventListener('click', () => {
        if (!gameRunning) {
            startGame();
        }
    });

    stopButton.addEventListener('click', () => {
        gameRunning = false;
    });

    resetButton.addEventListener('click', () => {
        startGame();
    });

    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
    });

    canvas.addEventListener('click', () => {
        if (gameRunning && canShoot && Date.now() - lastFireTime > shootDelay) {
            fire();
            canShoot = false;
            lastFireTime = Date.now();
            setTimeout(() => {
                canShoot = true;
            }, shootDelay);
        }
    });

    const keys = {};
    document.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'Space' && canShoot && Date.now() - lastFireTime > shootDelay) {
          fire();
          canShoot = false;
          lastFireTime = Date.now();
          setTimeout(() => {
              canShoot = true;
          }, shootDelay);
      }
    });
    document.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    window.addEventListener('resize', resizeCanvas);
    startGame();

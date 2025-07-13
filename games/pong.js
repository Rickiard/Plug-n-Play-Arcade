// Improved Pong Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-pong';
  container.innerHTML = `
    <h2>Pong Game</h2>
    <canvas id="pong-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;border:2px solid #fff;"></canvas>
    <div id="pong-score" style="text-align:center;margin:10px;color:#fff;font-size:18px;">Player: 0 | AI: 0</div>
    <button id="pong-back" style="display:block;margin:0 auto;">Back</button>
  `;

  const canvas = container.querySelector('#pong-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#pong-score');
  const backBtn = container.querySelector('#pong-back');

  let playerScore = 0, aiScore = 0;
  let paddleY = 120, aiY = 120;
  let ballX = 200, ballY = 150, ballDX = 3, ballDY = 2;
  let ballSpeed = 3;
  let isPaused = false;
  let interval;

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0, 0, 400, 300);

    // Net
    ctx.fillStyle = '#444';
    for (let i = 0; i < 300; i += 20) {
      ctx.fillRect(195, i, 2, 10);
    }

    // Player paddle
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(10, paddleY, 10, 60);

    // AI paddle
    ctx.fillStyle = '#a21caf';
    ctx.fillRect(380, aiY, 10, 60);

    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  function resetBall() {
    ballX = 200;
    ballY = 150;
    ballSpeed = 3;
    ballDX = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballDY = 2 * (Math.random() > 0.5 ? 1 : -1);
    isPaused = true;
    setTimeout(() => { isPaused = false }, 1000);
  }

  function gameLoop() {
    if (isPaused) {
      draw();
      return;
    }

    ballX += ballDX;
    ballY += ballDY;

    // Wall collision
    if (ballY < 8 || ballY > 292) ballDY *= -1;

    // Player paddle collision
    if (ballX < 20 && ballY > paddleY && ballY < paddleY + 60) {
      ballDX *= -1.05;
      ballSpeed *= 1.03;
    }

    // AI paddle collision
    if (ballX > 372 && ballY > aiY && ballY < aiY + 60) {
      ballDX *= -1.05;
      ballSpeed *= 1.03;
    }

    // Score
    if (ballX < 0) {
      aiScore++;
      updateScore();
      resetBall();
    } else if (ballX > 400) {
      playerScore++;
      updateScore();
      resetBall();
    }

    // AI movement (adds a bit of randomness)
    let targetY = ballY - 30;
    aiY += (targetY - aiY) * 0.08 + (Math.random() - 0.5) * 2;
    aiY = Math.max(0, Math.min(240, aiY));

    draw();
  }

  function updateScore() {
    scoreDiv.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
  }

  function start() {
    paddleY = 120;
    aiY = 120;
    playerScore = 0;
    aiScore = 0;
    updateScore();
    resetBall();
    clearInterval(interval);
    interval = setInterval(gameLoop, 1000 / 60);
  }

  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    paddleY = Math.max(0, Math.min(240, e.clientY - rect.top - 30));
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  window.showPongGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    start();
  };
})();
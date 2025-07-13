// Snake Game Melhorado
(function () {
  const container = document.createElement('div');
  container.className = 'game-snake';
  container.innerHTML = `
    <style>
      .game-snake {
        text-align: center;
        color: #e0e0e0;
        font-family: Arial, sans-serif;
      }
      #snake-canvas {
        background: #232946;
        display: block;
        margin: 0 auto;
        border: 2px solid #06b6d4;
        max-width: 100%;
        height: auto;
      }
      #snake-score {
        margin-top: 10px;
        font-size: 1.2rem;
      }
      #snake-back {
        margin-top: 10px;
        padding: 8px 16px;
        background: #06b6d4;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
    <h2>Snake Game</h2>
    <canvas id="snake-canvas" width="320" height="320"></canvas>
    <div id="snake-score">Score: 0</div>
    <button id="snake-back">Back</button>
  `;

  let snake, food, dx, dy, score, lastTime = 0, speed = 100, running, gameOver = false;
  const canvas = container.querySelector('#snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#snake-score');
  const backBtn = container.querySelector('#snake-back');

  function reset() {
    snake = [{ x: 10, y: 10 }];
    dx = 1; dy = 0;
    score = 0;
    speed = 100;
    food = generateFood();
    running = true;
    gameOver = false;
    scoreDiv.textContent = 'Score: 0';
    requestAnimationFrame(gameLoop);
  }

  function generateFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
      };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }

  function draw() {
    // Clear canvas
    ctx.fillStyle = '#232946';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake body with gradient and rounded effect
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      ctx.fillStyle = i === 0 ? '#06f0a0' : '#06b6d4';
      ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = i === 0 ? 10 : 5;
      roundRect(ctx, s.x * 16 + 2, s.y * 16 + 2, 12, 12, 4);
    }

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw food with pulse gradient effect
    const grad = ctx.createRadialGradient(
      food.x * 16 + 8, food.y * 16 + 8, 2,
      food.x * 16 + 8, food.y * 16 + 8, 8
    );
    grad.addColorStop(0, '#f0abfc');
    grad.addColorStop(1, '#a21caf');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(food.x * 16 + 8, food.y * 16 + 8, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  function gameLoop(timestamp) {
    if (!running) return;
    if (timestamp - lastTime < speed) {
      requestAnimationFrame(gameLoop);
      return;
    }
    lastTime = timestamp;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check collisions
    if (head.x < 0 || head.x > 19 || head.y < 0 || head.y > 19 || snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true;
      running = false;
      draw();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreDiv.textContent = 'Score: ' + score;
      food = generateFood();
      // Increase speed every 5 points
      if (score % 5 === 0 && speed > 40) speed -= 10;
    } else {
      snake.pop();
    }

    draw();
    requestAnimationFrame(gameLoop);
  }

  document.addEventListener('keydown', function (e) {
    if (!running && gameOver && e.key === ' ') {
      reset();
      return;
    }
    if (!running) return;
    if (e.key === 'ArrowUp' && dy !== 1) { dx = 0; dy = -1; }
    else if (e.key === 'ArrowDown' && dy !== -1) { dx = 0; dy = 1; }
    else if (e.key === 'ArrowLeft' && dx !== 1) { dx = -1; dy = 0; }
    else if (e.key === 'ArrowRight' && dx !== -1) { dx = 1; dy = 0; }
  });

  backBtn.addEventListener('click', function () {
    container.remove();
    document.getElementById('arcade').style.display = '';
    running = false;
  });

  window.showSnakeGame = function () {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

// Color Switch Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-container game-colorswitch';
  container.innerHTML = `
    <h2 class="text-center text-light mb-2">Color Switch</h2>
    <div class="alert alert-info text-dark mb-3" style="background: #181e2a; color: #eebbc3; border: 1px solid #6366f1; font-size:1.1rem; line-height:1.7; max-width:400px; margin:0 auto; font-weight:500;">Press <span class='badge bg-secondary'>Space</span> to jump.<br>Pass through obstacles of the same color.<br>Score points by passing obstacles!</div>
    <div id="cs-menu" style="position:absolute;top:0;left:0;width:400px;height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(24,30,42,0.96);z-index:10;border-radius:0.8rem;">
      <div id="cs-menu-title" style="font-size:2rem;color:#eebbc3;font-weight:bold;margin-bottom:1.2rem;">Color Switch</div>
      <div id="cs-menu-score" style="font-size:1.2rem;color:#fff;margin-bottom:1.2rem;display:none;"></div>
      <button id="cs-menu-start" class="btn btn-success mb-2" style="font-size:1.1rem;width:180px;">Start Game</button>
      <button id="cs-menu-restart" class="btn btn-primary mb-2" style="font-size:1.1rem;width:180px;display:none;">Restart</button>
    </div>
    <div style="position:relative;">
      <canvas id="cs-canvas" class="game-canvas" width="400" height="300"></canvas>
    </div>
    <div id="cs-score" class="game-score mb-2">Score: 0</div>
    <button id="cs-back" class="game-back mb-2" style="width:100%;">Back</button>
  `;
  const canvas = container.querySelector('#cs-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#cs-score');
  const backBtn = container.querySelector('#cs-back');
  let ballY, ballV, obstacles, score, interval, running, colorIdx;
  let menuVisible = true;
  const colors = ['#06b6d4','#a21caf','#e11d48','#84cc16'];

  function reset() {
    ballY = 150; ballV = 0; colorIdx = 0;
    obstacles = [{x:400, color:Math.floor(Math.random()*4)}];
    score = 0;
    running = false;
    scoreDiv.textContent = 'Score: 0';
    clearInterval(interval);
    showMenu('Color Switch', false);
    draw();
  }

  function draw() {
    // Gradient background
    const grad = ctx.createLinearGradient(0,0,400,300);
    grad.addColorStop(0, '#232946');
    grad.addColorStop(1, '#151A20');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,400,300);

    // Ball with glossy effect and shadow
    ctx.save();
    ctx.shadowColor = colors[colorIdx];
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(60,ballY,16,0,Math.PI*2);
    ctx.fillStyle = colors[colorIdx];
    ctx.fill();
    // Glossy highlight
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(60-5,ballY-5,8,0,Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Obstacles with rounded corners and shadow
    obstacles.forEach(o => {
      ctx.save();
      ctx.shadowColor = colors[o.color];
      ctx.shadowBlur = 10;
      ctx.fillStyle = colors[o.color];
      roundRect(ctx, o.x, 120, 40, 60, 14);
      ctx.restore();
    });
    scoreDiv.textContent = 'Score: '+score;
  }

  // Helper for rounded rectangles
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
  }

  function gameLoop() {
    ballV += 1.2; ballY += ballV;
    obstacles.forEach(o => { o.x -= 4; });
    if(obstacles[obstacles.length-1].x<200) obstacles.push({x:400,color:Math.floor(Math.random()*4)});
    if(obstacles[0].x<-40) { obstacles.shift(); score++; colorIdx = Math.floor(Math.random()*4); }
    draw();
    if(ballY<0||ballY>300) endGame();
    obstacles.forEach(o => {
      if(o.x<76&&o.x>44&&ballY>120&&ballY<180&&colorIdx!==o.color) endGame();
    });
  }

  function endGame() {
    running=false; clearInterval(interval);
    showMenu('Game Over', true, score);
  }

  document.addEventListener('keydown', function(e) {
    if(container.parentNode && running && e.key===' ') ballV = -10;
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  // Menu logic
  const menu = container.querySelector('#cs-menu');
  const menuTitle = container.querySelector('#cs-menu-title');
  const menuScore = container.querySelector('#cs-menu-score');
  const menuStart = container.querySelector('#cs-menu-start');
  const menuRestart = container.querySelector('#cs-menu-restart');

  function showMenu(title, showRestart, score) {
    menuTitle.textContent = title;
    menuScore.style.display = score !== undefined ? 'block' : 'none';
    menuScore.textContent = score !== undefined ? 'Score: ' + score : '';
    menuStart.style.display = showRestart ? 'none' : 'block';
    menuRestart.style.display = showRestart ? 'block' : 'none';
    menu.style.display = 'flex';
    menuVisible = true;
  }

  function hideMenu() {
    menu.style.display = 'none';
    menuVisible = false;
  }

  menuStart.addEventListener('click', function() {
    running = true;
    hideMenu();
    interval = setInterval(gameLoop, 20);
  });
  menuRestart.addEventListener('click', function() {
    reset();
  });

  window.showColorSwitchGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    gsap.from(container, {duration: 0.7, y: 50, opacity: 0, ease: 'power2.out'});
    reset();
  };
})();

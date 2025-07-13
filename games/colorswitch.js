// Color Switch Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-colorswitch';
  container.innerHTML = `
    <h2>Color Switch</h2>
    <canvas id="cs-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;"></canvas>
    <div id="cs-score">Score: 0</div>
    <button id="cs-back">Back</button>
  `;
  const canvas = container.querySelector('#cs-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#cs-score');
  const backBtn = container.querySelector('#cs-back');
  let ballY, ballV, obstacles, score, interval, running, colorIdx;
  const colors = ['#06b6d4','#a21caf','#e11d48','#84cc16'];

  function reset() {
    ballY = 150; ballV = 0; colorIdx = 0;
    obstacles = [{x:400, color:Math.floor(Math.random()*4)}];
    score = 0;
    running = true;
    scoreDiv.textContent = 'Score: 0';
    clearInterval(interval);
    interval = setInterval(gameLoop, 20);
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0,0,400,300);
    ctx.fillStyle = colors[colorIdx];
    ctx.beginPath(); ctx.arc(60,ballY,16,0,Math.PI*2); ctx.fill();
    obstacles.forEach(o => {
      ctx.fillStyle = colors[o.color];
      ctx.fillRect(o.x,120,40,60);
    });
    scoreDiv.textContent = 'Score: '+score;
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
    running=false; clearInterval(interval); alert('Game Over! Score: '+score);
  }

  document.addEventListener('keydown', function(e) {
    if(container.parentNode && running && e.key===' ') ballV = -10;
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  window.showColorSwitchGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

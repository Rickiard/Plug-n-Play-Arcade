// Flappy Bird Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-flappybird';
  container.innerHTML = `
    <h2>Flappy Bird</h2>
    <canvas id="fb-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;"></canvas>
    <div id="fb-score">Score: 0</div>
    <button id="fb-back">Back</button>
  `;
  const canvas = container.querySelector('#fb-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#fb-score');
  const backBtn = container.querySelector('#fb-back');
  let birdY, birdV, pipes, score, interval, running;

  function reset() {
    birdY = 150; birdV = 0;
    pipes = [{x:400, gap:Math.random()*120+60}];
    score = 0;
    running = true;
    scoreDiv.textContent = 'Score: 0';
    clearInterval(interval);
    interval = setInterval(gameLoop, 20);
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0,0,400,300);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(60,birdY,16,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.fillText('🐦', 50, birdY+8);
    pipes.forEach(p => {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(p.x,0,40,p.gap-40);
      ctx.fillRect(p.x,p.gap+40,40,300-p.gap-40);
    });
    scoreDiv.textContent = 'Score: '+score;
  }

  function gameLoop() {
    birdV += 1.2; birdY += birdV;
    pipes.forEach(p => { p.x -= 4; });
    if(pipes[pipes.length-1].x<200) pipes.push({x:400,gap:Math.random()*120+60});
    if(pipes[0].x<-40) { pipes.shift(); score++; }
    draw();
    if(birdY<0||birdY>300) endGame();
    pipes.forEach(p => {
      if(p.x<76&&p.x>44&&(birdY<p.gap-40||birdY>p.gap+40)) endGame();
    });
  }

  function endGame() {
    running=false; clearInterval(interval); alert('Game Over! Score: '+score);
  }

  document.addEventListener('keydown', function(e) {
    if(container.parentNode && running && e.key===' ') birdV = -10;
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  window.showFlappyBirdGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

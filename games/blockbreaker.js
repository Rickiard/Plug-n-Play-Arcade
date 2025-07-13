// Block Breaker Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-container game-blockbreaker';
  container.innerHTML = `
    <h2 class="text-center text-light mb-2">Block Breaker</h2>
    <div class="alert alert-info text-dark mb-3" style="background: #181e2a; color: #eebbc3; border: 1px solid #6366f1; font-size:1.1rem; line-height:1.7; max-width:400px; margin:0 auto; font-weight:500;">Move the paddle with your mouse to bounce the ball and break all blocks.<br>Don't let the ball fall below the paddle!</div>
    <canvas id="bb-canvas" class="game-canvas" width="400" height="300"></canvas>
    <div id="bb-score" class="game-score mb-2">Score: 0</div>
    <button id="bb-back" class="game-back mb-2" style="width:100%;">Back</button>
  `;
  const canvas = container.querySelector('#bb-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#bb-score');
  const backBtn = container.querySelector('#bb-back');
  let paddleX, ballX, ballY, ballDX, ballDY, bricks, score, interval, running;

  function reset() {
    paddleX = 160;
    ballX = 200; ballY = 200; ballDX = 2; ballDY = -2;
    score = 0;
    running = true;
    bricks = [];
    for(let r=0;r<5;r++) for(let c=0;c<8;c++) bricks.push({x:c*48+8,y:r*20+30,hit:false});
    scoreDiv.textContent = 'Score: 0';
    clearInterval(interval);
    interval = setInterval(gameLoop, 16);
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0,0,400,300);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(paddleX,270,80,12);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ballX,ballY,8,0,Math.PI*2); ctx.fill();
    bricks.forEach(b => {
      if(!b.hit) {
        ctx.fillStyle = '#a21caf';
        ctx.fillRect(b.x,b.y,40,12);
      }
    });
    scoreDiv.textContent = 'Score: '+score;
  }

  function gameLoop() {
    ballX += ballDX; ballY += ballDY;
    if(ballX<8||ballX>392) ballDX*=-1;
    if(ballY<8) ballDY*=-1;
    if(ballY>270&&ballX>paddleX&&ballX<paddleX+80) ballDY*=-1;
    if(ballY>300) { running=false; clearInterval(interval); alert('Game Over! Score: '+score); }
    bricks.forEach(b => {
      if(!b.hit && ballX>b.x&&ballX<b.x+40&&ballY>b.y&&ballY<b.y+12) {
        b.hit=true; ballDY*=-1; score+=10;
      }
    });
    draw();
    if(bricks.every(b=>b.hit)) { running=false; clearInterval(interval); alert('You win! Score: '+score); }
  }

  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    paddleX = Math.max(0, Math.min(320, e.clientX-rect.left-40));
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  window.showBlockBreakerGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    gsap.from(container, {duration: 0.7, y: 50, opacity: 0, ease: 'power2.out'});
    reset();
  };
})();

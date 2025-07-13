// Fugitive Chicken Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-fugitivechicken';
  container.innerHTML = `
    <h2>Fugitive Chicken</h2>
    <canvas id="fc-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;"></canvas>
    <div id="fc-score">Score: 0</div>
    <button id="fc-back">Back</button>
  `;
  const canvas = container.querySelector('#fc-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#fc-score');
  const backBtn = container.querySelector('#fc-back');
  let chickenX, chickenY, obstacles, score, interval, running;

  function reset() {
    chickenX = 50; chickenY = 150;
    obstacles = [];
    score = 0;
    running = true;
    for(let i=0;i<5;i++) obstacles.push({x:400+i*120,y:Math.random()*250+20});
    scoreDiv.textContent = 'Score: 0';
    clearInterval(interval);
    interval = setInterval(gameLoop, 20);
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0,0,400,300);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(chickenX,chickenY,16,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.fillText('🐔', chickenX-10, chickenY+8);
    obstacles.forEach(o => {
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(o.x,o.y,24,24);
    });
    scoreDiv.textContent = 'Score: '+score;
  }

  function gameLoop() {
    obstacles.forEach(o => {
      o.x -= 4;
      if(o.x<0) { o.x=400; o.y=Math.random()*250+20; score++; }
      if(Math.abs(chickenX-o.x)<20 && Math.abs(chickenY-o.y)<20) {
        running=false; clearInterval(interval); alert('Game Over! Score: '+score);
      }
    });
    draw();
  }

  document.addEventListener('keydown', function(e) {
    if(container.parentNode && running) {
      if(e.key==='ArrowUp') chickenY = Math.max(20, chickenY-20);
      if(e.key==='ArrowDown') chickenY = Math.min(280, chickenY+20);
    }
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  window.showFugitiveChickenGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

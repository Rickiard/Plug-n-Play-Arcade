// Space Invaders Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-spaceinvaders';
  container.innerHTML = `
    <h2>Space Invaders</h2>
    <canvas id="si-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;"></canvas>
    <div id="si-score">Score: 0</div>
    <button id="si-back">Back</button>
  `;
  const canvas = container.querySelector('#si-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#si-score');
  const backBtn = container.querySelector('#si-back');
  let playerX, bullets, aliens, score, interval, running;

  function reset() {
    playerX = 180;
    bullets = [];
    aliens = [];
    score = 0;
    running = true;
    for(let r=0;r<3;r++) for(let c=0;c<8;c++) aliens.push({x:c*40+20,y:r*30+20,alive:true});
    scoreDiv.textContent = 'Score: 0';
    clearInterval(interval);
    interval = setInterval(gameLoop, 30);
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0,0,400,300);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(playerX,270,40,12);
    bullets.forEach(b => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x,b.y,4,12);
    });
    aliens.forEach(a => {
      if(a.alive) {
        ctx.fillStyle = '#a21caf';
        ctx.fillRect(a.x,a.y,32,16);
        ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; ctx.fillText('👾', a.x+4, a.y+14);
      }
    });
    scoreDiv.textContent = 'Score: '+score;
  }

  function gameLoop() {
    bullets.forEach(b => b.y -= 8);
    bullets = bullets.filter(b => b.y>-12);
    aliens.forEach(a => {
      if(a.alive) {
        a.x += Math.sin(Date.now()/500)*2;
        bullets.forEach(b => {
          if(b.x>a.x&&b.x<a.x+32&&b.y>a.y&&b.y<a.y+16) {
            a.alive=false; score+=10;
          }
        });
      }
    });
    draw();
    if(aliens.every(a=>!a.alive)) { running=false; clearInterval(interval); alert('You win! Score: '+score); }
  }

  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    playerX = Math.max(0, Math.min(360, e.clientX-rect.left-20));
  });
  canvas.addEventListener('click', function(e) {
    if(!running) return;
    const rect = canvas.getBoundingClientRect();
    bullets.push({x:playerX+18,y:270});
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  window.showSpaceInvadersGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

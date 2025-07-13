// Zombie Shooter Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-zombieshooter';
  container.innerHTML = `
    <h2>Zombie Shooter</h2>
    <canvas id="zs-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;"></canvas>
    <div id="zs-score">Score: 0</div>
    <button id="zs-back">Back</button>
  `;
  const canvas = container.querySelector('#zs-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#zs-score');
  const backBtn = container.querySelector('#zs-back');
  let zombies, score, interval, running;

  function reset() {
    score = 0;
    running = true;
    zombies = [];
    for(let i=0;i<5;i++) zombies.push({x:Math.random()*350+25,y:Math.random()*200+25,alive:true});
    scoreDiv.textContent = 'Score: 0';
    clearInterval(interval);
    interval = setInterval(gameLoop, 1000);
    draw();
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0,0,400,300);
    zombies.forEach(z => {
      if(z.alive) {
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(z.x, z.y, 20, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText('🧟', z.x-12, z.y+8);
      }
    });
    scoreDiv.textContent = 'Score: '+score;
  }

  function gameLoop() {
    zombies.forEach(z => {
      if(z.alive) {
        z.x += (Math.random()-0.5)*40;
        z.y += (Math.random()-0.5)*40;
        z.x = Math.max(20, Math.min(380, z.x));
        z.y = Math.max(20, Math.min(280, z.y));
      }
    });
    draw();
    if(zombies.every(z=>!z.alive)) {
      running=false; clearInterval(interval); alert('You win! Score: '+score);
    }
  }

  canvas.addEventListener('click', function(e) {
    if(!running) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX-rect.left, my = e.clientY-rect.top;
    zombies.forEach(z => {
      if(z.alive && Math.hypot(z.x-mx, z.y-my)<20) {
        z.alive = false; score++;
        draw();
      }
    });
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  });

  window.showZombieShooterGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

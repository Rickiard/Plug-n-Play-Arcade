(function() {
  const container = document.createElement('div');
  container.className = 'game-zombieshooter';
  container.innerHTML = `
    <h2>Zombie Shooter</h2>
    <canvas id="zs-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;border: 2px solid #fff;"></canvas>
    <div style="text-align:center; margin: 10px;">
      <span id="zs-score">Score: 0</span> |
      <span id="zs-ammo">Ammo: 6</span> |
      <button id="zs-reload">Reload</button>
    </div>
    <div style="text-align:center;">
      <button id="zs-restart">Restart</button>
      <button id="zs-back">Back</button>
    </div>
  `;

  const canvas = container.querySelector('#zs-canvas');
  const ctx = canvas.getContext('2d');
  const scoreSpan = container.querySelector('#zs-score');
  const ammoSpan = container.querySelector('#zs-ammo');
  const reloadBtn = container.querySelector('#zs-reload');
  const restartBtn = container.querySelector('#zs-restart');
  const backBtn = container.querySelector('#zs-back');

  const PLAYER_POS = {x: 200, y: 280}; // player position at bottom center
  const MAX_AMMO = 6;
  const ZOMBIE_RADIUS = 20;
  const ZOMBIE_SPEED = 0.5; // pixels per frame approx

  let zombies = [], score = 0, ammo = MAX_AMMO, running = false, animationFrameId;

  function reset() {
    score = 0;
    ammo = MAX_AMMO;
    running = true;
    zombies = [];
    for(let i = 0; i < 7; i++) {
      zombies.push({
        x: Math.random() * 360 + 20,
        y: Math.random() * 120 + 20,
        alive: true,
        health: 2, // each zombie needs 2 hits
        dyingProgress: 0
      });
    }
    scoreSpan.textContent = 'Score: 0';
    ammoSpan.textContent = 'Ammo: ' + ammo;
    reloadBtn.disabled = false;
    draw();
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player (just a rectangle for now)
    ctx.fillStyle = '#f87171'; // red
    ctx.fillRect(PLAYER_POS.x - 15, PLAYER_POS.y, 30, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('You', PLAYER_POS.x - 15, PLAYER_POS.y + 35);

    zombies.forEach(z => {
      if (z.alive) {
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(z.x, z.y, ZOMBIE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('🧟', z.x - 12, z.y + 8);

        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(z.x - ZOMBIE_RADIUS, z.y - ZOMBIE_RADIUS - 10, ZOMBIE_RADIUS * 2, 5);
        ctx.fillStyle = 'limegreen';
        ctx.fillRect(z.x - ZOMBIE_RADIUS, z.y - ZOMBIE_RADIUS - 10, (ZOMBIE_RADIUS * 2) * (z.health / 2), 5);
      } else if (z.dyingProgress < 1) {
        // death animation - fade out circle
        ctx.fillStyle = `rgba(132, 204, 22, ${1 - z.dyingProgress})`;
        ctx.beginPath();
        ctx.arc(z.x, z.y, ZOMBIE_RADIUS * (1 - z.dyingProgress), 0, Math.PI * 2);
        ctx.fill();
        z.dyingProgress += 0.02;
      }
    });

    scoreSpan.textContent = 'Score: ' + score;
    ammoSpan.textContent = 'Ammo: ' + ammo;
  }

  function gameLoop() {
    if (!running) return;

    // Move zombies toward player
    zombies.forEach(z => {
      if (z.alive) {
        let dx = PLAYER_POS.x - z.x;
        let dy = PLAYER_POS.y - z.y;
        let dist = Math.hypot(dx, dy);
        if(dist > 1) {
          z.x += (dx / dist) * ZOMBIE_SPEED;
          z.y += (dy / dist) * ZOMBIE_SPEED;
        }
        // Check if zombie reached player (game over)
        if(dist < ZOMBIE_RADIUS + 15) {
          running = false;
          alert('Game Over! Zombies got you!\nScore: ' + score);
          return;
        }
      }
    });

    draw();

    if (zombies.every(z => !z.alive && z.dyingProgress >= 1)) {
      running = false;
      alert('You win! Score: ' + score);
      return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  canvas.addEventListener('click', function(e) {
    if (!running) return;
    if(ammo <= 0) {
      alert('Out of ammo! Reload!');
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    let hit = false;
    zombies.forEach(z => {
      if (z.alive && Math.hypot(z.x - mx, z.y - my) < ZOMBIE_RADIUS) {
        z.health--;
        ammo--;
        ammoSpan.textContent = 'Ammo: ' + ammo;
        hit = true;
        if (z.health <= 0) {
          z.alive = false;
          score++;
          scoreSpan.textContent = 'Score: ' + score;
        }
      }
    });
    if (!hit) {
      ammo--;
      ammoSpan.textContent = 'Ammo: ' + ammo;
    }
  });

  reloadBtn.addEventListener('click', function() {
    if (!running) return;
    reloadBtn.disabled = true;
    ammoSpan.textContent = 'Reloading...';
    setTimeout(() => {
      ammo = MAX_AMMO;
      ammoSpan.textContent = 'Ammo: ' + ammo;
      reloadBtn.disabled = false;
    }, 2000);
  });

  restartBtn.addEventListener('click', () => {
    reset();
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    running = false;
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
  });

  window.showZombieShooterGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

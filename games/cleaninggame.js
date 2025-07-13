// Cleaning Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-cleaning';
  container.innerHTML = `
    <h2>Cleaning Game</h2>
    <canvas id="cl-canvas" width="400" height="300" style="background:#232946;display:block;margin:0 auto;"></canvas>
    <div id="cl-score">Cleaned: 0</div>
    <button id="cl-back">Back</button>
  `;
  const canvas = container.querySelector('#cl-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDiv = container.querySelector('#cl-score');
  const backBtn = container.querySelector('#cl-back');
  let spots, cleaned, running;

  function reset() {
    cleaned = 0;
    running = true;
    spots = [];
    for(let i=0;i<10;i++) spots.push({x:Math.random()*360+20,y:Math.random()*260+20,dirty:true});
    scoreDiv.textContent = 'Cleaned: 0';
    draw();
  }

  function draw() {
    ctx.fillStyle = '#232946';
    ctx.fillRect(0,0,400,300);
    spots.forEach(s => {
      if(s.dirty) {
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText('🧹', s.x-10, s.y+8);
      }
    });
    scoreDiv.textContent = 'Cleaned: '+cleaned;
  }

  canvas.addEventListener('click', function(e) {
    if(!running) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX-rect.left, my = e.clientY-rect.top;
    spots.forEach(s => {
      if(s.dirty && Math.hypot(s.x-mx, s.y-my)<16) {
        s.dirty = false; cleaned++;
        draw();
      }
    });
    if(spots.every(s=>!s.dirty)) {
      running=false; alert('All clean!');
    }
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
  });

  window.showCleaningGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

// Reflex Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-reflex';
  container.innerHTML = `
    <h2 class="text-center text-light">Reflex Game</h2>
    <p class="text-center text-light">Click the target before it disappears!</p>
    <div id="target" style="width:60px;height:60px;background:#06b6d4;border-radius:50%;position:absolute;display:none;cursor:pointer;"></div>
    <div id="score" class="fw-bold mb-2">Score: 0</div>
    <button id="startBtn" class="btn btn-primary m-2">Start Game</button>
    <button id="backBtn" class="btn btn-secondary m-2">Back</button>
  `;
  let score = 0;
  let timeout;
  const target = container.querySelector('#target');
  const scoreDiv = container.querySelector('#score');
  const startBtn = container.querySelector('#startBtn');
  const backBtn = container.querySelector('#backBtn');

  function randomPosition() {
    const w = window.innerWidth - 80;
    const h = window.innerHeight - 120;
    return [Math.random() * w, Math.random() * h];
  }

  function showTarget() {
    const [x, y] = randomPosition();
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.style.display = 'block';
    timeout = setTimeout(() => {
      target.style.display = 'none';
      endGame();
    }, 1200);
  }

  function startGame() {
    score = 0;
    scoreDiv.textContent = 'Score: 0';
    startBtn.disabled = true;
    showTarget();
  }

  function endGame() {
    alert('Game over! Your score: ' + score);
    startBtn.disabled = false;
    target.style.display = 'none';
    clearTimeout(timeout);
  }

  target.addEventListener('click', function() {
    score++;
    scoreDiv.textContent = 'Score: ' + score;
    target.style.display = 'none';
    clearTimeout(timeout);
    setTimeout(showTarget, 400);
  });

  startBtn.addEventListener('click', startGame);
  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
  });

  window.showReflexGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    gsap.from(container, {duration: 0.7, y: 50, opacity: 0, ease: 'power2.out'});
  };

  container.classList.add('shadow-lg', 'rounded', 'p-4', 'bg-dark');
  target.style.boxShadow = '0 0 12px #06b6d4';
})();

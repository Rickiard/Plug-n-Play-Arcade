// Reflex Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-container game-reflex';
  container.innerHTML = `
    <h2 class="text-center text-light mb-2">Reflex Game</h2>
    <div class="alert alert-info text-dark mb-3" style="background: #232946; color: #eebbc3; border: 1px solid #444; font-size:1.1rem; line-height:1.7; max-width:340px; margin:0 auto;">Click the target before it disappears!<br>Try to score as many points as possible.<br>Targets appear in random positions.</div>
    <div id="game-area" style="position:relative;width:340px;height:340px;margin:0 auto;">
      <div id="target" style="width:60px;height:60px;background:#06b6d4;border-radius:50%;position:absolute;display:none;cursor:pointer;box-shadow:0 0 16px #06b6d4;"></div>
    </div>
    <div id="score" class="game-score mb-2">Score: 0</div>
    <button id="startBtn" class="btn btn-primary mb-2" style="width:100%;">Start Game</button>
    <button id="backBtn" class="game-back mb-2" style="width:100%;">Back</button>
    <div id="reflex-modal" class="modal fade" tabindex="-1" style="display:none;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header">
            <h5 class="modal-title">Game Over</h5>
          </div>
          <div class="modal-body">
            <p id="reflex-final-score"></p>
            <button id="reflex-restart" class="btn btn-primary">Restart</button>
          </div>
        </div>
      </div>
    </div>
  `;
  let score = 0;
  let timeout;
  const target = container.querySelector('#target');
  const scoreDiv = container.querySelector('#score');
  const startBtn = container.querySelector('#startBtn');
  const backBtn = container.querySelector('#backBtn');
  const modal = container.querySelector('#reflex-modal');
  const finalScore = container.querySelector('#reflex-final-score');
  const restartBtn = container.querySelector('#reflex-restart');

  function randomPosition() {
    const area = container.querySelector('#game-area');
    const w = area.offsetWidth - 60;
    const h = area.offsetHeight - 60;
    return [Math.random() * w, Math.random() * h];
  }

  function showTarget() {
    const [x, y] = randomPosition();
    target.style.left = x + 'px';
    target.style.top = y + 'px';
    target.style.display = 'block';
    gsap.fromTo(target, {scale:0.2, opacity:0}, {scale:1, opacity:1, duration:0.3, ease:'back.out(2)'});
    timeout = setTimeout(() => {
      gsap.to(target, {scale:0.2, opacity:0, duration:0.3, onComplete:()=>{
        target.style.display = 'none';
        endGame();
      }});
    }, 1200);
  }

  function startGame() {
    score = 0;
    scoreDiv.textContent = 'Score: 0';
    startBtn.disabled = true;
    showTarget();
    hideModal();
  }

  function endGame() {
    startBtn.disabled = false;
    target.style.display = 'none';
    clearTimeout(timeout);
    showModal(score);
  }

  function showModal(score) {
    finalScore.textContent = 'Your score: ' + score;
    modal.style.display = 'block';
    modal.classList.add('show');
    modal.style.opacity = 1;
  }

  function hideModal() {
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.style.opacity = 0;
  }
  restartBtn.addEventListener('click', function() {
    hideModal();
    startGame();
  });

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

  // ...existing code...
})();

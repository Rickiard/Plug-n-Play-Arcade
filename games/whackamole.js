// Whack-A-Mole Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-whackamole';
  container.innerHTML = `
    <h2>Whack-A-Mole</h2>
    <div id="wam-board" style="display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);gap:12px;width:240px;margin:0 auto;"></div>
    <div id="wam-score">Score: 0</div>
    <button id="wam-back">Back</button>
  `;
  const boardDiv = container.querySelector('#wam-board');
  const scoreDiv = container.querySelector('#wam-score');
  const backBtn = container.querySelector('#wam-back');
  let mole, score, interval, running;

  function reset() {
    score = 0;
    running = true;
    mole = Math.floor(Math.random()*9);
    scoreDiv.textContent = 'Score: 0';
    draw();
    clearInterval(interval);
    interval = setInterval(nextMole, 900);
  }

  function draw() {
    boardDiv.innerHTML = '';
    for(let i=0;i<9;i++) {
      const cell = document.createElement('button');
      cell.style.width = cell.style.height = '60px';
      cell.style.fontSize = '2rem';
      cell.style.background = i===mole ? '#a21caf' : '#334155';
      cell.style.color = '#fff';
      cell.textContent = i===mole ? '🐹' : '';
      cell.onclick = () => {
        if(i===mole) { score++; scoreDiv.textContent = 'Score: '+score; nextMole(); }
      };
      boardDiv.appendChild(cell);
    }
  }

  function nextMole() {
    mole = Math.floor(Math.random()*9);
    draw();
  }

  backBtn.onclick = function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
    clearInterval(interval);
  };

  window.showWhackAMoleGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

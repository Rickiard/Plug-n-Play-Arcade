// Fruit Match Game (Memory Match)
(function() {
  const fruits = ['🍎','🍌','🍇','🍉','🍒','🍍','🥝','🍑'];
  const container = document.createElement('div');
  container.className = 'game-fruitmatch';
  container.innerHTML = `
    <h2>Fruit Match</h2>
    <div id="fm-board" style="display:grid;grid-template:repeat(4,1fr)/repeat(4,1fr);gap:6px;width:320px;margin:0 auto;"></div>
    <div id="fm-score">Matches: 0</div>
    <button id="fm-back">Back</button>
  `;
  const boardDiv = container.querySelector('#fm-board');
  const scoreDiv = container.querySelector('#fm-score');
  const backBtn = container.querySelector('#fm-back');
  let board, revealed, matched, first, second, matches;

  function reset() {
    let cards = fruits.concat(fruits);
    cards.sort(()=>Math.random()-0.5);
    board = cards;
    revealed = Array(16).fill(false);
    matched = Array(16).fill(false);
    first = null; second = null; matches = 0;
    scoreDiv.textContent = 'Matches: 0';
    draw();
  }

  function draw() {
    boardDiv.innerHTML = '';
    for(let i=0;i<16;i++) {
      const cell = document.createElement('button');
      cell.style.width = cell.style.height = '70px';
      cell.style.fontSize = '2rem';
      cell.style.background = matched[i] ? '#06b6d4' : (revealed[i] ? '#a21caf' : '#334155');
      cell.style.color = '#fff';
      cell.textContent = revealed[i]||matched[i] ? board[i] : '?';
      cell.onclick = () => {
        if(matched[i]||revealed[i]||second!==null) return;
        revealed[i] = true;
        if(first===null) first = i;
        else {
          second = i;
          setTimeout(checkMatch, 700);
        }
        draw();
      };
      boardDiv.appendChild(cell);
    }
  }

  function checkMatch() {
    if(board[first]===board[second]) {
      matched[first]=matched[second]=true;
      matches++;
      scoreDiv.textContent = 'Matches: '+matches;
      if(matches===8) alert('You win!');
    }
    revealed[first]=revealed[second]=false;
    first=second=null;
    draw();
  }

  backBtn.onclick = function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
  };

  window.showFruitMatchGame = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

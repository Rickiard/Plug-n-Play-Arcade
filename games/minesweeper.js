(function () {
  const container = document.createElement('div');
  container.className = 'game-minesweeper';
  container.innerHTML = `
    <h2 style="text-align:center;color:white;">Minesweeper</h2>
    <div id="ms-board" style="display:grid;grid-template:repeat(5,1fr)/repeat(5,1fr);gap:2px;width:250px;margin:0 auto;"></div>
    <div style="text-align:center;margin-top:1rem;">
      <button id="ms-reset">Reset</button>
      <button id="ms-back">Back</button>
    </div>
  `;

  const boardDiv = container.querySelector('#ms-board');
  const backBtn = container.querySelector('#ms-back');
  const resetBtn = container.querySelector('#ms-reset');
  let board, revealed, flagged, mines, gameOver;

  function reset() {
    board = Array(5).fill().map(() => Array(5).fill(0));
    revealed = Array(5).fill().map(() => Array(5).fill(false));
    flagged = Array(5).fill().map(() => Array(5).fill(false));
    mines = [];
    gameOver = false;

    while (mines.length < 5) {
      const r = Math.floor(Math.random() * 5), c = Math.floor(Math.random() * 5);
      if (board[r][c] !== '💣') {
        board[r][c] = '💣';
        mines.push([r, c]);
      }
    }

    for (let [r, c] of mines) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && board[nr][nc] !== '💣') {
            board[nr][nc]++;
          }
        }
      }
    }

    draw();
  }

  function reveal(r, c) {
    if (r < 0 || r >= 5 || c < 0 || c >= 5 || revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    if (board[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          reveal(r + dr, c + dc);
        }
      }
    }
  }

  function draw() {
    boardDiv.innerHTML = '';
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('button');
        cell.style.width = cell.style.height = '48px';
        cell.style.background = revealed[r][c] ? '#1e293b' : '#334155';
        cell.style.color = '#fff';
        cell.style.fontWeight = 'bold';
        cell.style.fontSize = '18px';
        cell.style.border = 'none';
        cell.style.cursor = 'pointer';

        if (flagged[r][c] && !revealed[r][c]) {
          cell.textContent = '🚩';
        } else if (revealed[r][c]) {
          if (board[r][c] === '💣') {
            cell.textContent = '💣';
            cell.style.background = '#dc2626';
          } else if (board[r][c] > 0) {
            cell.textContent = board[r][c];
          } else {
            cell.textContent = '';
          }
        } else {
          cell.textContent = '';
        }

        cell.onclick = () => {
          if (gameOver || revealed[r][c] || flagged[r][c]) return;
          if (board[r][c] === '💣') {
            revealed[r][c] = true;
            gameOver = true;
            revealAll();
            draw();
            alert('💥 Game Over!');
            return;
          }
          reveal(r, c);
          draw();
          if (checkWin()) {
            gameOver = true;
            alert('🎉 You Win!');
          }
        };

        cell.oncontextmenu = (e) => {
          e.preventDefault();
          if (gameOver || revealed[r][c]) return;
          flagged[r][c] = !flagged[r][c];
          draw();
        };

        boardDiv.appendChild(cell);
      }
    }
  }

  function revealAll() {
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        revealed[r][c] = true;
  }

  function checkWin() {
    let safeRevealed = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (revealed[r][c] && board[r][c] !== '💣') safeRevealed++;
      }
    }
    return safeRevealed === 25 - 5;
  }

  backBtn.onclick = function () {
    container.remove();
    document.getElementById('arcade').style.display = '';
  };

  resetBtn.onclick = reset;

  window.showMinesweeperGame = function () {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    reset();
  };
})();

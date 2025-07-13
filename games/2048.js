// 2048 Game
(function() {
  const container = document.createElement('div');
  container.className = 'game-2048 shadow-lg rounded p-4 bg-dark';
  container.innerHTML = `
    <h2 class="text-white">2048 Game</h2>
    <div id="board" style="width:256px;height:256px;background:#232946;display:grid;grid-template:repeat(4,1fr)/repeat(4,1fr);gap:4px;margin:0 auto;"></div>
    <div id="score" class="fw-bold mb-2 text-center" style="font-size:1.2rem;color:#eebbc3;background:#181e2a;padding:0.5rem 1rem;border-radius:0.5rem;box-shadow:0 1px 4px #0004;">Score: 0</div>
    <button id="backBtn" class="btn btn-secondary m-2">Back</button>
    <div id="gameMenu" class="modal fade" tabindex="-1" style="display:none;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header">
            <h5 class="modal-title" id="menuTitle">Game Over</h5>
          </div>
          <div class="modal-body">
            <p id="menuMessage"></p>
            <div class="fw-bold mb-2">Final Score: <span id="finalScore">0</span></div>
            <button id="restartBtn" class="btn btn-primary">Restart</button>
          </div>
        </div>
      </div>
    </div>
  `;
  let board, score, gameOver;
  const boardDiv = container.querySelector('#board');
  const scoreDiv = container.querySelector('#score');
  const backBtn = container.querySelector('#backBtn');
  const gameMenu = container.querySelector('#gameMenu');
  const menuTitle = container.querySelector('#menuTitle');
  const menuMessage = container.querySelector('#menuMessage');
  const finalScore = container.querySelector('#finalScore');
  const restartBtn = container.querySelector('#restartBtn');

  function reset() {
    board = Array(4).fill().map(()=>Array(4).fill(0));
    score = 0;
    gameOver = false;
    let animateCells = Array(4).fill().map(()=>Array(4).fill(null));
    addTile(animateCells); addTile(animateCells);
    draw(animateCells);
    hideMenu();
  }

  function addTile(animateCells) {
    let empty = [];
    for(let r=0;r<4;r++) for(let c=0;c<4;c++) if(!board[r][c]) empty.push([r,c]);
    if(empty.length) {
      let [r,c] = empty[Math.floor(Math.random()*empty.length)];
      board[r][c] = Math.random()<0.9?2:4;
      if (animateCells) animateCells[r][c] = 'new';
    }
  }

  function draw(animateCells) {
    boardDiv.innerHTML = '';
    let has2048 = false, hasEmpty = false;
    for(let r=0;r<4;r++) for(let c=0;c<4;c++) {
      const cell = document.createElement('div');
      cell.style.background = board[r][c] ? '#06b6d4' : '#334155';
      cell.style.color = '#fff';
      cell.style.fontSize = '1.5rem';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.height = '60px';
      cell.textContent = board[r][c]||'';
      cell.className = 'tile';
      boardDiv.appendChild(cell);
      if (board[r][c] === 2048) has2048 = true;
      if (!board[r][c]) hasEmpty = true;
      // Animate new or merged tiles
      if (animateCells && animateCells[r] && animateCells[r][c]) {
        if (animateCells[r][c] === 'new') {
          gsap.from(cell, {scale:0.2, opacity:0, duration:0.4, ease:'back.out(2)'});
        } else if (animateCells[r][c] === 'merged') {
          gsap.fromTo(cell, {background:'#fbbf24'}, {background:cell.style.background, duration:0.5});
          gsap.from(cell, {scale:1.3, duration:0.2, ease:'power1.out'});
        }
      }
    }
    scoreDiv.textContent = 'Score: '+score;
    // Win or lose check
    if (has2048 && !gameOver) {
      showMenu('You Win!', 'Congratulations! You reached 2048!', score);
      gameOver = true;
    } else if (!hasEmpty && !canMove() && !gameOver) {
      showMenu('Game Over', 'No more moves available.', score);
      gameOver = true;
    }
  }
  function canMove() {
    for(let r=0;r<4;r++) for(let c=0;c<4;c++) {
      if(!board[r][c]) return true;
      if(r<3 && board[r][c]===board[r+1][c]) return true;
      if(c<3 && board[r][c]===board[r][c+1]) return true;
    }
    return false;
  }
  function showMenu(title, message, score) {
    menuTitle.textContent = title;
    menuMessage.textContent = message;
    finalScore.textContent = score;
    gameMenu.style.display = 'block';
    gameMenu.classList.add('show');
    gameMenu.style.opacity = 1;
  }

  function hideMenu() {
    gameMenu.style.display = 'none';
    gameMenu.classList.remove('show');
    gameMenu.style.opacity = 0;
  }

  function move(dir) {
    if (gameOver) return;
    let animateCells = Array(4).fill().map(()=>Array(4).fill(null));
    function slide(row, rowIdx) {
      let arr = row.filter(x=>x);
      for(let i=0;i<arr.length-1;i++) {
        if(arr[i]===arr[i+1]) {
          arr[i]*=2; score+=arr[i]; arr[i+1]=0;
          let colIdx = row.indexOf(arr[i], i);
          animateCells[rowIdx][colIdx] = 'merged';
        }
      }
      arr = arr.filter(x=>x);
      while(arr.length<4) arr.push(0);
      return arr;
    }
    let old = JSON.stringify(board);
    if(dir==='left') board = board.map((row, i)=>slide(row, i));
    if(dir==='right') board = board.map((row, i)=>slide(row.reverse(), i).reverse());
    if(dir==='up') {
      for(let c=0;c<4;c++) {
        let col = slide([board[0][c],board[1][c],board[2][c],board[3][c]], c);
        for(let r=0;r<4;r++) board[r][c]=col[r];
      }
    }
    if(dir==='down') {
      for(let c=0;c<4;c++) {
        let col = slide([board[3][c],board[2][c],board[1][c],board[0][c]], c).reverse();
        for(let r=0;r<4;r++) board[r][c]=col[r];
      }
    }
    if(JSON.stringify(board)!==old) {
      addTile(animateCells);
      draw(animateCells);
    } else {
      draw();
    }
  }

  document.addEventListener('keydown', function(e) {
    if(container.parentNode && !gameOver) {
      if(e.key==='ArrowLeft') move('left');
      if(e.key==='ArrowRight') move('right');
      if(e.key==='ArrowUp') move('up');
      if(e.key==='ArrowDown') move('down');
    }
  });
  restartBtn.addEventListener('click', function() {
    reset();
  });

  backBtn.addEventListener('click', function() {
    container.remove();
    document.getElementById('arcade').style.display = '';
  });

  window.show2048Game = function() {
    document.getElementById('arcade').style.display = 'none';
    document.body.appendChild(container);
    gsap.from(container, {duration: 0.7, y: 50, opacity: 0, ease: 'power2.out'});
    reset();
  };
})();

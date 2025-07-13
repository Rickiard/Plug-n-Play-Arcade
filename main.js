const games = [
  { title: 'Reflex Game', description: 'Click the target before it disappears.', action: () => window.showReflexGame && window.showReflexGame() },
  { title: 'Snake', description: "Eat and grow, but don't hit the wall.", action: () => window.showSnakeGame && window.showSnakeGame() },
  { title: 'Pong', description: 'Classic table tennis game.', action: () => window.showPongGame && window.showPongGame() },
  { title: '2048', description: 'Combine tiles to reach 2048.', action: () => window.show2048Game && window.show2048Game() },
  { title: 'Tetris', description: 'Classic falling blocks puzzle.', action: () => window.showTetrisGame && window.showTetrisGame() },
  { title: 'Minesweeper', description: 'Avoid the explosive asteroids.', action: () => window.showMinesweeperGame && window.showMinesweeperGame() },
  { title: 'Fruit Match', description: 'Match 3 identical fruits.', action: () => window.showFruitMatchGame && window.showFruitMatchGame() },
  { title: 'Block Breaker', description: 'Destroy the blocks with a ball and paddle.', action: () => window.showBlockBreakerGame && window.showBlockBreakerGame() },
  { title: 'Zombie Shooter', description: 'Defeat the zombies.', action: () => window.showZombieShooterGame && window.showZombieShooterGame() },
  { title: 'Cleaning Game', description: 'Clean up the mess as fast as you can.', action: () => window.showCleaningGame && window.showCleaningGame() },
  { title: 'Fugitive Chicken', description: 'Run and avoid the obstacles.', action: () => window.showFugitiveChickenGame && window.showFugitiveChickenGame() },
  { title: 'Memory Match', description: 'Find all the matching pairs.', action: () => window.showMemoryMatchGame && window.showMemoryMatchGame() },
  { title: 'Space Invaders', description: 'Defend against the alien invasion.', action: () => window.showSpaceInvadersGame && window.showSpaceInvadersGame() },
  { title: 'Whack-A-Mole', description: 'Hit the moles as they pop up.', action: () => window.showWhackAMoleGame && window.showWhackAMoleGame() },
  { title: 'Flappy Bird', description: 'Fly through the pipes.', action: () => window.showFlappyBirdGame && window.showFlappyBirdGame() },
  { title: 'Color Switch', description: 'Pass through the matching colors.', action: () => window.showColorSwitchGame && window.showColorSwitchGame() },
];

const arcade = document.getElementById('arcade');
games.forEach(game => {
  const card = document.createElement('div');
  card.className = 'game-card';
  card.innerHTML = `<h3>${game.title}</h3><p>${game.description}</p>`;
  card.onclick = game.action;
  arcade.appendChild(card);
});

// Load all game scripts
[
  'games/reflex.js',
  'games/snake.js',
  'games/pong.js',
  'games/2048.js',
  'games/tetris.js',
  'games/minesweeper.js',
  'games/fruitmatch.js',
  'games/blockbreaker.js',
  'games/zombieshooter.js',
  'games/cleaninggame.js',
  'games/fugitivechicken.js',
  'games/memorymatch.js',
  'games/spaceinvaders.js',
  'games/whackamole.js',
  'games/flappybird.js',
  'games/colorswitch.js'
].forEach(src => {
  const script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
});

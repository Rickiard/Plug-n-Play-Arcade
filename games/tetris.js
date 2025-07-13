// Tetris Game
(function() {
    // --- Game Configuration Constants ---
    const BLOCK_SIZE = 20; // Size of each block in pixels
    const BOARD_WIDTH = 10; // Number of blocks wide
    const BOARD_HEIGHT = 20; // Number of blocks high
    const INITIAL_DROP_SPEED = 600; // milliseconds
    const SPEED_INCREMENT_PER_LEVEL = 50; // ms decrease per level
    const LINES_PER_LEVEL = 5; // Lines needed to advance a level

    // --- DOM Elements ---
    const container = document.createElement('div');
    container.className = 'game-container game-tetris';
    container.innerHTML = `
        <div class="tetris-main w-100" style="max-width:340px;">
            <h2 class="text-white text-center mb-2">Tetris Game</h2>
            <div class="mb-2 d-flex justify-content-center gap-2" id="tetris-menu">
                <button id="tetris-start" class="btn btn-success btn-sm">Start</button>
                <button id="tetris-pause" class="btn btn-warning btn-sm" disabled>Pause</button>
                <button id="tetris-resume" class="btn btn-info btn-sm" disabled>Resume</button>
            </div>
            <div class="d-flex justify-content-between align-items-end mb-2">
                <div class="text-white text-start">
                    <div id="tetris-level" class="fw-bold">Level: 0</div>
                    <div id="tetris-lines" class="fw-bold">Lines: 0</div>
                </div>
                <div id="tetris-next-piece" style="width:80px; height:80px; background:#181e2a; border-radius:0.5rem; display:flex; justify-content:center; align-items:center;">
                    <canvas id="tetris-next-canvas" width="80" height="80"></canvas>
                </div>
            </div>
            <canvas id="tetris-canvas" class="game-canvas" width="${BOARD_WIDTH * BLOCK_SIZE}" height="${BOARD_HEIGHT * BLOCK_SIZE}"></canvas>
            <div id="tetris-score" class="game-score mb-2">Score: 0</div>
            <button id="tetris-playagain" class="btn btn-primary mb-2" style="width:100%; display:none;">Play Again</button>
            <button id="tetris-back" class="game-back m-2" style="width:100%;">Back</button>
            <div class="tetris-instructions mt-3 w-100">
                <div class="alert alert-info text-dark mb-3" style="background: #232946; color: #eebbc3; border: 1px solid #444; font-size:1.1rem; line-height:1.7; max-height:180px; overflow-y:auto;">
                    <strong>Instructions:</strong><br>
                    <span class="badge bg-secondary">Arrow Left/Right</span>: Move block<br>
                    <span class="badge bg-secondary">Arrow Up</span>: Rotate block<br>
                    <span class="badge bg-secondary">Arrow Down</span>: Soft drop (drop faster)<br>
                    <span class="badge bg-secondary">Spacebar</span>: Hard drop (instant drop)<br>
                    Complete lines to score points.<br>
                    Game ends when blocks reach the top.
                </div>
            </div>
        </div>
    `;

    const canvas = container.querySelector('#tetris-canvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = container.querySelector('#tetris-next-canvas');
    const nextCtx = nextCanvas.getContext('2d');

    const scoreDiv = container.querySelector('#tetris-score');
    const levelDiv = container.querySelector('#tetris-level');
    const linesDiv = container.querySelector('#tetris-lines');
    const backBtn = container.querySelector('#tetris-back');
    const playAgainBtn = container.querySelector('#tetris-playagain');

    // Menu buttons
    const startBtn = container.querySelector('#tetris-start');
    const pauseBtn = container.querySelector('#tetris-pause');
    const resumeBtn = container.querySelector('#tetris-resume');

    // --- Game State Variables ---
    let board;
    let score;
    let level;
    let linesClearedTotal;
    let linesClearedThisLevel;
    let currentPiece;
    let nextPiece;
    let animationFrameId; // For requestAnimationFrame
    let dropInterval = INITIAL_DROP_SPEED;
    let lastDropTime = 0;
    let running = false;
    let paused = false; // Added pause state

    // --- Tetromino Shapes and Colors (Standard Tetris pieces) ---
    const shapes = [
        // I
        [[0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        // J
        [[1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        // L
        [[0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        // O
        [[1, 1],
            [1, 1]
        ],
        // S
        [[0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        // T
        [[0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        // Z
        [[1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ]
    ];
    const colors = ['#06b6d4', '#a21caf', '#f59e42', '#e11d48', '#84cc16', '#fbbf24', '#6366f1']; // Tailwind-like colors

    // --- Sound Effects (Placeholder paths, replace with actual files) ---
    const sounds = {
        move: new Audio('sounds/move.wav'), // Example: short click
        rotate: new Audio('sounds/rotate.wav'), // Example: short 'whoosh'
        drop: new Audio('sounds/drop.wav'), // Example: thud when piece lands
        lineClear: new Audio('sounds/line_clear.wav'), // Example: light chime
        tetris: new Audio('sounds/tetris.wav'), // Example: fanfare for Tetris
        gameOver: new Audio('sounds/game_over.wav') // Example: sad trombone or short jingle
    };

    // Preload sounds (optional, but good for smoother playback)
    for (const key in sounds) {
        if (sounds[key].src) {
            sounds[key].load();
            sounds[key].volume = 0.5; // Adjust volume as needed
        }
    }

    // --- Game Functions ---

    /**
     * Resets the game state to its initial values.
     */
    function resetGame() {
        board = Array(BOARD_HEIGHT).fill(0).map(() => Array(BOARD_WIDTH).fill(0));
        score = 0;
        level = 0;
        linesClearedTotal = 0;
        linesClearedThisLevel = 0;
        running = false;
        paused = false;

        clearInterval(animationFrameId); // Ensure any ongoing loop is stopped
        cancelAnimationFrame(animationFrameId);

        updateScoreDisplay();
        updateLevelDisplay();
        updateLinesDisplay();

        playAgainBtn.style.display = 'none';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;

        spawnNewPiece();
        drawGame(); // Initial draw of empty board and first piece
        drawNextPiece();
    }

    /**
     * Updates the score display.
     */
    function updateScoreDisplay() {
        scoreDiv.textContent = `Score: ${score}`;
    }

    /**
     * Updates the level display.
     */
    function updateLevelDisplay() {
        levelDiv.textContent = `Level: ${level}`;
    }

    /**
     * Updates the lines cleared display.
     */
    function updateLinesDisplay() {
        linesDiv.textContent = `Lines: ${linesClearedTotal}`;
    }

    /**
     * Generates a new random piece.
     * Uses a simple bag system to ensure all pieces appear once before repeating.
     */
    let pieceBag = [];

    function getRandomPiece() {
        if (pieceBag.length === 0) {
            // Refill and shuffle the bag
            pieceBag = Array.from({
                length: shapes.length
            }, (_, i) => i);
            for (let i = pieceBag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
            }
        }
        const idx = pieceBag.pop();
        return {
            shape: shapes[idx],
            color: colors[idx],
            x: Math.floor((BOARD_WIDTH - shapes[idx][0].length) / 2), // Center the piece horizontally
            y: 0
        };
    }

    /**
     * Spawns a new piece on the board.
     * Checks for game over condition.
     */
    function spawnNewPiece() {
        if (!nextPiece) {
            nextPiece = getRandomPiece();
        }
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();

        if (collide(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            // Game Over
            running = false;
            cancelAnimationFrame(animationFrameId);
            sounds.gameOver.play();
            alert(`Game over! Your score: ${score}\nLines Cleared: ${linesClearedTotal}\nLevel Reached: ${level}`);
            playAgainBtn.style.display = 'block';
            startBtn.disabled = true;
            pauseBtn.disabled = true;
            resumeBtn.disabled = true;
        }
        drawNextPiece();
    }

    /**
     * Draws the main game board and the current falling piece.
     */
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Draw background
        ctx.fillStyle = '#232946';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw settled blocks on the board
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                if (board[r][c]) {
                    drawBlock(ctx, c, r, board[r][c]);
                }
            }
        }

        // Draw ghost piece
        drawGhostPiece();

        // Draw current falling piece
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, currentPiece.color);
                }
            }
        }
    }

    /**
     * Draws the next piece in the preview area.
     */
    function drawNextPiece() {
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        // Center the next piece in its preview area
        const pieceWidth = nextPiece.shape[0].length;
        const pieceHeight = nextPiece.shape.length;
        const startX = (nextCanvas.width / BLOCK_SIZE / 2) - (pieceWidth / 2);
        const startY = (nextCanvas.height / BLOCK_SIZE / 2) - (pieceHeight / 2);

        for (let r = 0; r < pieceHeight; r++) {
            for (let c = 0; c < pieceWidth; c++) {
                if (nextPiece.shape[r][c]) {
                    drawBlock(nextCtx, startX + c, startY + r, nextPiece.color, BLOCK_SIZE * 0.8); // Slightly smaller
                }
            }
        }
    }

    /**
     * Draws a single block at given board coordinates.
     * @param {CanvasRenderingContext2D} context - The canvas context to draw on.
     * @param {number} x - Column index.
     * @param {number} y - Row index.
     * @param {string} color - Hex color string.
     * @param {number} [size=BLOCK_SIZE] - Size of the block.
     */
    function drawBlock(context, x, y, color, size = BLOCK_SIZE) {
        context.fillStyle = color;
        context.fillRect(x * size, y * size, size, size);
        context.strokeStyle = '#181e2a'; // Darker border for depth
        context.strokeRect(x * size, y * size, size, size);
    }

    /**
     * Draws the ghost piece (where the current piece would land).
     */
    function drawGhostPiece() {
        let ghostY = currentPiece.y;
        while (!collide(currentPiece.x, ghostY + 1, currentPiece.shape)) {
            ghostY++;
        }
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    // Draw a semi-transparent outline
                    ctx.strokeStyle = currentPiece.color + '80'; // Add transparency to color
                    ctx.strokeRect((currentPiece.x + c) * BLOCK_SIZE, (ghostY + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    /**
     * Checks for collision with board boundaries or other settled blocks.
     * @param {number} x - Proposed X position.
     * @param {number} y - Proposed Y position.
     * @param {Array<Array<number>>} shape - The shape to check.
     * @returns {boolean} True if collision occurs, false otherwise.
     */
    function collide(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    let boardX = x + c;
                    let boardY = y + r;

                    // Check horizontal boundaries
                    if (boardX < 0 || boardX >= BOARD_WIDTH) return true;
                    // Check bottom boundary
                    if (boardY >= BOARD_HEIGHT) return true;
                    // Check collision with existing blocks on the board
                    if (boardY >= 0 && board[boardY] && board[boardY][boardX]) return true;
                }
            }
        }
        return false;
    }

    /**
     * Merges the current piece into the board array.
     */
    function mergePiece() {
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    board[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
                }
            }
        }
        sounds.drop.play();
    }

    /**
     * Clears full lines from the board and updates score/level.
     * @returns {number} The number of lines cleared.
     */
    function clearLines() {
        let linesCleared = 0;
        for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
            if (board[r].every(x => x !== 0)) { // Check if row is full (not 0)
                board.splice(r, 1); // Remove the full row
                board.unshift(Array(BOARD_WIDTH).fill(0)); // Add a new empty row at the top
                linesCleared++;
                r++; // Recheck the new row at the same index
            }
        }

        if (linesCleared > 0) {
            linesClearedTotal += linesCleared;
            linesClearedThisLevel += linesCleared;

            // Score calculation based on standard Tetris rules (can be customized)
            switch (linesCleared) {
                case 1:
                    score += 100 * (level + 1);
                    sounds.lineClear.play();
                    break;
                case 2:
                    score += 300 * (level + 1);
                    sounds.lineClear.play();
                    break;
                case 3:
                    score += 500 * (level + 1);
                    sounds.lineClear.play();
                    break;
                case 4: // Tetris!
                    score += 800 * (level + 1);
                    sounds.tetris.play();
                    break;
            }
            updateScoreDisplay();
            updateLinesDisplay();

            // Level progression
            if (linesClearedThisLevel >= LINES_PER_LEVEL) {
                level++;
                linesClearedThisLevel -= LINES_PER_LEVEL; // Carry over excess lines
                updateLevelDisplay();
                updateGameSpeed();
            }
        }
        return linesCleared;
    }

    /**
     * Handles piece movement (left, right, down) and rotation.
     * @param {number} dx - Change in X position.
     * @param {number} dy - Change in Y position.
     * @param {boolean} rotateFlag - True to rotate, false otherwise.
     */
    function movePiece(dx, dy, rotateFlag) {
        if (!running || paused) return;

        let newShape = currentPiece.shape;
        if (rotateFlag) {
            newShape = rotate(currentPiece.shape);
        }

        if (!collide(currentPiece.x + dx, currentPiece.y + dy, newShape)) {
            currentPiece.x += dx;
            currentPiece.y += dy;
            if (rotateFlag) {
                currentPiece.shape = newShape;
                sounds.rotate.play();
            } else if (dx !== 0 || dy !== 0) { // Only play move sound if actually moving
                sounds.move.play();
            }
            drawGame();
            return true; // Move successful
        }
        return false; // Move failed due to collision
    }

    /**
     * Rotates a given shape 90 degrees clockwise.
     * @param {Array<Array<number>>} shape - The shape to rotate.
     * @returns {Array<Array<number>>} The rotated shape.
     */
    function rotate(shape) {
        // Transpose the matrix
        const rotated = shape[0].map((_, i) => shape.map(row => row[i]));
        // Reverse each row to get clockwise rotation
        return rotated.map(row => row.reverse());
    }

    /**
     * Instantly drops the current piece to the bottom.
     */
    function hardDrop() {
        if (!running || paused) return;

        let dropDistance = 0;
        while (!collide(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
            currentPiece.y++;
            dropDistance++;
        }
        mergePiece();
        clearLines();
        spawnNewPiece();
        drawGame();
        score += dropDistance * 2; // Score for hard drop
        updateScoreDisplay();
    }

    /**
     * Adjusts the game speed based on the current level.
     */
    function updateGameSpeed() {
        dropInterval = Math.max(50, INITIAL_DROP_SPEED - (level * SPEED_INCREMENT_PER_LEVEL));
        console.log(`Level: ${level}, Drop Speed: ${dropInterval}ms`); // For debugging
    }

    /**
     * Main game loop, handles automatic piece dropping.
     * Uses requestAnimationFrame for smoother animation.
     * @param {DOMHighResTimeStamp} currentTime - The current time provided by requestAnimationFrame.
     */
    function gameLoop(currentTime) {
        if (!running || paused) {
            animationFrameId = requestAnimationFrame(gameLoop); // Keep requesting to draw even if paused, but don't drop
            return;
        }

        animationFrameId = requestAnimationFrame(gameLoop);

        const deltaTime = currentTime - lastDropTime;
        if (deltaTime > dropInterval) {
            if (!movePiece(0, 1, false)) { // Attempt to move piece down
                mergePiece();
                clearLines();
                spawnNewPiece();
            }
            lastDropTime = currentTime;
        }
        drawGame(); // Redraw frequently for smooth movement
    }

    // --- Event Listeners ---

    // Play Again button
    playAgainBtn.addEventListener('click', function() {
        resetGame();
        gsap.from(canvas, {
            duration: 0.5,
            scale: 0.8,
            opacity: 0.5,
            ease: 'power2.out'
        });
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
    });

    // Menu buttons
    startBtn.addEventListener('click', function() {
        if (!running) {
            running = true;
            paused = false;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resumeBtn.disabled = true;
            lastDropTime = performance.now(); // Initialize for gameLoop
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    });

    pauseBtn.addEventListener('click', function() {
        if (running && !paused) {
            paused = true;
            pauseBtn.disabled = true;
            resumeBtn.disabled = false;
            // The gameLoop itself will handle not dropping when paused
        }
    });

    resumeBtn.addEventListener('click', function() {
        if (running && paused) {
            paused = false;
            pauseBtn.disabled = false;
            resumeBtn.disabled = true;
            lastDropTime = performance.now(); // Reset lastDropTime to avoid immediate drop after resuming
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    });

    document.addEventListener('keydown', function(e) {
        // Only respond to key presses if the Tetris container is in the DOM
        // and game is running and not paused.
        if (container.parentNode && running && !paused) {
            e.preventDefault(); // Prevent default browser actions for arrow keys/spacebar
            switch (e.key) {
                case 'ArrowLeft':
                    movePiece(-1, 0, false);
                    break;
                case 'ArrowRight':
                    movePiece(1, 0, false);
                    break;
                case 'ArrowDown':
                    movePiece(0, 1, false); // Soft drop
                    score += 1; // Small score for soft dropping
                    updateScoreDisplay();
                    break;
                case 'ArrowUp':
                    movePiece(0, 0, true); // Rotate
                    break;
                case ' ': // Spacebar for hard drop
                    hardDrop();
                    break;
            }
        }
    });

    backBtn.addEventListener('click', function() {
        // Stop the game loop and remove the container when going back
        cancelAnimationFrame(animationFrameId);
        running = false;
        paused = false; // Ensure pause state is reset
        container.remove();
        // Assuming there's a parent element with id 'arcade' to show
        document.getElementById('arcade').style.display = '';
    });

    // --- Global Function to Show Game ---
    window.showTetrisGame = function() {
        document.getElementById('arcade').style.display = 'none';
        document.body.appendChild(container);
        gsap.from(container, {
            duration: 0.7,
            y: 50,
            opacity: 0,
            ease: 'power2.out'
        });
        resetGame(); // Initialize game state when shown
    };
})();
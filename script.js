const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");
const scoreValue = document.getElementById("score");
const linesValue = document.getElementById("lines");
const levelValue = document.getElementById("level");
const toggleButton = document.getElementById("toggleButton");
const resetButton = document.getElementById("resetButton");
const overlay = document.getElementById("overlay");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
const PREVIEW_SIZE = 24;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
context.scale(BLOCK_SIZE, BLOCK_SIZE);

nextContext.scale(PREVIEW_SIZE, PREVIEW_SIZE);

const colors = [
  null,
  "#f97316",
  "#38bdf8",
  "#4ade80",
  "#facc15",
  "#a855f7",
  "#ef4444",
  "#22c55e",
];

const pieces = "TJLOSZI";

const createMatrix = (width, height) => {
  const matrix = [];
  while (height > 0) {
    matrix.push(new Array(width).fill(0));
    height -= 1;
  }
  return matrix;
};

const createPiece = (type) => {
  switch (type) {
    case "T":
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    case "J":
      return [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0],
      ];
    case "L":
      return [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
      ];
    case "O":
      return [
        [4, 4],
        [4, 4],
      ];
    case "S":
      return [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0],
      ];
    case "Z":
      return [
        [6, 6, 0],
        [0, 6, 6],
        [0, 0, 0],
      ];
    case "I":
      return [
        [0, 7, 0, 0],
        [0, 7, 0, 0],
        [0, 7, 0, 0],
        [0, 7, 0, 0],
      ];
    default:
      return [[0]];
  }
};

const arena = createMatrix(COLS, ROWS);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  next: null,
  score: 0,
  lines: 0,
  level: 1,
  dropInterval: 1000,
};

let dropCounter = 0;
let lastTime = 0;
let isPaused = false;
let isGameOver = false;

const drawMatrix = (matrix, offset, ctx) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        ctx.strokeStyle = "rgba(15, 23, 42, 0.5)";
        ctx.lineWidth = 0.05;
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
};

const draw = () => {
  context.fillStyle = "#0b1120";
  context.fillRect(0, 0, COLS, ROWS);
  drawMatrix(arena, { x: 0, y: 0 }, context);
  if (player.matrix) {
    drawMatrix(player.matrix, player.pos, context);
  }
};

const drawNext = () => {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextContext.fillStyle = "#0b1120";
  nextContext.fillRect(0, 0, 5, 5);

  if (!player.next) {
    return;
  }

  const previewOffset = {
    x: Math.floor((5 - player.next[0].length) / 2),
    y: Math.floor((5 - player.next.length) / 2),
  };

  drawMatrix(player.next, previewOffset, nextContext);
};

const collide = (matrix, playerPos) => {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (matrix[y][x] !== 0) {
        const arenaRow = arena[y + playerPos.y];
        if (arenaRow && arenaRow[x + playerPos.x] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
};

const merge = (matrix, playerPos) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + playerPos.y][x + playerPos.x] = value;
      }
    });
  });
};

const arenaSweep = () => {
  let rowCount = 0;
  outer: for (let y = arena.length - 1; y >= 0; y -= 1) {
    for (let x = 0; x < arena[y].length; x += 1) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y += 1;
    rowCount += 1;
  }

  if (rowCount > 0) {
    const points = [0, 40, 100, 300, 1200];
    player.score += points[rowCount] * player.level;
    player.lines += rowCount;

    if (player.lines >= player.level * 10) {
      player.level += 1;
      player.dropInterval = Math.max(1000 - (player.level - 1) * 80, 120);
    }
  }
};

const updateScore = () => {
  scoreValue.textContent = player.score.toString();
  linesValue.textContent = player.lines.toString();
  levelValue.textContent = player.level.toString();
};

const playerReset = () => {
  if (!player.next) {
    player.next = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  }

  player.matrix = player.next;
  player.next = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x =
    Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);

  if (collide(player.matrix, player.pos)) {
    isGameOver = true;
    overlay.querySelector("p").textContent = "Game Over";
    overlay.querySelector("span").textContent = "Press restart to play again.";
    overlay.style.display = "flex";
    isPaused = true;
  }

  drawNext();
};

const playerDrop = () => {
  player.pos.y += 1;
  if (collide(player.matrix, player.pos)) {
    player.pos.y -= 1;
    merge(player.matrix, player.pos);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
};

const playerMove = (direction) => {
  player.pos.x += direction;
  if (collide(player.matrix, player.pos)) {
    player.pos.x -= direction;
  }
};

const rotate = (matrix, direction) => {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < y; x += 1) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (direction > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
};

const playerRotate = (direction) => {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, direction);
  while (collide(player.matrix, player.pos)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -direction);
      player.pos.x = pos;
      return;
    }
  }
};

const hardDrop = () => {
  while (!collide(player.matrix, player.pos)) {
    player.pos.y += 1;
  }
  player.pos.y -= 1;
  merge(player.matrix, player.pos);
  playerReset();
  arenaSweep();
  updateScore();
  dropCounter = 0;
};

const togglePause = () => {
  isPaused = !isPaused;
  overlay.style.display = isPaused ? "flex" : "none";
  overlay.querySelector("p").textContent = isGameOver ? "Game Over" : "Paused";
  overlay.querySelector("span").textContent = isGameOver
    ? "Press restart to play again."
    : "Press P or click pause to resume.";
  toggleButton.textContent = isPaused ? "Resume" : "Pause";
};

const resetGame = () => {
  arena.forEach((row) => row.fill(0));
  player.score = 0;
  player.lines = 0;
  player.level = 1;
  player.dropInterval = 1000;
  player.next = null;
  isGameOver = false;
  isPaused = false;
  overlay.style.display = "none";
  toggleButton.textContent = "Pause";
  playerReset();
  updateScore();
};

const update = (time = 0) => {
  const delta = time - lastTime;
  lastTime = time;

  if (!isPaused) {
    dropCounter += delta;
    if (dropCounter > player.dropInterval) {
      playerDrop();
    }
    draw();
  }

  requestAnimationFrame(update);
};

window.addEventListener("keydown", (event) => {
  if (isPaused && event.key !== "p" && event.key !== "P") {
    return;
  }

  if (event.key === "ArrowLeft") {
    playerMove(-1);
  } else if (event.key === "ArrowRight") {
    playerMove(1);
  } else if (event.key === "ArrowDown") {
    playerDrop();
  } else if (event.key === "ArrowUp") {
    playerRotate(1);
  } else if (event.key === " ") {
    hardDrop();
  } else if (event.key === "p" || event.key === "P") {
    if (!isGameOver) {
      togglePause();
    }
  }
});

toggleButton.addEventListener("click", () => {
  if (!isGameOver) {
    togglePause();
  }
});

resetButton.addEventListener("click", () => {
  resetGame();
});

playerReset();
updateScore();
update();

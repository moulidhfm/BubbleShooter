const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 640;

const bubbleRadius = 15;
const rowCount = 5;
const colCount = 12;

let level = 1;
let score = 0;
let highScore = localStorage.getItem("bubbleHighScore") || 0;
let gameOver = false;

const baseColors = ["red", "green", "blue"];
const advancedColors = ["yellow", "purple", "cyan", "orange"];
let bubbleColors = [...baseColors];

const shootSound = new Audio("sounds/shoot.mp3");
const popSound = new Audio("sounds/pop.mp3");

let grid = [];

function generateGrid(rows = rowCount) {
  const newGrid = [];
  for (let row = 0; row < rows; row++) {
    newGrid[row] = [];
    for (let col = 0; col < colCount; col++) {
      const x = col * bubbleRadius * 2 + bubbleRadius;
      const y = row * bubbleRadius * 2 + bubbleRadius;
      const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
      newGrid[row][col] = { x, y, color, popped: false };
    }
  }
  return newGrid;
}

grid = generateGrid();

let bubble = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  dx: 0,
  dy: 0,
  radius: bubbleRadius,
  color: "cyan",
  moving: false
};

function drawGrid() {
  for (let row of grid) {
    for (let b of row) {
      if (!b.popped) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, bubbleRadius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawShooterBubble() {
  if (!gameOver) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.fill();
    ctx.closePath();
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, canvas.height - 40);
  ctx.fillText("High Score: " + highScore, 10, canvas.height - 20);
  ctx.fillText("Level: " + level, canvas.width - 100, canvas.height - 20);
}

function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 90, canvas.height / 2);
}

function dropNewRow() {
  for (let row of grid) {
    for (let b of row) {
      b.y += bubbleRadius * 2;
    }
  }

  const newRow = [];
  for (let col = 0; col < colCount; col++) {
    const x = col * bubbleRadius * 2 + bubbleRadius;
    const y = bubbleRadius;
    const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    newRow[col] = { x, y, color, popped: false };
  }

  grid.unshift(newRow);

  if (grid.some(row => row.some(b => b.y > canvas.height - 100))) {
    gameOver = true;
  }

  if (grid.length * bubbleRadius * 2 > canvas.height - 60) {
    grid.pop();
  }
}

function checkCollision() {
  for (let row of grid) {
    for (let b of row) {
      if (!b.popped) {
        const dx = bubble.x - b.x;
        const dy = bubble.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bubble.radius + bubbleRadius) {
          b.popped = true;
          score += 10;
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("bubbleHighScore", highScore);
          }
          if (score >= level * 50) {
            level++;
            dropNewRow();
            if (level === 2) bubbleColors = baseColors.concat(["yellow"]);
            if (level === 3) bubbleColors = baseColors.concat(advancedColors);
          }
          bubble.moving = false;
          bubble.y = canvas.height - 30;
          bubble.x = canvas.width / 2;
          bubble.color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
          popSound.play();
          return;
        }
      }
    }
  }
}

function update() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  if (bubble.moving) {
    const speed = 5 + level;
    bubble.x += bubble.dx * (speed / 5);
    bubble.y += bubble.dy * (speed / 5);

    if (bubble.x < bubble.radius || bubble.x > canvas.width - bubble.radius) {
      bubble.dx *= -1;
    }

    if (bubble.y < bubble.radius) {
      bubble.moving = false;
    }

    checkCollision();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawShooterBubble();
  drawScore();

  requestAnimationFrame(update);
}

canvas.addEventListener("click", (e) => {
  if (!bubble.moving && !gameOver) {
    const angle = Math.atan2(e.offsetY - bubble.y, e.offsetX - bubble.x);
    bubble.dx = Math.cos(angle);
    bubble.dy = Math.sin(angle);
    bubble.moving = true;
    shootSound.play();
  }
});

update();

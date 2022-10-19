import init, { World, Direction, GameStatus } from "snake_game";
import {rnd} from "./utils/rnd";

init().then((wasm) => {
  const CELL_SIZE = 30; // px
  const WORLD_WIDTH = 15;
  const snakeSpawnIdx = rnd(WORLD_WIDTH * WORLD_WIDTH);

  const world = World.new(WORLD_WIDTH, snakeSpawnIdx);
  const worldWidth = world.width();
  const scoreDiv = document.getElementById("score");
  const gameStatusDiv = document.getElementById("game-status");
  const gameControlBtn = document.getElementById("game-control-btn");
  const canvas = <HTMLCanvasElement> document.getElementById("snake-canvas");
  const ctx = canvas.getContext("2d");
  canvas.height = worldWidth * CELL_SIZE;
  canvas.width = canvas.height;

  gameControlBtn.addEventListener("click", () => {
    const gameStatus = world.game_status();
    if (gameStatus === undefined) {
      gameControlBtn.textContent = "Reload";
      world.start_game();
      play();
    } else {
      location.reload();
    }
  });

  const snakeCellPtr = world.snake_cells();
  const snakeLen = world.snake_length();

  document.addEventListener("keydown", event => {
    switch (event.code) {
      case "ArrowUp":
        world.change_snake_dir(Direction.Up);
        break;
      case "ArrowRight":
        world.change_snake_dir(Direction.Right);
        break;
      case "ArrowDown":
        world.change_snake_dir(Direction.Down);
        break;
      case "ArrowLeft":
        world.change_snake_dir(Direction.Left);
        break;
    }
  });

  paint();


  function drawWorld() {
    ctx.beginPath();

    // Draw vertical lines
    for (let x = 0; x < worldWidth + 1; x++) {
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, worldWidth * CELL_SIZE);
    }

    // Draw horizontal lines
    for (let y = 0; y < worldWidth + 1; y++) {
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(worldWidth * CELL_SIZE, y * CELL_SIZE);
    }

    ctx.stroke();
  }

  function drawGameStatus() {
    gameStatusDiv.textContent = world.game_status_text();
    scoreDiv.textContent = world.score().toString();
  }

  function paint() {
    drawWorld();
    drawSnake();
    drawReward();
    drawGameStatus();
  }

  function play() {
    const fps = 15;
    const status = world.game_status();
    if (status == GameStatus.Won || status == GameStatus.Lost) {
      gameControlBtn.textContent = "Replay";
      return;
    } 

    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      world.step();
      paint();
      requestAnimationFrame(play);
    }, 1000 / fps);

    paint();
  }

  function drawReward() {
    const rewardIdx = world.get_reward_cell();
    const col = rewardIdx % worldWidth;
    const row = Math.floor(rewardIdx / worldWidth);

    ctx.beginPath();
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.stroke();
  }

  function drawSnake() {
    const snakeCells = new Uint32Array(wasm.memory.buffer, world.snake_cells(), world.snake_length());

    snakeCells.forEach((wrldIdx, snakeCellIdx) => {
      const col = wrldIdx % worldWidth;
      const row = Math.floor(wrldIdx / worldWidth);

      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.stroke();
    })

    // Draw the head a different color. This is a differently-colored REdraw of the head
    // square, over the head square drawn with the body color.
    const headWorldIdx = snakeCells[0];
    const headCol = headWorldIdx % worldWidth;
    const headRow = Math.floor(headWorldIdx / worldWidth);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.fillRect(headCol * CELL_SIZE, headRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.stroke();
  }
});
